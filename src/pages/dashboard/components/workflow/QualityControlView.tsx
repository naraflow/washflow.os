import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig } from "../../types/workflow";
import { format } from "date-fns";
import { toast } from "sonner";

export const QualityControlView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);
  const qualityControls = useDashboardStore((state) => state.qualityControls);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const addQualityControl = useDashboardStore((state) => state.addQualityControl);

  // Get orders in QC stage
  const qcOrders = useMemo(() => {
    return orders
      .filter((order) => order.currentStage === 'qc')
      .map((order) => {
        const service = services.find((s) => s.id === order.serviceId);
        const qc = qualityControls.find((qc) => qc.orderId === order.id);
        return {
          ...order,
          service,
          workflow: service ? getWorkflowConfig(service.type) : null,
          qc,
        };
      })
      .filter((order) => order.service);
  }, [orders, services, qualityControls]);

  const handleQCPass = (orderId: string) => {
    addQualityControl({
      id: `qc-${Date.now()}`,
      orderId,
      qualityScore: 5,
      passed: true,
      issues: [],
      checkedAt: new Date().toISOString(),
    });

    updateOrder(orderId, {
      currentStage: 'ready',
      completedStages: [
        ...(orders.find((o) => o.id === orderId)?.completedStages || []),
        'qc',
      ],
    });

    toast.success('Quality check passed');
  };

  const handleQCFail = (orderId: string) => {
    addQualityControl({
      id: `qc-${Date.now()}`,
      orderId,
      qualityScore: 2,
      passed: false,
      issues: ['Needs re-processing'],
      checkedAt: new Date().toISOString(),
    });

    toast.error('Quality check failed - item needs re-processing');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quality Control</h3>
        <Badge variant="outline">{qcOrders.length} items</Badge>
      </div>

      {qcOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No items in quality control. Items requiring QC will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qcOrders.map((order) => (
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
                    {order.weight} kg • Order #{order.id.slice(-6)}
                  </div>
                </div>

                {order.qc && (
                  <div className="text-sm">
                    <div className="font-medium">
                      QC Status: {order.qc.passed ? 'Passed' : 'Failed'}
                    </div>
                    {order.qc.issues.length > 0 && (
                      <div className="text-xs text-destructive mt-1">
                        Issues: {order.qc.issues.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Arrived: {format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm')}
                </div>

                {!order.qc && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleQCFail(order.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Fail
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleQCPass(order.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Pass
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

