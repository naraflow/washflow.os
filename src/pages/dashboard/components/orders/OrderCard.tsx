import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Printer, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Order } from "../../types";
import { format } from "date-fns";
import { getOrderStatusFromWorkflow, getStatusColor, getStatusLabel } from "../../utils/orderStatus";

interface OrderCardProps {
  order: Order;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancel?: () => void;
  onPrint: () => void;
}

export const OrderCard = ({ order, onView, onEdit, onDelete, onCancel, onPrint }: OrderCardProps) => {
  // Get dynamic status based on workflow
  const dynamicStatus = getOrderStatusFromWorkflow(order);
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
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
              Rp {(order.totalAmount || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.paymentMethod === "cash" ? "Tunai" :
               order.paymentMethod === "transfer" ? "Transfer" :
               order.paymentMethod === "qris" ? "QRIS" : "Kredit"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView} title="Lihat Detail">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit} title="Edit Order">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint} title="Print Receipt">
              <Printer className="h-4 w-4" />
            </Button>
            {onCancel && order.status !== 'cancelled' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancel} 
                className="text-orange-600 hover:text-orange-700"
                title="Cancel Order"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete} 
              className="text-destructive hover:text-destructive"
              title="Delete Order"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

