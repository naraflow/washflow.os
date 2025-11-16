import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "../../types";
import { format } from "date-fns";
import { Radio, Eye, ArrowRight, Printer, AlertTriangle } from "lucide-react";
import { getOrderStatusFromWorkflow, getStatusColor, getStatusLabel } from "../../utils/orderStatus";

interface SupervisorOrderCardProps {
  order: Order;
  onView: () => void;
  onTag?: () => void;
  onMoveToSorting?: () => void;
  onReprint?: () => void;
  onReportLost?: () => void;
  showTaggingActions?: boolean;
}

const getTagStatusColor = (status?: Order["taggingStatus"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "tagged":
      return "bg-green-100 text-green-800 border-green-200";
    case "lost":
      return "bg-red-100 text-red-800 border-red-200";
    case "replaced":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTagStatusLabel = (status?: Order["taggingStatus"]) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "tagged":
      return "Tagged";
    case "lost":
      return "Lost";
    case "replaced":
      return "Replaced";
    default:
      return "Unknown";
  }
};

export const SupervisorOrderCard = ({
  order,
  onView,
  onTag,
  onMoveToSorting,
  onReprint,
  onReportLost,
  showTaggingActions = false,
}: SupervisorOrderCardProps) => {
  // Get dynamic status based on workflow
  const dynamicStatus = getOrderStatusFromWorkflow(order);
  
  // Calculate total weight from services
  const totalWeight = order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
  const serviceNames = order.services?.map(s => s.serviceName).join(", ") || order.serviceName || "Layanan";
  const hasPhotos = order.initialConditionPhotos && order.initialConditionPhotos.length > 0;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Section - Order Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-lg">#{order.id}</h4>
                <Badge className={getStatusColor(dynamicStatus)}>
                  {getStatusLabel(dynamicStatus)}
                </Badge>
                {order.express && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Express
                  </Badge>
                )}
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
              <Badge className={getTagStatusColor(order.taggingStatus)} variant="outline" size="sm" style={{ marginLeft: '0.5rem' }}>
                {getTagStatusLabel(order.taggingStatus)}
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
          {showTaggingActions && order.taggingStatus === 'pending' && onTag && (
            <Button onClick={onTag} className="w-full gap-2" size="lg">
              <Radio className="h-4 w-4" />
              Tag RFID
            </Button>
          )}
          
          <Button variant="outline" onClick={onView} className="w-full gap-2">
            <Eye className="h-4 w-4" />
            Lihat Detail
          </Button>

          {order.taggingStatus === 'tagged' && onMoveToSorting && (
            <Button
              variant="outline"
              onClick={onMoveToSorting}
              className="w-full gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Menuju Sorting
            </Button>
          )}

          {order.taggingStatus === 'tagged' && (
            <div className="flex gap-2">
              {onReprint && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReprint}
                  className="flex-1"
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Reprint Tag
                </Button>
              )}
              {onReportLost && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReportLost}
                  className="flex-1 text-destructive"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Tag Hilang
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

