"use client";

import { useState } from "react";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  MessageCircle,
  Calendar,
  User,
  MapPin
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  customerId: string;
  customerType: 'homeowner' | 'landscaper';
  status: 'draft' | 'submitted' | 'confirmed' | 'fulfilled' | 'cancelled';
  items: Array<{
    plantId: string;
    plantName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    size?: string;
    notes?: string;
  }>;
  totalAmount: number;
  deliveryAddress?: any;
  contactInfo?: any;
  requestedDeliveryDate?: string;
  nurseryNotes?: string;
  estimatedReadyDate?: string;
  createdAt: string;
  submittedAt?: string;
}

interface Nursery {
  id: string;
  name: string;
}

interface NurseryOrdersManagerProps {
  nursery: Nursery;
  orders: Order[];
}

const STATUS_COLORS = {
  'submitted': 'bg-yellow-100 text-yellow-800',
  'confirmed': 'bg-blue-100 text-blue-800', 
  'fulfilled': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
} as const;

const STATUS_ICONS = {
  'submitted': Clock,
  'confirmed': Package,
  'fulfilled': CheckCircle,
  'cancelled': XCircle
} as const;

export function NurseryOrdersManager({ nursery, orders }: NurseryOrdersManagerProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    estimatedDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusUpdate)
      });

      if (response.ok) {
        // Refresh page or update local state
        window.location.reload();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'submitted').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    fulfilled: orders.filter(o => o.status === 'fulfilled').length
  };

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-neutral-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-neutral-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-neutral-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-neutral-600">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.fulfilled}</p>
                <p className="text-neutral-600">Fulfilled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-neutral-600">
                Orders from homeowners and landscapers will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.status as keyof typeof STATUS_ICONS] || Clock;
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription>
                          {order.items.length} items • ${(order.totalAmount / 100).toFixed(2)}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order #{order.id.slice(0, 8)}</DialogTitle>
                            <DialogDescription>
                              Submitted {new Date(order.submittedAt || order.createdAt).toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Customer info */}
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Customer
                                </h4>
                                <p className="text-sm">
                                  Type: {selectedOrder.customerType}
                                </p>
                                {selectedOrder.contactInfo && (
                                  <div className="text-sm space-y-1 mt-2">
                                    <p>Name: {selectedOrder.contactInfo.name}</p>
                                    <p>Email: {selectedOrder.contactInfo.email}</p>
                                    {selectedOrder.contactInfo.phone && (
                                      <p>Phone: {selectedOrder.contactInfo.phone}</p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Items */}
                              <div>
                                <h4 className="font-medium mb-2">Items Ordered</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-2 border rounded">
                                      <div>
                                        <p className="font-medium">{item.plantName}</p>
                                        {item.size && <p className="text-sm text-neutral-600">{item.size}</p>}
                                        {item.notes && <p className="text-sm text-neutral-500">Note: {item.notes}</p>}
                                      </div>
                                      <div className="text-right">
                                        <p>Qty: {item.quantity}</p>
                                        <p className="font-medium">${(item.totalPrice / 100).toFixed(2)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Status update */}
                              <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">Update Order Status</h4>
                                <div className="space-y-3">
                                  <Select
                                    value={statusUpdate.status}
                                    onValueChange={(value) => setStatusUpdate({...statusUpdate, status: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="confirmed">Confirm Order</SelectItem>
                                      <SelectItem value="fulfilled">Mark as Fulfilled</SelectItem>
                                      <SelectItem value="cancelled">Cancel Order</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <div>
                                    <Label htmlFor="estimated-date">Estimated Ready Date</Label>
                                    <Input
                                      id="estimated-date"
                                      type="date"
                                      value={statusUpdate.estimatedDate}
                                      onChange={(e) => setStatusUpdate({...statusUpdate, estimatedDate: e.target.value})}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="nursery-notes">Notes to Customer</Label>
                                    <Textarea
                                      id="nursery-notes"
                                      placeholder="Any special instructions or updates..."
                                      value={statusUpdate.notes}
                                      onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                                    />
                                  </div>

                                  <Button
                                    onClick={() => handleStatusUpdate(selectedOrder.id)}
                                    disabled={loading || !statusUpdate.status}
                                    className="w-full"
                                  >
                                    {loading ? 'Updating...' : 'Update Order'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600">
                      {order.items.map(item => `${item.quantity}x ${item.plantName}`).join(', ')}
                    </p>
                    <p className="text-sm">
                      Submitted: {new Date(order.submittedAt || order.createdAt).toLocaleDateString()}
                    </p>
                    {order.requestedDeliveryDate && (
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Requested: {new Date(order.requestedDeliveryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}