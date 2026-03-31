"use client";

import { useState } from "react";
import { 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle,
  Clock,
  Target,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  timeframe: "30-day" | "60-day" | "90-day";
  responsible: string;
  deliverables: string[];
  status: "pending" | "in-progress" | "completed";
}

const implementationSteps: TimelineStep[] = [
  // 30-day steps
  {
    id: "1",
    title: "Board Education & Planning",
    description: "Educate board members on fire-reluctant landscaping benefits and establish implementation framework.",
    timeframe: "30-day",
    responsible: "Board President, Property Manager",
    deliverables: [
      "Board presentation on fire safety benefits",
      "Review LWF plant database and recommendations",
      "Assess current community landscaping standards",
      "Identify potential resistance points and solutions"
    ],
    status: "pending"
  },
  {
    id: "2", 
    title: "Community Assessment",
    description: "Conduct baseline assessment of current landscaping compliance across the community.",
    timeframe: "30-day",
    responsible: "Property Manager, Landscape Committee",
    deliverables: [
      "Property-by-property fire risk assessment",
      "Identify priority areas for improvement",
      "Document current plant types and fire zones",
      "Create compliance baseline report"
    ],
    status: "pending"
  },
  {
    id: "3",
    title: "Draft CC&R Amendments",
    description: "Prepare legal amendments to community standards incorporating fire-reluctant landscaping requirements.",
    timeframe: "30-day", 
    responsible: "HOA Attorney, Board Secretary",
    deliverables: [
      "Draft CC&R amendment language",
      "Fire-reluctant plant list for inclusion",
      "Implementation timeline for residents",
      "Enforcement and compliance procedures"
    ],
    status: "pending"
  },
  // 60-day steps
  {
    id: "4",
    title: "Community Outreach & Education",
    description: "Launch comprehensive education campaign to prepare residents for upcoming changes.",
    timeframe: "60-day",
    responsible: "Communications Committee, Board Members",
    deliverables: [
      "Community newsletter announcing changes",
      "Educational workshops on fire-safe landscaping",
      "Individual property recommendations",
      "Q&A sessions with landscape professionals"
    ],
    status: "pending"
  },
  {
    id: "5",
    title: "Vendor Network Development",
    description: "Establish partnerships with local nurseries and landscaping contractors familiar with fire-reluctant plants.",
    timeframe: "60-day",
    responsible: "Landscape Committee, Property Manager",
    deliverables: [
      "Pre-approved contractor list",
      "Negotiate bulk pricing for plants",
      "Establish plant availability schedules",
      "Create installation timeline coordination"
    ],
    status: "pending"
  },
  {
    id: "6",
    title: "Resident Voting Process",
    description: "Present CC&R amendments to community for formal approval vote.",
    timeframe: "60-day",
    responsible: "Board President, Property Manager",
    deliverables: [
      "Official voting notice distribution",
      "Final CC&R amendment documentation", 
      "Resident information packets",
      "Community meeting and vote"
    ],
    status: "pending"
  },
  // 90-day steps
  {
    id: "7",
    title: "Implementation Launch",
    description: "Begin official rollout of new landscaping standards with resident support systems.",
    timeframe: "90-day",
    responsible: "Property Manager, Landscape Committee",
    deliverables: [
      "Implementation guidelines distribution",
      "Property-specific compliance deadlines",
      "Support resources for residents",
      "Monitoring and tracking system activation"
    ],
    status: "pending"
  },
  {
    id: "8",
    title: "Progress Monitoring & Support",
    description: "Provide ongoing support and track community-wide adoption progress.",
    timeframe: "90-day",
    responsible: "Landscape Committee, Property Manager",
    deliverables: [
      "Monthly progress reports",
      "Resident assistance program",
      "Compliance tracking dashboard",
      "Success story sharing"
    ],
    status: "pending"
  }
];

const resources = [
  {
    category: "Legal & Compliance",
    items: [
      "Sample CC&R amendment language",
      "HOA legal compliance checklist",
      "Insurance liability considerations",
      "Municipal fire code alignment"
    ]
  },
  {
    category: "Education & Communication",
    items: [
      "Resident education presentation templates",
      "Fire safety fact sheets",
      "Before/after landscaping examples",
      "Community newsletter templates"
    ]
  },
  {
    category: "Implementation",
    items: [
      "Contractor vetting guidelines",
      "Plant sourcing and purchasing guides",
      "Installation timeline templates",
      "Progress tracking spreadsheets"
    ]
  },
  {
    category: "Technical Resources",
    items: [
      "Fire zone mapping tools",
      "Plant selection decision trees", 
      "Water-wise irrigation planning",
      "Maintenance schedule templates"
    ]
  }
];

