/**
 * InsuranceInfo Component
 * 
 * Displays information about insurance providers, discounts,
 * and the financial benefits of certification.
 */

'use client';

import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  ExternalLink,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { INSURANCE_PROVIDERS } from '../../../../../lib/certification/types';

export function InsuranceInfo() {
  const providersWithDiscounts = INSURANCE_PROVIDERS.filter(p => p.offersWildfireDiscount);
  const providersWithoutDiscounts = INSURANCE_PROVIDERS.filter(p => !p.offersWildfireDiscount);

  return (
    <div className="space-y-6">
      {/* Financial Impact */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Financial Impact
        </h3>
        
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900">Potential Savings</h4>
            <ul className="mt-2 text-sm text-green-800 space-y-1">
              <li>• Insurance discounts: 5-15% annually</li>
              <li>• Reduced wildfire damage risk</li>
              <li>• Increased property value</li>
              <li>• Better insurance coverage access</li>
            </ul>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-900">Investment Range</h4>
            <p className="mt-1 text-sm text-orange-800">
              Typical mitigation costs: $2,000 - $15,000 per property
            </p>
            <p className="mt-2 text-xs text-orange-700">
              <strong>Key insight:</strong> Zone 0 clearance (0-5ft) provides the highest 
              insurance value for the lowest cost.
            </p>
          </div>
        </div>
      </div>

      {/* Insurance Providers */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
          <Shield className="h-5 w-5 text-blue-600" />
          Insurance Providers
        </h3>

        {/* Providers with discounts */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Offers Wildfire Discounts
          </h4>
          {providersWithDiscounts.map((provider) => (
            <div key={provider.name} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{provider.name}</h5>
                  {provider.discountRange && (
                    <p className="text-sm text-green-600 font-medium">
                      {provider.discountRange} discount
                    </p>
                  )}
                  {provider.requirements && (
                    <ul className="mt-1 text-xs text-gray-600">
                      {provider.requirements.map((req, idx) => (
                        <li key={idx}>• {req}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {provider.contactInfo && (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {provider.contactInfo}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Providers without discounts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-gray-500" />
            Coverage Focus (No Specific Discounts)
          </h4>
          {providersWithoutDiscounts.map((provider) => (
            <div key={provider.name} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-700">{provider.name}</h5>
                  {provider.requirements && (
                    <ul className="mt-1 text-xs text-gray-600">
                      {provider.requirements.map((req, idx) => (
                        <li key={idx}>• {req}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {provider.contactInfo && (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {provider.contactInfo}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Market Context */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Market Context
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="font-medium text-amber-900">Industry Trend</p>
            <p className="mt-1 text-amber-800">
              State Farm CEO Ralph Bloomers indicated discounts for Wildfire Prepared Home 
              certificates are coming. Other insurers are following suit.
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-3">
            <p className="font-medium text-red-900">Coverage Crisis</p>
            <p className="mt-1 text-red-800">
              Many properties are losing insurance coverage in high-risk areas. 
              Certification can be the difference between coverage and no coverage.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <p className="font-medium text-blue-900">IBHS Standard</p>
            <p className="mt-1 text-blue-800">
              Cities are moving toward the Insurance Institute for Business & Home Safety 
              (IBHS) Wildfire Prepared Home standard as the certification benchmark.
            </p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Complete Zone 0 clearance</p>
              <p className="text-gray-600">Highest insurance impact for lowest cost</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Document compliance</p>
              <p className="text-gray-600">Take photos and keep maintenance records</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Contact your agent</p>
              <p className="text-gray-600">Ask about wildfire preparation discounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}