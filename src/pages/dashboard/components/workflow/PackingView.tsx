import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig } from "../../types/workflow";
import { format } from "date-fns";
import { toast } from "sonner";

export const PackingView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);
  const updateOrder = useDashboardStore((state) => state.updateOrder);

  // Get orders in packing stage
  const packingOrders = useMemo(() => {
    return orders
      .filter((order) => order.currentStage === 'packing')
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

  const handleMoveToReady = (orderId: string) => {
    const order = packingOrders.find((o) => o.id === orderId);
    if (!order) return;

    updateOrder(orderId, {
      currentStage: 'ready',
      completedStages: [
        ...(order.completedStages || []),
        'packing',
      ],
    });

    toast.success('Order moved to ready');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Packing</h3>
        <Badge variant="outline">{packingOrders.length} orders</Badge>
      </div>

      {packingOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No orders in packing. Orders will appear here after ironing is completed.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packingOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customerPhone}
                    </div>
                  </div>
                </div>

                <div>
                  <Badge variant="outline">{order.service?.name}</Badge>
                  <div className="text-sm mt-1">
                    {order.weight} kg • Rp {order.totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Order ID: <span className="font-mono">{order.id}</span></div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleMoveToReady(order.id)}
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Move to Ready
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

