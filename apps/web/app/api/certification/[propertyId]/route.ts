/**
 * API Route: /api/certification/[propertyId]
 * 
 * Returns certification status and requirements for a property
 * based on existing property data and landscape plans.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, properties, plans } from '@lwf/database';
import { eq } from 'drizzle-orm';
import { assessCertificationStatus, getDetailedRequirementStatuses } from '../../../../lib/certification/assess';
import { CERTIFICATION_REQUIREMENTS, getRequirementsByCategories } from '../../../../lib/certification/requirements';
import type { PlanPlant } from '../../../../lib/scoring/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await params;

    // Fetch property data
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (property.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if user owns this property
    if (property[0].ownerId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch the most recent plan for this property
    const latestPlan = await db
      .select()
      .from(plans)
      .where(eq(plans.propertyId, propertyId))
      .orderBy(plans.createdAt)
      .limit(1);

    const propertyData = {
      fireZones: property[0].fireZones,
      structureFootprints: property[0].structureFootprints,
      assessment: property[0].assessment
    };

    const planData = latestPlan.length > 0 ? {
      plantPlacements: latestPlan[0].plantPlacements as PlanPlant[] || [],
      complianceScore: latestPlan[0].complianceScore
    } : {
      plantPlacements: [],
      complianceScore: null
    };

    // Assess certification status
    const certificationStatus = assessCertificationStatus(propertyData, planData);
    const requirementStatuses = getDetailedRequirementStatuses(propertyData, planData);
    
    // Group requirements by category for easier display
    const requirementsByCategory = getRequirementsByCategories();
    
    // Create response with detailed breakdown
    const response = {
      propertyId,
      propertyAddress: property[0].address,
      lastUpdated: new Date().toISOString(),
      
      // Overall status
      status: certificationStatus,
      
      // Detailed requirements
      requirements: CERTIFICATION_REQUIREMENTS.map(req => {
        const status = requirementStatuses.find(s => s.requirementId === req.id);
        return {
          ...req,
          status: status || { 
            requirementId: req.id, 
            met: false, 
            notes: 'Not assessed' 
          }
        };
      }),
      
      // Requirements organized by category
      requirementsByCategory: Object.entries(requirementsByCategory).reduce((acc, [category, reqs]) => {
        acc[category as keyof typeof requirementsByCategory] = reqs.map(req => {
          const status = requirementStatuses.find(s => s.requirementId === req.id);
          return {
            ...req,
            status: status || { 
              requirementId: req.id, 
              met: false, 
              notes: 'Not assessed' 
            }
          };
        });
        return acc;
      }, {} as Record<string, any>),
      
      // Summary statistics
      summary: {
        totalRequirements: CERTIFICATION_REQUIREMENTS.length,
        metRequirements: certificationStatus.metRequirements.length,
        progressPercentage: certificationStatus.progress,
        estimatedRemainingCost: certificationStatus.estimatedCost,
        eligible: certificationStatus.eligible,
        insuranceImpact: certificationStatus.insuranceImpact
      },
      
      // Plan context
      planInfo: latestPlan.length > 0 ? {
        planId: latestPlan[0].id,
        planName: latestPlan[0].name,
        totalPlants: planData.plantPlacements.length,
        plantsByZone: {
          zone0: planData.plantPlacements.filter(p => p.zone === 'zone0').length,
          zone1: planData.plantPlacements.filter(p => p.zone === 'zone1').length,
          zone2: planData.plantPlacements.filter(p => p.zone === 'zone2').length
        }
      } : null
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Certification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}