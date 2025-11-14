import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wind } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig } from "../../types/workflow";
import { format } from "date-fns";
import { toast } from "sonner";

export const DryingView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);
  const machines = useDashboardStore((state) => state.machines);
  const updateOrder = useDashboardStore((state) => state.updateOrder);

  // Get orders in drying stage
  const dryingOrders = useMemo(() => {
    return orders
      .filter((order) => order.currentStage === 'drying')
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

  const handleMoveToNext = (orderId: string) => {
    const order = dryingOrders.find((o) => o.id === orderId);
    if (!order || !order.workflow) return;

    // Move to next stage (ironing if in workflow, otherwise packing or ready)
    const dryingIndex = order.workflow.stages.indexOf('drying');
    const nextStage = order.workflow.stages[dryingIndex + 1] || 'ready';

    updateOrder(orderId, {
      currentStage: nextStage,
      completedStages: [
        ...(order.completedStages || []),
        'drying',
      ],
    });

    toast.success(`Order moved to ${nextStage}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Drying</h3>
        <Badge variant="outline">{dryingOrders.length} orders</Badge>
      </div>

      {dryingOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No orders in drying stage. Orders will appear here after washing.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dryingOrders.map((order) => {
            const dryingIndex = order.workflow?.stages.indexOf('drying') || -1;
            const nextStage = order.workflow?.stages[dryingIndex + 1] || 'ready';
            const nextStageLabel = nextStage === 'ironing' ? 'Ironing' : nextStage === 'packing' ? 'Packing' : 'Ready';

            return (
              <Card key={order.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
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

                  {order.machine && (
                    <div className="text-xs text-muted-foreground">
                      Machine: {order.machine.name}
                      {order.machine.timer && (
                        <div>Remaining: {order.machine.timer.remaining} min</div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <div>Order ID: <span className="font-mono">{order.id}</span></div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleMoveToNext(order.id)}
                    className="w-full"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Move to {nextStageLabel}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

