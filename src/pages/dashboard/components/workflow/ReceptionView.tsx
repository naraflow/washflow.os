import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Tag } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig } from "../../types/workflow";
import { format } from "date-fns";

export const ReceptionView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);
  const updateOrder = useDashboardStore((state) => state.updateOrder);

  // Get orders in reception stage (new orders or explicitly in reception)
  const receptionOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const currentStage = order.currentStage || 'reception';
        return currentStage === 'reception' || !order.currentStage;
      })
      .map((order) => {
        const service = services.find((s) => s.id === order.serviceId);
        return {
          ...order,
          service,
          workflow: service ? getWorkflowConfig(service.type) : null,
        };
      })
      .filter((order) => order.service);
  }, [orders, services]);

  const handleAssignRFID = (orderId: string) => {
    // Generate RFID tag
    const rfidCode = `RFID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    updateOrder(orderId, {
      currentStage: 'reception',
      completedStages: [],
      serviceType: receptionOrders.find((o) => o.id === orderId)?.service?.type,
    });
    
    // In real implementation, this would create an RFIDTag record
    console.log(`RFID ${rfidCode} assigned to order ${orderId}`);
  };

  const handleMoveToSorting = (orderId: string) => {
    const order = receptionOrders.find((o) => o.id === orderId);
    if (!order || !order.workflow) return;

    updateOrder(orderId, {
      currentStage: 'sorting',
      completedStages: ['reception'],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Orders</h3>
        <Badge variant="outline">{receptionOrders.length} orders</Badge>
      </div>

      {receptionOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No orders. New orders will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receptionOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="space-y-3">
                <div>
                  <div className="font-semibold">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.customerPhone}
                  </div>
                </div>

                <div>
                  <Badge variant="outline">{order.service?.name}</Badge>
                  <div className="text-sm mt-1">
                    {order.weight} kg • Rp {order.totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>

                <div className="flex gap-2">
                  {!order.rfidTagId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignRFID(order.id)}
                      className="flex-1"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Assign RFID
                    </Button>
                  )}
                  {order.rfidTagId && (
                    <Button
                      size="sm"
                      onClick={() => handleMoveToSorting(order.id)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Move to Sorting
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

