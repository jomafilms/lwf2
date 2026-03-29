/**
 * CC&R Template Generator
 * 
 * Generates HOA-ready landscaping rules text based on CWPP standards.
 * Designed to be directly usable in governing documents.
 */

export interface CCRTemplateOptions {
  associationName?: string;
  communityType?: 'residential' | 'mixed-use' | 'commercial';
  firehazardLevel?: 'high' | 'moderate' | 'low';
  includeInspectionProcess?: boolean;
  includeMaintenance?: boolean;
  includeGrandfathering?: boolean;
}

export interface CCRTemplate {
  title: string;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
  appendices: {
    id: string;
    title: string;
    content: string;
  }[];
  effectiveDate: string;
}

const PLANT_CATEGORIES = {
  highRisk: [
    "Plants with high oil content (eucalyptus, pine, cedar)",
    "Plants that retain dead material (pampas grass, fountain grass)",
    "Plants with loose bark or fibrous structure",
    "Invasive species with rapid growth rates",
    "Plants that accumulate significant dead material"
  ],
  moderateRisk: [
    "Plants requiring frequent irrigation in dry conditions",
    "Dense shrubs without regular maintenance",
    "Fast-growing plants that quickly exceed intended size",
    "Plants with seasonal die-back periods"
  ],
  lowRisk: [
    "Plants with high moisture content",
    "Fire-resistant native species adapted to local climate",
    "Succulents and plants with thick, fleshy leaves",
    "Plants with minimal dead material accumulation",
    "Well-maintained landscape plants with character scores above 60"
  ]
};

function generateFireZoneRequirements(hazardLevel: 'high' | 'moderate' | 'low'): string {
  const baseRequirements = `
**Zone 0 (0-5 feet from structures):**
- Only low-flammability plants with fire safety character scores of 60 or higher
- Minimum 5-foot clearance from building walls, decks, and overhangs
- No plant material under eaves or against structures
- Hardscaping (gravel, stone, concrete) preferred
- Any vegetation must be maintained in a green, healthy condition
- Remove dead vegetation immediately

**Zone 1 (5-30 feet from structures):**
- Fire-resistant plants with character scores of 50 or higher
- Plants must be suitable for intermediate defensible space zones
- Minimum 10-foot spacing between mature tree crowns
- Remove all ladder fuels (vegetation that connects ground to tree canopy)
- Prune tree branches to 8 feet above ground
- Maintain clear access for emergency personnel

**Zone 2 (30-100 feet from structures):**
- Thin vegetation to break fuel continuity
- Create fuel breaks every 30-50 feet in sloped areas
- Remove dead, diseased, and dying trees
- Maintain emergency access routes
- Consider native plant communities that support fire adaptation`;

  if (hazardLevel === 'high') {
    return baseRequirements + `

**Enhanced Requirements for High Fire Hazard Areas:**
- Zone 0 extended to 10 feet minimum
- Only plants with character scores of 70+ in Zone 1
- Additional fuel breaks required on slopes greater than 30%
- Annual professional fire safety inspection required`;
  }

  return baseRequirements;
}

function generatePlantGuidelines(): string {
  return `
**Prohibited Plant Categories:**
The following categories of plants are prohibited in all fire safety zones:

${PLANT_CATEGORIES.highRisk.map(item => `• ${item}`).join('\n')}

**Restricted Plant Categories:**
The following categories require special approval and maintenance plans:

${PLANT_CATEGORIES.moderateRisk.map(item => `• ${item}`).join('\n')}

**Preferred Plant Categories:**
The following categories are encouraged and require standard maintenance:

${PLANT_CATEGORIES.lowRisk.map(item => `• ${item}`).join('\n')}

**Plant Selection Criteria:**
All landscaping plants must meet the following criteria:
- Character score of 40 or higher (60+ preferred in Zone 0)
- Appropriate placement code for intended fire safety zone
- Compatible with local climate and soil conditions
- Support water conservation goals
- Consider wildlife and pollinator support where fire safety allows

**Data Source Reference:**
Plant character scores and placement codes shall be determined using the Living With Fire plant database or equivalent scientifically-based fire safety assessment tool approved by the Association.`;
}