export function CommunityActionPlan() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"30-day" | "60-day" | "90-day" | "all">("all");
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [expandedResources, setExpandedResources] = useState<string[]>([]);

  const filteredSteps = selectedTimeframe === "all" 
    ? implementationSteps
    : implementationSteps.filter(step => step.timeframe === selectedTimeframe);

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const toggleResourceExpansion = (category: string) => {
    setExpandedResources(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const downloadActionPlan = () => {
    const content = generateActionPlanHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hoa-fire-safety-action-plan.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateActionPlanHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>HOA Fire-Safe Landscaping Implementation Action Plan</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2d5016; border-bottom: 3px solid #2d5016; padding-bottom: 10px; }
        h2 { color: #4a7729; margin-top: 30px; }
        h3 { color: #6b8e23; }
        .timeline { margin: 20px 0; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #4a7729; background: #f9f9f9; }
        .timeframe { background: #2d5016; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
        .deliverable { margin: 5px 0; padding-left: 20px; }
        .responsible { font-style: italic; color: #666; }
        ul { margin: 10px 0; }
        li { margin: 5px 0; }
        .resource-section { margin: 25px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <h1>HOA Fire-Safe Landscaping Implementation Action Plan</h1>
    <p><strong>Purpose:</strong> A comprehensive 90-day plan for implementing fire-reluctant landscaping standards in your HOA community.</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    
    <div class="timeline">
        ${implementationSteps.map(step => `
            <div class="step">
                <h3>
                    <span class="timeframe">${step.timeframe}</span> 
                    ${step.title}
                </h3>
                <p>${step.description}</p>
                <p class="responsible"><strong>Responsible:</strong> ${step.responsible}</p>
                <h4>Deliverables:</h4>
                <ul>
                    ${step.deliverables.map(deliverable => `<li class="deliverable">• ${deliverable}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>
    
    <h2>Implementation Resources</h2>
    ${resources.map(resource => `
        <div class="resource-section">
            <h3>${resource.category}</h3>
            <ul>
                ${resource.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `).join('')}
    
    <div class="footer">
        <p><strong>Source:</strong> Living With Fire (LWF) Community Implementation Framework</p>
        <p><strong>Support:</strong> For questions or additional resources, contact your LWF community liaison.</p>
    </div>
</body>
</html>
    `;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Community Action Plan
          </h2>
          <p className="text-gray-600">
            Step-by-step implementation guide for adopting fire-safe landscaping standards in your HOA.
          </p>
        </div>
        
        <button
          onClick={downloadActionPlan}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Plan
        </button>
      </div>

      {/* Timeline Filter */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Implementation Timeline
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "30-day", "60-day", "90-day"] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              {timeframe === "all" ? "All Phases" : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-900">90 Days</div>
              <div className="text-sm text-blue-600">Total Timeline</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-900">{implementationSteps.length}</div>
              <div className="text-sm text-green-600">Action Items</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50">
            <Users className="h-6 w-6 text-orange-600" />
            <div>
              <div className="text-lg font-bold text-orange-900">5+</div>
              <div className="text-sm text-orange-600">Stakeholders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Implementation Steps {selectedTimeframe !== "all" && `(${selectedTimeframe})`}
        </h3>
        
        {filteredSteps.map((step, index) => (
          <div key={step.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => toggleStepExpansion(step.id)}
              className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      step.timeframe === "30-day" 
                        ? "bg-blue-100 text-blue-800"
                        : step.timeframe === "60-day"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {step.timeframe}
                    </span>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      step.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : step.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {step.status === "completed" && <CheckCircle className="inline h-3 w-3 mr-1" />}
                      {step.status === "in-progress" && <Clock className="inline h-3 w-3 mr-1" />}
                      {step.status === "pending" && <AlertCircle className="inline h-3 w-3 mr-1" />}
                      {step.status.replace("-", " ")}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {index + 1}. {step.title}
                  </h4>
                  
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  {expandedSteps.includes(step.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
            
            {expandedSteps.includes(step.id) && (
              <div className="border-t bg-gray-50 p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Deliverables</h5>
                    <ul className="space-y-2">
                      {step.deliverables.map((deliverable, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Responsible Parties</h5>
                    <p className="text-sm text-gray-600 mb-4">{step.responsible}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Target className="h-4 w-4" />
                      Target completion: End of {step.timeframe} period
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resources Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Implementation Resources
        </h3>
        
        {resources.map((resource) => (
          <div key={resource.category} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => toggleResourceExpansion(resource.category)}
              className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  {resource.category}
                </h4>
                {expandedResources.includes(resource.category) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedResources.includes(resource.category) && (
              <div className="border-t bg-gray-50 p-6">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {resource.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Success Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Keys to Successful Implementation
        </h3>
        
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-blue-800">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            Start with education - informed residents are more supportive
          </li>
          <li className="flex items-start gap-2 text-blue-800">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            Build partnerships with local nurseries and landscapers early
          </li>
          <li className="flex items-start gap-2 text-blue-800">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            Provide ongoing support and celebrate progress milestones
          </li>
          <li className="flex items-start gap-2 text-blue-800">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            Be flexible with timelines while maintaining momentum
          </li>
        </ul>
      </div>
    </div>
  );
}