import { NextRequest, NextResponse } from "next/server";

// Sample featured lists data
// In a real implementation, this could come from a database table or CMS
const FEATURED_LISTS = [
  {
    name: "Defense Zone Foundation Plants",
    organization: {
      type: "Fire Safe Council",
      name: "Marin County Fire Safe Council",
    },
    description: "Low-growing, fire-resistant plants perfect for the immediate area around your home. These carefully selected species provide beauty while maximizing safety.",
    plants: [
      {
        plantId: "lavandula-stoechas",
        commonName: "Spanish Lavender",
        botanicalName: "Lavandula stoechas",
        reason: "Excellent fire resistance, aromatic oils deter pests",
      },
      {
        plantId: "rosmarinus-officinalis",
        commonName: "Rosemary",
        botanicalName: "Rosmarinus officinalis",
        reason: "Dense, low-maintenance shrub with natural fire retardant properties",
      },
      {
        plantId: "agave-americana",
        commonName: "Century Plant",
        botanicalName: "Agave americana",
        reason: "High moisture content, architectural form, minimal maintenance",
      },
    ],
  },
  {
    name: "Native Pollinator Garden",
    organization: {
      type: "Conservation Group",
      name: "California Native Plant Society",
    },
    description: "Support local wildlife while creating fire-resistant landscaping. These native plants are adapted to our climate and support beneficial insects.",
    plants: [
      {
        plantId: "ceanothus-thyrsiflorus",
        commonName: "Blue Blossom",
        botanicalName: "Ceanothus thyrsiflorus",
        reason: "Native shrub, attracts pollinators, drought tolerant",
      },
      {
        plantId: "monarda-fistulosa",
        commonName: "Wild Bergamot",
        botanicalName: "Monarda fistulosa",
        reason: "Beloved by bees and butterflies, natural pest deterrent",
      },
    ],
  },
  {
    name: "Water-Wise Perennial Border",
    organization: {
      type: "Nursery",
      name: "Shooting Star Nursery",
    },
    description: "Beautiful, low-water perennials that thrive in our Mediterranean climate. Perfect for creating stunning garden borders with minimal irrigation.",
    plants: [
      {
        plantId: "penstemon-heterophyllus",
        commonName: "Foothill Penstemon",
        botanicalName: "Penstemon heterophyllus",
        reason: "Drought tolerant, vibrant flowers, attracts hummingbirds",
      },
      {
        plantId: "salvia-leucantha",
        commonName: "Mexican Bush Sage",
        botanicalName: "Salvia leucantha",
        reason: "Extended bloom season, deer resistant, architectural form",
      },
    ],
  },
];

/** GET /api/lists/featured — get featured plant lists */
export async function GET(req: NextRequest) {
  return NextResponse.json(FEATURED_LISTS);
}