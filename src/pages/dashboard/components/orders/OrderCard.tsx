import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Order } from "../../types";
import { format } from "date-fns";

interface OrderCardProps {
  order: Order;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPrint: () => void;
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ready":
      return "bg-green-100 text-green-800 border-green-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "processing":
      return "Diproses";
    case "ready":
      return "Siap";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
};

export const OrderCard = ({ order, onView, onEdit, onDelete, onPrint }: OrderCardProps) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-lg">#{order.id}</h4>
            <Badge className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
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
            <p className="text-muted-foreground">
              {order.serviceName || "Layanan"} - {order.weight} kg
            </p>
            <p className="text-muted-foreground">
              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              Rp {order.totalAmount.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.paymentMethod === "cash" ? "Tunai" :
               order.paymentMethod === "transfer" ? "Transfer" :
               order.paymentMethod === "qris" ? "QRIS" : "Kredit"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

