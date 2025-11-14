import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig, type WorkflowStage } from "../../types/workflow";
import { format } from "date-fns";
import { Droplet, Wind, Sparkles } from "lucide-react";

export const ProcessingView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);
  const machines = useDashboardStore((state) => state.machines);

  // Filter items that are in processing stages based on their service
  const processingItems = useMemo(() => {
    return orders
      .map((order) => {
        const service = services.find((s) => s.id === order.serviceId);
        if (!service) return null;

        const workflow = getWorkflowConfig(service.type);
        const processingStages: WorkflowStage[] = ['washing', 'drying', 'ironing'];
        const currentStage = order.currentStage || 'reception';

        // Only include if this service includes processing stages and order is in one
        if (processingStages.includes(currentStage as WorkflowStage)) {
          return {
            order,
            service,
            workflow,
            currentStage: currentStage as WorkflowStage,
            machine: machines.find((m) => m.currentOrderId === order.id),
          };
        }
        return null;
      })
      .filter((item) => item !== null);
  }, [orders, services, machines]);

  const itemsByStage = useMemo(() => {
    return processingItems.reduce(
      (acc, item: any) => {
        if (!acc[item.currentStage]) {
          acc[item.currentStage] = [];
        }
        acc[item.currentStage].push(item);
        return acc;
      },
      {} as Record<WorkflowStage, any[]>
    );
  }, [processingItems]);

  const getStageIcon = (stage: WorkflowStage) => {
    switch (stage) {
      case 'washing':
        return <Droplet className="h-4 w-4" />;
      case 'drying':
        return <Wind className="h-4 w-4" />;
      case 'ironing':
        return <Sparkles className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStageLabel = (stage: WorkflowStage) => {
    const labels: Record<WorkflowStage, string> = {
      washing: 'Washing',
      drying: 'Drying',
      ironing: 'Ironing',
      reception: 'Reception',
      sorting: 'Sorting',
      qc: 'Quality Control',
      ready: 'Ready',
      picked: 'Picked',
    };
    return labels[stage] || stage;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Processing - Machine Operations</h3>
        <Badge variant="outline">
          {processingItems.length} items in processing
        </Badge>
      </div>

      {processingItems.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No items currently in processing. Items will appear here when they enter washing, drying, or ironing stages.
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="washing" className="space-y-4">
          <TabsList>
            {(['washing', 'drying', 'ironing'] as WorkflowStage[]).map((stage) => (
              <TabsTrigger key={stage} value={stage} disabled={!itemsByStage[stage]?.length}>
                {getStageIcon(stage)}
                <span className="ml-2">
                  {getStageLabel(stage)} ({itemsByStage[stage]?.length || 0})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(['washing', 'drying', 'ironing'] as WorkflowStage[]).map((stage) => (
            <TabsContent key={stage} value={stage} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(itemsByStage[stage] || []).map((item: any) => (
                  <Card key={item.order.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold">{item.order.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.order.customerPhone}
                        </div>
                      </div>

                      <div>
                        <Badge variant="outline">{item.service.name}</Badge>
                        <div className="text-sm mt-1">
                          {item.order.weight} kg
                        </div>
                      </div>

                      {item.machine && (
                        <div className="text-sm">
                          <div className="text-muted-foreground">Machine:</div>
                          <div className="font-medium">{item.machine.name}</div>
                          {item.machine.timer && (
                            <div className="text-xs text-muted-foreground">
                              Remaining: {item.machine.timer.remaining} min
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Started: {format(new Date(item.order.updatedAt), 'HH:mm')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

