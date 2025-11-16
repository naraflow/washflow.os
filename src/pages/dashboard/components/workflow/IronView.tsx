import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig } from "../../types/workflow";
import { format } from "date-fns";
import { toast } from "sonner";

export const IronView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);
  const machines = useDashboardStore((state) => state.machines);
  const updateOrder = useDashboardStore((state) => state.updateOrder);

  // Get orders in ironing stage
  const ironingOrders = useMemo(() => {
    return orders
      .filter((order) => order.currentStage === 'ironing')
      .map((order) => {
        const service = services.find((s) => s.id === order.serviceId);
        return {
          ...order,
          service,
          workflow: service ? getWorkflowConfig(service.type) : null,
          machine: machines.find((m) => m.currentOrderId === order.id),
        };
      })
      .filter((order) => order.service);
  }, [orders, services, machines]);

  const handleMoveToPacking = (orderId: string) => {
    const order = ironingOrders.find((o) => o.id === orderId);
    if (!order) return;

    updateOrder(orderId, {
      currentStage: 'packing',
      completedStages: [
        ...(order.completedStages || []),
        'ironing',
      ],
    });

    toast.success('Order moved to packing');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ironing</h3>
        <Badge variant="outline">{ironingOrders.length} orders</Badge>
      </div>

      {ironingOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No orders in ironing stage. Orders requiring ironing will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ironingOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
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
                    {order.weight} kg • Rp {(order.totalAmount || 0).toLocaleString('id-ID')}
                  </div>
                </div>

                {order.machine && (
                  <div className="text-xs text-muted-foreground">
                    Machine: {order.machine.name}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <div>Order ID: <span className="font-mono">{order.id}</span></div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleMoveToPacking(order.id)}
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Move to Packing
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

