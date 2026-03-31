/**
 * CC&R Template Generation API
 * 
 * Generates HOA-ready landscaping rules that can be adopted into governing documents.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateCCRTemplate, formatCCRTemplateAsText } from "@/lib/compliance/ccr-template";
import type { CCRTemplateOptions } from "@/lib/compliance/ccr-template";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters for customization
    const options: CCRTemplateOptions = {
      associationName: searchParams.get("associationName") || undefined,
      communityType: (searchParams.get("communityType") as "residential" | "mixed-use" | "commercial") || "residential",
      firehazardLevel: (searchParams.get("firehazardLevel") as "high" | "moderate" | "low") || "moderate",
      includeInspectionProcess: searchParams.get("includeInspectionProcess") !== "false",
      includeMaintenance: searchParams.get("includeMaintenance") !== "false",
      includeGrandfathering: searchParams.get("includeGrandfathering") !== "false"
    };

    const format = searchParams.get("format") || "json";

    // Generate the template
    const template = generateCCRTemplate(options);

    if (format === "text") {
      const textOutput = formatCCRTemplateAsText(template);
      return new NextResponse(textOutput, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="CCR_Landscaping_Rules_${options.associationName || "Template"}.txt"`
        }
      });
    }

    return NextResponse.json(template);

  } catch (error) {
    console.error("Error generating CC&R template:", error);
    return NextResponse.json(
      { error: "Failed to generate CC&R template" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Allow POST for more complex customization options
    const options: CCRTemplateOptions = {
      associationName: body.associationName || "[Association Name]",
      communityType: body.communityType || "residential",
      firehazardLevel: body.firehazardLevel || "moderate",
      includeInspectionProcess: body.includeInspectionProcess !== false,
      includeMaintenance: body.includeMaintenance !== false,
      includeGrandfathering: body.includeGrandfathering !== false
    };

    const format = body.format || "json";

    const template = generateCCRTemplate(options);

    if (format === "text") {
      const textOutput = formatCCRTemplateAsText(template);
      return new NextResponse(textOutput, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="CCR_Landscaping_Rules_${options.associationName?.replace(/[^a-zA-Z0-9]/g, '_') || "Template"}.txt"`
        }
      });
    }

    return NextResponse.json(template);

  } catch (error) {
    console.error("Error generating CC&R template:", error);
    return NextResponse.json(
      { error: "Failed to generate CC&R template" },
      { status: 500 }
    );
  }
}