function generateMaintenanceStandards(): string {
  return `
**General Maintenance Requirements:**
• Remove dead, dying, or diseased vegetation promptly
• Maintain plants in healthy, well-watered condition during fire season
• Prune vegetation regularly to prevent overgrowth
• Remove weeds and volunteer vegetation that may increase fire risk
• Clear gutters and roof areas of vegetation debris monthly during fire season

**Seasonal Maintenance Schedule:**
• **Spring:** Prune shrubs, remove winter debris, establish irrigation
• **Early Summer:** Complete major pruning before July 1
• **Fire Season (July-October):** Weekly removal of dead material
• **Fall/Winter:** Prepare plants for dormancy, structural pruning of trees

**Zone-Specific Maintenance:**
• **Zone 0:** Weekly inspection and maintenance during fire season
• **Zone 1:** Bi-weekly inspection, monthly maintenance tasks
• **Zone 2:** Monthly inspection, seasonal maintenance tasks

**Emergency Maintenance:**
During Red Flag Warning conditions or when fire activity is reported within 10 miles:
• Remove any accumulated dead vegetation immediately
• Ensure irrigation systems are functional
• Clear all emergency access routes
• Relocate stored materials away from structures if possible`;
}

function generateInspectionProcess(associationName: string): string {
  return `
**Annual Inspection Program:**
The ${associationName} shall conduct annual fire safety inspections of all properties to ensure readiness with these landscaping standards.

**Inspection Schedule:**
• Annual inspections conducted April-May before fire season
• Additional inspections may be conducted following Red Flag events
• New construction requires final landscaping inspection before occupancy

**Inspection Criteria:**
Properties will be evaluated for:
• Compliance with fire zone vegetation requirements
• Adherence to plant category guidelines
• Completion of required maintenance tasks
• Emergency access clearance
• Overall fire risk assessment

**Inspection Results:**
• **Compliant:** Property meets all requirements
• **Needs Improvement:** Minor corrections required within 30 days
• **Non-Compliant:** Major corrections required within 60 days

**Appeal Process:**
Property owners may appeal inspection results by:
1. Submitting written appeal within 15 days of notice
2. Providing professional fire safety assessment if disputed
3. Attending board hearing to present evidence
4. Receiving written decision within 30 days

**Enforcement:**
• First violation: Written notice with correction timeline
• Second violation: Fine of $[AMOUNT] plus correction requirement
• Continuing violation: Daily fines until readiness achieved
• Association may perform necessary work at owner expense if not corrected`;
}

function generateGrandfatheringClause(): string {
  return `
**Existing Landscaping (Grandfathering Provisions):**
Landscaping installed prior to the effective date of these regulations may continue under the following conditions:

• **Maintenance Requirement:** All existing vegetation must be maintained in readiness with the maintenance standards herein
• **Replacement Requirement:** When existing vegetation dies, is removed, or requires replacement, new plantings must comply with current plant selection guidelines
• **Safety Override:** The Association reserves the right to require removal of any vegetation that poses an immediate fire safety threat, regardless of installation date
• **Improvement Timeline:** Properties with existing landscaping needing attention are encouraged to achieve readiness within 5 years through natural replacement cycles

**Voluntary Upgrade Incentives:**
The Association may offer incentives for voluntary upgrade of existing landscaping:
• Recognition in community newsletters
• Reduced inspection frequency for demonstrably compliant properties
• Potential assessment credits where budgets allow
• Priority access to community fire safety resources`;
}

