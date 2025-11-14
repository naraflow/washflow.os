import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardStore } from "../../store/useDashboardStore";
import { SERVICE_WORKFLOWS, getWorkflowConfig, type WorkflowStage } from "../../types/workflow";
import { differenceInMinutes } from "date-fns";
import type { Service, Order } from "../../types";

interface GanttBar {
  stage: WorkflowStage;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface OrderGanttData {
  order: Order;
  service: Service;
  workflow: ReturnType<typeof getWorkflowConfig>;
  bars: GanttBar[];
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
}

const getStageLabel = (stage: WorkflowStage): string => {
  const labels: Record<WorkflowStage, string> = {
    reception: 'Order',
    sorting: 'Sorting',
    washing: 'Washing',
    drying: 'Drying',
    ironing: 'Ironing',
    packing: 'Packing',
    qc: 'QC',
    ready: 'Ready',
    picked: 'Picked',
  };
  return labels[stage] || stage;
};

const getStageColor = (stage: WorkflowStage): string => {
  const colors: Record<WorkflowStage, string> = {
    reception: 'bg-blue-500',
    sorting: 'bg-purple-500',
    washing: 'bg-cyan-500',
    drying: 'bg-yellow-500',
    ironing: 'bg-orange-500',
    packing: 'bg-pink-500',
    qc: 'bg-green-500',
    ready: 'bg-emerald-500',
    picked: 'bg-gray-500',
  };
  return colors[stage] || 'bg-gray-500';
};

const getStageBorderColor = (stage: WorkflowStage): string => {
  const colors: Record<WorkflowStage, string> = {
    reception: 'border-blue-600',
    sorting: 'border-purple-600',
    washing: 'border-cyan-600',
    drying: 'border-yellow-600',
    ironing: 'border-orange-600',
    packing: 'border-pink-600',
    qc: 'border-green-600',
    ready: 'border-emerald-600',
    picked: 'border-gray-600',
  };
  return colors[stage] || 'border-gray-600';
};

export const WorkflowOverview = () => {
  const orders = useDashboardStore((state) => state.orders);
  const services = useDashboardStore((state) => state.services);

  // Process orders into Gantt chart data
  const ganttData = useMemo(() => {
    return orders
      .map((order) => {
        const service = services.find((s) => s.id === order.serviceId);
        if (!service) return null;

        const workflow = getWorkflowConfig(service.type);
        const currentStage = (order.currentStage || 'reception') as WorkflowStage;
        const completedStages = order.completedStages || [];
        
        // Create bars for each stage in the workflow
        const bars: GanttBar[] = workflow.stages
          .filter(stage => workflow.stageDurations[stage] > 0)
          .map((stage) => ({
            stage,
            isCompleted: completedStages.includes(stage),
            isCurrent: currentStage === stage,
          }));

        return {
          order,
          service,
          workflow,
          bars,
          currentStage,
          completedStages,
        } as OrderGanttData;
      })
      .filter((item): item is OrderGanttData => item !== null)
      .sort((a, b) => new Date(a.order.createdAt).getTime() - new Date(b.order.createdAt).getTime());
  }, [orders, services]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalOrders = ganttData.length;
    const ordersByStage = ganttData.reduce((acc, item) => {
      if (!acc[item.currentStage]) {
        acc[item.currentStage] = 0;
      }
      acc[item.currentStage]++;
      return acc;
    }, {} as Record<WorkflowStage, number>);

    const completedOrders = ganttData.filter((item) => 
      item.currentStage === 'picked' || item.order.status === 'completed'
    ).length;

    return {
      totalOrders,
      ordersByStage,
      completedOrders,
    };
  }, [ganttData]);

