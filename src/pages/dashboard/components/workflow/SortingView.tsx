import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig } from "../../types/workflow";
import { format } from "date-fns";
import { toast } from "sonner";

export const SortingView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);
  const updateOrder = useDashboardStore((state) => state.updateOrder);

  // Get orders in sorting stage
  const sortingOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const currentStage = order.currentStage || 'reception';
        return currentStage === 'sorting';
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

  const handleMoveToWashing = (orderId: string) => {
    const order = sortingOrders.find((o) => o.id === orderId);
    if (!order || !order.workflow) return;

    updateOrder(orderId, {
      currentStage: 'washing',
      completedStages: [
        ...(order.completedStages || []),
        'sorting',
      ],
    });

    toast.success('Order moved to washing');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sorting</h3>
        <Badge variant="outline">{sortingOrders.length} orders</Badge>
      </div>

      {sortingOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No orders in sorting. Orders will appear here after RFID assignment.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortingOrders.map((order) => (
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

                {order.rfidTagId && (
                  <div className="flex items-center gap-2 text-xs">
                    <Tag className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">RFID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {order.rfidTagId}
                    </Badge>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <div>Order ID: <span className="font-mono">{order.id}</span></div>
                  <div>Created: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleMoveToWashing(order.id)}
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Move to Washing
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

