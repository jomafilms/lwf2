"use client";

import { useState } from "react";
import { 
  Download, 
  FileText, 
  Check, 
  Filter,
  Printer,
  ChevronDown,
  Leaf
} from "lucide-react";

interface PlantData {
  id: string;
  name: string;
  scientificName: string;
  fireReluctance: "High" | "Moderate" | "Low";
  waterNeeds: "Low" | "Moderate" | "High";
  matureSize: string;
  type: "Native" | "Adapted" | "Non-native";
  zone: string;
}

// Mock plant data - in real implementation, this would come from the API
const mockPlants: PlantData[] = [
  {
    id: "1",
    name: "California Lilac",
    scientificName: "Ceanothus spp.",
    fireReluctance: "High",
    waterNeeds: "Low",
    matureSize: "3-8 feet",
    type: "Native",
    zone: "All zones"
  },
  {
    id: "2", 
    name: "Manzanita",
    scientificName: "Arctostaphylos spp.",
    fireReluctance: "High",
    waterNeeds: "Low",
    matureSize: "4-12 feet",
    type: "Native",
    zone: "All zones"
  },
  {
    id: "3",
    name: "Lavender",
    scientificName: "Lavandula spp.",
    fireReluctance: "High",
    waterNeeds: "Low",
    matureSize: "1-3 feet",
    type: "Adapted",
    zone: "Zone 1, 2"
  },
  {
    id: "4",
    name: "Oregon Grape",
    scientificName: "Mahonia aquifolium",
    fireReluctance: "Moderate",
    waterNeeds: "Low",
    matureSize: "3-6 feet",
    type: "Native",
    zone: "Zone 2, 3"
  },
  {
    id: "5",
    name: "Sage",
    scientificName: "Salvia spp.",
    fireReluctance: "High",
    waterNeeds: "Low",
    matureSize: "1-4 feet",
    type: "Native",
    zone: "All zones"
  },
  {
    id: "6",
    name: "Rock Rose",
    scientificName: "Cistus spp.",
    fireReluctance: "High",
    waterNeeds: "Low",
    matureSize: "2-6 feet",
    type: "Adapted",
    zone: "Zone 1, 2"
  },
  {
    id: "7",
    name: "Toyon",
    scientificName: "Heteromeles arbutifolia",
    fireReluctance: "Moderate",
    waterNeeds: "Low",
    matureSize: "8-15 feet",
    type: "Native",
    zone: "Zone 2, 3"
  },
  {
    id: "8",
    name: "Blue Fescue",
    scientificName: "Festuca glauca",
    fireReluctance: "High",
    waterNeeds: "Low",
    matureSize: "8-12 inches",
    type: "Adapted",
    zone: "All zones"
  }
];

