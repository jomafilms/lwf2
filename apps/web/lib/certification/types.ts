/**
 * Types for the Insurance & Certification Tracker
 */

import type { CertificationRequirement } from './requirements';

export interface RequirementStatus {
  requirementId: string;
  met: boolean;
  notes?: string;
  completedAt?: Date;
  verifiedBy?: 'self' | 'professional' | 'inspector';
}

export interface CertificationProgress {
  propertyId: string;
  requirements: RequirementStatus[];
  overallProgress: number; // 0-100 percentage
  lastUpdated: Date;
  estimatedRemainingCost: {
    min: number;
    max: number;
  };
  nextSteps: string[];
}

export interface CertificationStatus {
  eligible: boolean;
  progress: number;
  metRequirements: string[];
  unmetRequirements: string[];
  estimatedCost: { min: number; max: number };
  insuranceImpact: 'high' | 'medium' | 'low';
}

export interface InsuranceProvider {
  name: string;
  offersWildfireDiscount: boolean;
  discountRange?: string; // e.g., "5-15%"
  requirements?: string[];
  contactInfo?: string;
}

// Common insurance providers and their wildfire policies
export const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  {
    name: 'State Farm',
    offersWildfireDiscount: true,
    discountRange: '5-15%',
    requirements: ['Wildfire Prepared Home Certification', 'Annual inspection'],
    contactInfo: 'Contact your State Farm agent'
  },
  {
    name: 'Farmers Insurance',
    offersWildfireDiscount: true,
    discountRange: '5-10%',
    requirements: ['Defensible space certification', 'Fire-resistant materials'],
    contactInfo: 'Ask about Farmers Fire Safety Program'
  },
  {
    name: 'USAA',
    offersWildfireDiscount: true,
    discountRange: '5-12%',
    requirements: ['Firewise Community participation', 'Defensible space'],
    contactInfo: 'Military members - call USAA'
  },
  {
    name: 'Allstate',
    offersWildfireDiscount: false,
    requirements: ['May consider for coverage eligibility'],
    contactInfo: 'Check with local agent for coverage options'
  },
  {
    name: 'Liberty Mutual',
    offersWildfireDiscount: false,
    requirements: ['Risk assessment for coverage'],
    contactInfo: 'Contact for risk evaluation'
  }
];