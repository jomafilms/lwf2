import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Leaf,
  ArrowLeft,
  Search,
} from "lucide-react";

interface NurseryData {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  isRetail: boolean;
  isWholesale: boolean;
  servesLandscapers: boolean;
  inventory: InventoryItem[];
}

interface InventoryItem {
  id: string;
  botanicalName: string | null;
  commonName: string | null;
  price: number | null;
  containerSize: string | null;
  availability: string | null;
  lwfPlantId: string | null;
  lastUpdated: string | null;
}

async function getNurseryData(id: string): Promise<NurseryData | null> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const res = await fetch(`${baseUrl}/api/nurseries/public/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch nursery');
    }
    
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching nursery:', error);
    return null;
  }
}

export default async function PublicNurseryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; filter?: string }>;
}) {
  const { id } = await params;
  const { search = "", filter = "" } = await searchParams;
  
  const nursery = await getNurseryData(id);
  
  if (!nursery) {
    notFound();
  }

  // Filter inventory based on search and filters
  const filteredInventory = nursery.inventory.filter((item) => {
    const matchesSearch = !search || 
      item.botanicalName?.toLowerCase().includes(search.toLowerCase()) ||
      item.commonName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = !filter || 
      (filter === "in_stock" && item.availability === "in_stock") ||
      (filter === "fire_safe" && item.lwfPlantId);
    
    return matchesSearch && matchesFilter;
  });

  const inStockCount = nursery.inventory.filter(item => item.availability === "in_stock").length;
  const fireSafeCount = nursery.inventory.filter(item => item.lwfPlantId).length;
  
  const formatAddress = () => {
    const parts = [nursery.address, nursery.city, nursery.state, nursery.zip].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/nurseries"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Nurseries
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Logo placeholder */}
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 flex-shrink-0">
                <Building2 className="h-8 w-8 text-green-700" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{nursery.name}</h1>
                {formatAddress() && (
                  <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {formatAddress()}
                  </p>
                )}
                
                {/* Business type badges */}
                <div className="mt-2 flex gap-2">
                  {nursery.isRetail && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Retail
                    </span>
                  )}
                  {nursery.isWholesale && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Wholesale
                    </span>
                  )}
                  {nursery.servesLandscapers && (
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                      Landscapers
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Website */}
            <div className="flex flex-col gap-2 text-right">
              {nursery.website && (
                <a
                  href={nursery.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <Globe className="h-4 w-4" />
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              
              <div className="text-sm text-gray-600 space-y-1">
                {nursery.phone && (
                  <div className="flex items-center gap-1 justify-end">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${nursery.phone}`} className="hover:text-gray-900">
                      {nursery.phone}
                    </a>
                  </div>
                )}
                {nursery.email && (
                  <div className="flex items-center gap-1 justify-end">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${nursery.email}`} className="hover:text-gray-900">
                      {nursery.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {nursery.description && (
            <p className="mt-4 text-gray-700 max-w-3xl">{nursery.description}</p>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Inventory Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm border">
            <p className="text-2xl font-bold text-gray-900">{nursery.inventory.length}</p>
            <p className="text-sm text-gray-500">Total plants</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm border">
            <p className="text-2xl font-bold text-green-600">{inStockCount}</p>
            <p className="text-sm text-gray-500">In stock</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm border">
            <div className="flex items-center gap-1">
              <Leaf className="h-5 w-5 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{fireSafeCount}</p>
            </div>
            <p className="text-sm text-gray-500">Fire-resistant varieties</p>
          </div>
        </div>

        {/* Inventory List */}
        <div className="rounded-lg bg-white shadow-sm border">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Plants ({filteredInventory.length})
            </h2>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="p-8 text-center">
              <Leaf className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-gray-500">No plants available</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.botanicalName && (
                          <h3 className="font-medium text-gray-900 italic">
                            {item.botanicalName}
                          </h3>
                        )}
                        {item.lwfPlantId && (
                          <Link
                            href={`/plants/${item.lwfPlantId}`}
                            className="text-orange-600 hover:text-orange-700"
                            title="View fire-resistance data"
                          >
                            <Leaf className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                      
                      {item.commonName && (
                        <p className="text-sm text-gray-600 mb-1">{item.commonName}</p>
                      )}
                      
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {item.containerSize && (
                          <span>Container: {item.containerSize}</span>
                        )}
                        {item.availability && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              item.availability === "in_stock"
                                ? "bg-green-100 text-green-700"
                                : item.availability === "limited"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.availability === "out_of_stock"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.availability.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.price && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${(item.price / 100).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map placeholder */}
        {formatAddress() && (
          <div className="mt-6 rounded-lg bg-white p-4 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{formatAddress()}</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Open in Maps →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}