export function CCRPlantListGenerator() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["High"]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Native", "Adapted"]);
  const [selectedZones, setSelectedZones] = useState<string[]>(["All zones", "Zone 1, 2", "Zone 2, 3"]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const filteredPlants = mockPlants.filter(plant => {
    const matchesCategory = selectedCategories.includes(plant.fireReluctance);
    const matchesType = selectedTypes.includes(plant.type);
    const matchesZone = selectedZones.some(zone => plant.zone.includes(zone) || plant.zone === "All zones");
    return matchesCategory && matchesType && matchesZone;
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleZoneToggle = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const generatePlantList = () => {
    setShowPrintPreview(true);
  };

  const printPlantList = () => {
    window.print();
  };

  const downloadHTML = () => {
    const html = generateHTMLContent();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hoa-fire-reluctant-plant-list.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHTMLContent = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Fire-Reluctant Plant List for CC&R Amendment</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2d5016; border-bottom: 2px solid #2d5016; padding-bottom: 10px; }
        h2 { color: #4a7729; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .fire-high { background-color: #dcfce7; }
        .fire-moderate { background-color: #fef3c7; }
        .native { color: #059669; font-weight: bold; }
        .adapted { color: #0369a1; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <h1>Fire-Reluctant Plants for Community Landscaping Standards</h1>
    <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Purpose:</strong> This list provides approved fire-reluctant plants for compliance with community fire safety landscaping requirements.</p>
    
    <h2>Approved Plant List</h2>
    <table>
        <thead>
            <tr>
                <th>Common Name</th>
                <th>Scientific Name</th>
                <th>Fire Reluctance</th>
                <th>Water Needs</th>
                <th>Mature Size</th>
                <th>Type</th>
                <th>Recommended Zones</th>
            </tr>
        </thead>
        <tbody>
            ${filteredPlants.map(plant => `
                <tr class="fire-${plant.fireReluctance.toLowerCase()}">
                    <td><strong>${plant.name}</strong></td>
                    <td><em>${plant.scientificName}</em></td>
                    <td>${plant.fireReluctance}</td>
                    <td>${plant.waterNeeds}</td>
                    <td>${plant.matureSize}</td>
                    <td class="${plant.type.toLowerCase()}">${plant.type}</td>
                    <td>${plant.zone}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>Fire Zone Definitions</h2>
    <ul>
        <li><strong>Zone 1 (0-30 feet):</strong> Extreme fire risk area around structures. Requires highest fire-reluctant plants.</li>
        <li><strong>Zone 2 (30-100 feet):</strong> High fire risk area. Moderate to high fire-reluctant plants recommended.</li>
        <li><strong>Zone 3 (100+ feet):</strong> Moderate fire risk area. All approved plants suitable.</li>
    </ul>
    
    <h2>Plant Type Classifications</h2>
    <ul>
        <li><strong>Native:</strong> Indigenous to the regional ecosystem</li>
        <li><strong>Adapted:</strong> Non-native but well-suited to local conditions</li>
        <li><strong>Non-native:</strong> Introduced species (use with caution)</li>
    </ul>
    
    <div class="footer">
        <p><strong>Source:</strong> Living With Fire (LWF) Database - Compiled from regional fire safety research and local adaptation studies.</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} for HOA CC&R Amendment</p>
        <p><strong>Note:</strong> This list should be reviewed annually and updated based on new research and local conditions.</p>
    </div>
</body>
</html>
    `;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CC&R Plant List Generator
        </h2>
        <p className="text-gray-600">
          Generate professional, printable plant lists for CC&R amendments and community landscaping standards.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Plant Selection
        </h3>

        <div className="space-y-6">
          {/* Fire Reluctance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fire Reluctance Level
            </label>
            <div className="flex flex-wrap gap-2">
              {["High", "Moderate", "Low"].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {selectedCategories.includes(category) && <Check className="inline h-4 w-4 mr-1" />}
                  {category} Fire Reluctance
                </button>
              ))}
            </div>
          </div>

          {/* Plant Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plant Type
            </label>
            <div className="flex flex-wrap gap-2">
              {["Native", "Adapted", "Non-native"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTypes.includes(type)
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {selectedTypes.includes(type) && <Check className="inline h-4 w-4 mr-1" />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Fire Zones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recommended Fire Zones
            </label>
            <div className="flex flex-wrap gap-2">
              {["All zones", "Zone 1, 2", "Zone 2, 3"].map((zone) => (
                <button
                  key={zone}
                  onClick={() => handleZoneToggle(zone)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedZones.includes(zone)
                      ? "bg-orange-100 text-orange-800 border border-orange-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {selectedZones.includes(zone) && <Check className="inline h-4 w-4 mr-1" />}
                  {zone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Selected Plants ({filteredPlants.length})
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={generatePlantList}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Preview List
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Common Name
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Scientific Name
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Fire Reluctance
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Water Needs
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Size
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPlants.map((plant) => (
                <tr key={plant.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                    {plant.name}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm italic text-gray-600">
                    {plant.scientificName}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      plant.fireReluctance === "High" 
                        ? "bg-green-100 text-green-800"
                        : plant.fireReluctance === "Moderate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {plant.fireReluctance}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                    {plant.waterNeeds}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                    {plant.matureSize}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <span className={`font-medium ${
                      plant.type === "Native" 
                        ? "text-green-600"
                        : plant.type === "Adapted"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}>
                      {plant.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No plants match your current filter selection. Try adjusting the filters above.
          </div>
        )}
      </div>

      {/* Export Options */}
      {filteredPlants.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Export Plant List
          </h3>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={downloadHTML}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Download HTML
            </button>
            
            <button
              onClick={printPlantList}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="h-5 w-5" />
              Print List
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>HTML Format:</strong> Professional formatting suitable for CC&R amendments, 
              including fire zone definitions and plant type classifications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}