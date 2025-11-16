/**
 * Supervisor Outlet - Tagging View
 * Enhanced version with RFID Lost Mode, multi-item tagging, and QR fallback
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order } from "../../types";
import { TaggingModal } from "../orders/TaggingModal";
import { OrderDetailsModal } from "../orders/OrderDetailsModal";
import { format } from "date-fns";
import { Radio, Eye, AlertCircle, Clock, CheckCircle2, Tag, AlertTriangle } from "lucide-react";

export const OutletTaggingView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTaggingModalOpen, setIsTaggingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filter orders that need tagging at outlet
  const pendingTaggingOrders = orders.filter(
    (order) => {
      // Orders created by kasir that need tagging
      if (order.taggingRequired && order.taggingStatus === 'pending') {
        return true;
      }
      // Backward compatibility: orders without taggingStatus but in reception stage
      if (!order.taggingStatus && (order.currentStage === 'reception' || !order.currentStage) && !order.rfidTagId) {
        return true;
      }
      return false;
    }
  );

  // Sort by urgency (express first, then by created date)
  const sortedOrders = [...pendingTaggingOrders].sort((a, b) => {
    if (a.express && !b.express) return -1;
    if (!a.express && b.express) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleStartTagging = (order: Order) => {
    setSelectedOrder(order);
    setIsTaggingModalOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleTagged = () => {
    setIsTaggingModalOpen(false);
    setSelectedOrder(null);
  };

  const getTotalWeight = (order: Order) => {
    return order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
  };

  const getServiceNames = (order: Order) => {
    return order.services?.map(s => s.serviceName).join(", ") || order.serviceName || "Layanan";
  };

  const getUrgency = (order: Order) => {
    const created = new Date(order.createdAt);
    const now = new Date();
    const minutesDiff = (now.getTime() - created.getTime()) / (1000 * 60);
    
    if (order.express) return { level: 'high', label: 'Express', color: 'bg-red-100 text-red-800' };
    if (minutesDiff > 60) return { level: 'high', label: 'Menunggu >1 jam', color: 'bg-orange-100 text-orange-800' };
    if (minutesDiff > 30) return { level: 'medium', label: 'Menunggu >30 menit', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'low', label: 'Baru', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tagging (RFID / QR Ready)</h2>
          <p className="text-muted-foreground">
            Order Belum Ditag (RFID Required) - {sortedOrders.length} order
          </p>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            Semua order sudah ditag!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tidak ada order yang menunggu tagging RFID.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedOrders.map((order) => {
            const urgency = getUrgency(order);
            const totalWeight = getTotalWeight(order);
            const serviceNames = getServiceNames(order);
            const hasPhotos = order.initialConditionPhotos && order.initialConditionPhotos.length > 0;

            return (
              <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left Section - Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">#{order.id}</h4>
                          {order.express && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Express
                            </Badge>
                          )}
                          <Badge className={urgency.color}>
                            {urgency.label}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-muted-foreground">{order.customerPhone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          Rp {(order.totalAmount || 0).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.paymentMethod === "cash" ? "Tunai" :
                           order.paymentMethod === "transfer" ? "Transfer" :
                           order.paymentMethod === "qris" ? "QRIS" : "Kredit"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Berat:</span>
                        <span className="ml-2 font-semibold">{totalWeight} kg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Layanan:</span>
                        <span className="ml-2 font-semibold">{serviceNames}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-semibold">
                          {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tag Status:</span>
                        <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      </div>
                    </div>

                    {order.rfidTagId && (
                      <div className="flex items-center gap-2 text-sm">
                        <Radio className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">RFID UID:</span>
                        <span className="font-mono font-semibold">{order.rfidTagId}</span>
                      </div>
                    )}

                    {hasPhotos && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Foto Kondisi Awal:</span>
                        <div className="flex gap-1">
                          {order.initialConditionPhotos?.slice(0, 3).map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Foto ${idx + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ))}
                          {order.initialConditionPhotos && order.initialConditionPhotos.length > 3 && (
                            <div className="w-12 h-12 flex items-center justify-center bg-muted rounded border text-xs">
                              +{order.initialConditionPhotos.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    <Button
                      onClick={() => handleStartTagging(order)}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <Radio className="h-4 w-4" />
                      Mulai Tag RFID
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(order)}
                      className="w-full gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Lihat Detail
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled
                        title="Harus tag RFID terlebih dahulu"
                      >
                        Menuju Sorting
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled
                        title="Belum ada tag"
                      >
                        Reprint Tag
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive"
                        disabled
                        title="Belum ada tag"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Tag Hilang
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isTaggingModalOpen && selectedOrder && (
        <TaggingModal
          order={selectedOrder}
          onClose={() => {
            setIsTaggingModalOpen(false);
            setSelectedOrder(null);
          }}
          onTagged={handleTagged}
        />
      )}

      {isDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
          onPrint={() => {}}
        />
      )}
    </div>
  );
};

