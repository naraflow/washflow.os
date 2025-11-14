import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Check } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { format } from "date-fns";
import { toast } from "sonner";

export const ReadyView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const updateOrder = useDashboardStore((state) => state.updateOrder);

  // Get orders ready for pickup
  const readyOrders = useMemo(() => {
    return orders.filter((order) => order.currentStage === 'ready');
  }, [orders]);

  const handleMarkPicked = (orderId: string) => {
    updateOrder(orderId, {
      currentStage: 'picked',
      completedStages: [
        ...(orders.find((o) => o.id === orderId)?.completedStages || []),
        'picked',
      ],
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    toast.success('Order marked as picked up');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ready for Pickup</h3>
        <Badge variant="outline">{readyOrders.length} orders</Badge>
      </div>

      {readyOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No orders ready for pickup. Completed orders will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {readyOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="space-y-3">
                <div>
                  <div className="font-semibold">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.customerPhone}
                  </div>
                </div>

                <div>
                  <Badge variant="outline">{order.serviceName || 'Service'}</Badge>
                  <div className="text-sm mt-1">
                    {order.weight} kg • Rp {order.totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Ready since: {format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm')}
                </div>

                {order.estimatedCompletion && (
                  <div className="text-xs text-muted-foreground">
                    Estimated: {order.estimatedCompletion}
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleMarkPicked(order.id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Picked
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