export function generateCCRTemplate(options: CCRTemplateOptions = {}): CCRTemplate {
  const {
    associationName = "[Association Name]",
    communityType = 'residential',
    firehazardLevel = 'moderate',
    includeInspectionProcess = true,
    includeMaintenance = true,
    includeGrandfathering = true
  } = options;

  const effectiveDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sections = [
    {
      id: "purpose",
      title: "1. Purpose and Authority",
      content: `
This regulation establishes landscaping standards for fire safety within ${associationName} to:
• Protect life and property from wildfire hazards
• Ensure compliance with Community Wildfire Protection Plan (CWPP) guidelines
• Maintain insurability of properties within the community
• Preserve property values through proactive fire risk management

This regulation is adopted under the authority granted in the Association's Declaration of Covenants, Conditions & Restrictions (CC&Rs) and applicable state law governing homeowner associations.

**Effective Date:** ${effectiveDate}

**Supersedes:** All prior landscaping regulations related to fire safety`
    },
    {
      id: "definitions",
      title: "2. Definitions",
      content: `
**Character Score:** A numerical rating (0-100) indicating a plant's fire safety characteristics based on scientific assessment of flammability, moisture content, and fire behavior.

**Defensible Space:** The area around structures where vegetation has been modified to reduce fire hazard while maintaining the ecological value of the landscape.

**Fire Safety Zone:** Designated areas around structures with specific vegetation management requirements (Zone 0: 0-5ft, Zone 1: 5-30ft, Zone 2: 30-100ft).

**Ladder Fuel:** Vegetation that allows fire to climb from ground level to tree canopy, such as shrubs and lower tree branches.

**Living With Fire Database:** The scientifically-based plant database maintained by fire safety experts providing character scores and placement recommendations.

**Placement Code:** An alphabetic designation (A, B, C, D) indicating appropriate fire safety zones for specific plants.

**Red Flag Warning:** National Weather Service alert for weather conditions that create extreme fire risk.`
    },
    {
      id: "zones",
      title: "3. Fire Safety Zone Requirements",
      content: generateFireZoneRequirements(firehazardLevel)
    },
    {
      id: "plants",
      title: "4. Plant Selection Guidelines",
      content: generatePlantGuidelines()
    }
  ];

  if (includeMaintenance) {
    sections.push({
      id: "maintenance",
      title: "5. Maintenance Standards",
      content: generateMaintenanceStandards()
    });
  }

  if (includeInspectionProcess) {
    sections.push({
      id: "inspection",
      title: "6. Inspection and Enforcement",
      content: generateInspectionProcess(associationName)
    });
  }

  sections.push({
    id: "compliance",
    title: "7. Implementation and Compliance",
    content: `
**Professional Consultation:**
Property owners are encouraged to consult with landscape professionals familiar with fire-safe landscaping principles. The Association may maintain a list of qualified professionals.

**Compliance Documentation:**
Property owners may be required to provide:
• Landscaping plans for new installations
• Plant lists with character scores for major renovations
• Professional fire safety assessments for disputed compliance

**Community Resources:**
The Association will provide:
• Access to plant database and selection tools
• Educational materials on fire-safe landscaping
• Regular community workshops on fire safety practices
• Coordination with local fire safety agencies

**Emergency Modifications:**
During extreme fire conditions, the Association may require temporary additional measures such as:
• Additional vegetation removal
• Enhanced irrigation schedules
• Temporary relocation of combustible materials
• Installation of emergency fire suppression equipment`
  });

  const appendices = [
    {
      id: "resources",
      title: "Appendix A: Resources and References",
      content: `
**Fire Safety Resources:**
• Living With Fire Plant Database: [URL to be provided]
• NFPA 1144: Standard for Reducing Structure Ignition Hazards
• Firewise USA Program: www.nfpa.org/firewise
• Oregon Department of Forestry: www.oregon.gov/odf

**Professional Resources:**
• Oregon Association of Landscape Professionals
• Certified Arborists (ISA Certified)
• Fire-safe landscape designers
• Local fire district prevention offices

**Community Emergency Contacts:**
• [Local Fire District]: [Phone Number]
• Emergency Management: [Phone Number]
• Association Management: [Phone Number]
• 24-Hour Emergency Line: [Phone Number]`
    }
  ];

  if (includeGrandfathering) {
    appendices.push({
      id: "grandfathering",
      title: "Appendix B: Existing Landscaping Provisions",
      content: generateGrandfatheringClause()
    });
  }

  appendices.push({
    id: "forms",
    title: "Appendix C: Required Forms",
    content: `
**Form 1: Landscaping Plan Submission**
Required for new landscaping projects exceeding $[AMOUNT] or involving changes to fire safety zones.

**Form 2: Fire Safety Compliance Certification**
Self-certification form for annual compliance verification.

**Form 3: Professional Assessment Request**
Application for professional fire safety assessment in case of compliance disputes.

**Form 4: Hardship Exemption Application**
Application for temporary exemption due to financial or other hardship conditions.

**Form 5: Emergency Vegetation Removal Notification**
Notification form for emergency vegetation removal outside normal approval process.

*[Note: Actual forms to be developed by Association board and management company]*`
  });

  return {
    title: `Fire Safety Landscaping Regulations - ${associationName}`,
    sections,
    appendices,
    effectiveDate
  };
}

export function formatCCRTemplateAsText(template: CCRTemplate): string {
  let output = `${template.title}\n`;
  output += `${'='.repeat(template.title.length)}\n\n`;
  output += `Effective Date: ${template.effectiveDate}\n\n`;

  // Sections
  for (const section of template.sections) {
    output += `${section.title}\n`;
    output += `${'-'.repeat(section.title.length)}\n`;
    output += `${section.content.trim()}\n\n`;
  }

  // Appendices
  for (const appendix of template.appendices) {
    output += `${appendix.title}\n`;
    output += `${'-'.repeat(appendix.title.length)}\n`;
    output += `${appendix.content.trim()}\n\n`;
  }

  output += `\n---\nGenerated by Living With Fire Platform\n`;
  output += `For questions about this template, consult qualified legal counsel familiar with HOA governance.\n`;

  return output;
}