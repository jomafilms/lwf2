"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  Package,
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  plantId: string;
  plantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  notes?: string;
}

interface Order {
  id: string;
  nurseryId: string;
  status: "draft" | "submitted" | "confirmed" | "fulfilled" | "cancelled";
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  submittedAt?: string;
  confirmedAt?: string;
  fulfilledAt?: string;
  nurseryName?: string;
}

export default function OrdersPage() {
  const { data: session, isPending: authPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authPending && session?.user) {
      loadOrders();
    }
  }, [authPending, session]);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const { orders } = await res.json();
        
        // Enrich orders with nursery data
        const enrichedOrders = await Promise.all(
          orders.map(async (order: Order) => {
            if (order.nurseryId) {
              try {
                const nurseryRes = await fetch(`/api/nurseries/public/${order.nurseryId}`);
                if (nurseryRes.ok) {
                  const { data: nursery } = await nurseryRes.json();
                  return { ...order, nurseryName: nursery.name };
                }
              } catch {
                // Fall back to ID if nursery fetch fails
              }
            }
            return order;
          })
        );
        
        setOrders(enrichedOrders);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "confirmed":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "submitted":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "fulfilled":
        return "Ready for Pickup";
      case "cancelled":
        return "Cancelled";
      default:
        return "Draft";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || authPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading orders…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-500 mt-1">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">
              Start building plant lists and send them to nurseries to create your first order.
            </p>
            <Link
              href="/dashboard/lists"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Package className="w-4 h-4" />
              View My Lists
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.nurseryName || "Unknown Nursery"}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "submitted" ? "bg-orange-100 text-orange-700" :
                      order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                      order.status === "fulfilled" ? "bg-green-100 text-green-700" :
                      order.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted {formatDate(order.submittedAt || order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{order.items.length} plant{order.items.length !== 1 ? "s" : ""}</span>
                    </div>
                    {order.totalAmount > 0 && (
                      <div className="font-medium text-gray-900">
                        ${(order.totalAmount / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Plants Ordered</h4>
                  <div className="grid gap-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.plantName}</h5>
                          <p className="text-sm text-gray-500">
                            {item.size && `${item.size} • `}
                            Qty: {item.quantity}
                            {item.notes && ` • ${item.notes}`}
                          </p>
                        </div>
                        {item.totalPrice > 0 && (
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.totalPrice / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}