  // Get all unique stages for column headers
  const allStages = useMemo(() => {
    const stages = new Set<WorkflowStage>();
    ganttData.forEach(item => {
      item.workflow.stages.forEach(stage => {
        if (item.workflow.stageDurations[stage] > 0) {
          stages.add(stage);
        }
      });
    });
    // Sort stages in typical workflow order
    const stageOrder: WorkflowStage[] = ['reception', 'sorting', 'washing', 'drying', 'ironing', 'packing', 'qc', 'ready', 'picked'];
    return Array.from(stages).sort((a, b) => {
      const aIndex = stageOrder.indexOf(a);
      const bIndex = stageOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }, [ganttData]);

  if (ganttData.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          No orders in workflow. Create an order to start tracking.
        </p>
      </Card>
    );
  }

  const stageColumnWidth = `calc((100% - 12rem) / ${allStages.length})`; // 12rem for order info + status columns

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Orders</div>
          <div className="text-2xl font-bold">{summary.totalOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-600">{summary.completedOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold text-primary">
            {summary.totalOrders - summary.completedOrders}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Stages</div>
          <div className="text-2xl font-bold">{Object.keys(summary.ordersByStage).length}</div>
        </Card>
      </div>

      {/* Stage Summary */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Orders by Stage</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary.ordersByStage).map(([stage, count]) => (
            <Badge key={stage} variant="outline" className="gap-2">
              <span className="text-xs">{getStageLabel(stage as WorkflowStage)}:</span>
              <span className="font-semibold">{count}</span>
            </Badge>
          ))}
        </div>
      </Card>

      {/* Gantt Chart */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Order Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Showing {ganttData.length} orders with their progress through workflow stages
          </p>
        </div>

        <ScrollArea className="w-full">
          <div className="min-w-full">
            {/* Stage Header Row */}
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <div className="w-48 flex-shrink-0 text-sm font-semibold">Order</div>
              <div className="flex-1 flex gap-1">
                {allStages.map((stage) => (
                  <div
                    key={stage}
                    className="flex-1 text-center"
                    style={{ minWidth: stageColumnWidth }}
                  >
                    <Badge variant="outline" className="text-xs w-full justify-center">
                      {getStageLabel(stage)}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="w-24 flex-shrink-0 text-sm font-semibold text-right">Status</div>
            </div>

            {/* Gantt Chart Rows */}
            <div className="space-y-2">
              {ganttData.map((item) => (
                <div key={item.order.id} className="flex items-center gap-2 py-2 border-b last:border-0">
                  {/* Order Info */}
                  <div className="w-48 flex-shrink-0">
                    <div className="font-medium text-sm truncate">
                      {item.order.customerName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.service.name} • {item.order.weight} kg
                    </div>
                    <div className="text-xs font-mono text-muted-foreground/80 mt-0.5">
                      {item.order.id}
                    </div>
                  </div>

                  {/* Stage Columns */}
                  <div className="flex-1 flex gap-1">
                    {allStages.map((stage) => {
                      const bar = item.bars.find(b => b.stage === stage);
                      const isInWorkflow = item.workflow.stages.includes(stage);
                      
                      if (!isInWorkflow) {
                        // Stage not in this service's workflow
                        return (
                          <div
                            key={stage}
                            className="flex-1 h-10 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center"
                            style={{ minWidth: stageColumnWidth }}
                          >
                            <span className="text-xs text-muted-foreground">-</span>
                          </div>
                        );
                      }

                      // Check stage status
                      const isActive = bar?.isCurrent || false;
                      const isCompleted = bar?.isCompleted || item.completedStages.includes(stage);
                      
                      // Only show color for completed or current stages
                      if (!isCompleted && !isActive) {
                        // Future stage or not started yet - show grey
                        return (
                          <div
                            key={stage}
                            className="flex-1 h-10 bg-gray-200 rounded border border-gray-300"
                            style={{ minWidth: stageColumnWidth }}
                          />
                        );
                      }

                      // Show colored block for completed or current stage - use single color
                      return (
                        <div
                          key={stage}
                          className={`flex-1 h-10 rounded border-2 flex items-center justify-center transition-all bg-primary border-primary ${
                            isActive ? 'ring-2 ring-primary ring-offset-1 scale-105' : ''
                          }`}
                          style={{ minWidth: stageColumnWidth }}
                          title={getStageLabel(stage)}
                        />
                      );
                    })}
                  </div>

                  {/* Status Badge */}
                  <div className="w-24 flex-shrink-0 text-right">
                    <Badge
                      variant="outline"
                      className={item.bars.some(b => b.isCurrent) ? 'border-primary' : ''}
                    >
                      {getStageLabel(item.currentStage)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-semibold mb-2">Legend</div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary border-2 border-primary" />
              <span className="text-xs">Completed / In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-300" />
              <span className="text-xs text-muted-foreground">Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-200 border-dashed" />
              <span className="text-xs text-muted-foreground">Not in workflow</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
