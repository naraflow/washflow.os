import { useMemo, Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getWorkflowConfig, calculateEstimatedCompletion, type WorkflowStage } from "../../types/workflow";
import { format } from "date-fns";

interface CustomerTrackingViewProps {
  orderId: string;
}

const getStageLabel = (stage: WorkflowStage): string => {
  const labels: Record<WorkflowStage, string> = {
    reception: 'Reception',
    sorting: 'Sorting',
    washing: 'Washing',
    drying: 'Drying',
    ironing: 'Ironing',
    packing: 'Packing',
    qc: 'Quality Control',
    ready: 'Ready',
    picked: 'Picked',
  };
  return labels[stage] || stage;
};

const StageIndicator = ({
  stage,
  isCompleted,
  isCurrent,
  estimatedTime,
}: {
  stage: WorkflowStage;
  isCompleted: boolean;
  isCurrent: boolean;
  estimatedTime: number;
}) => {
  return (
    <div className="flex flex-col items-center min-w-[100px]">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
          isCompleted
            ? 'bg-green-500 border-green-600 text-white'
            : isCurrent
            ? 'bg-primary border-primary text-white'
            : 'bg-gray-200 border-gray-300 text-gray-500'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <Circle className="h-6 w-6" />
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs font-medium">{getStageLabel(stage)}</div>
        {estimatedTime > 0 && (
          <div className="text-xs text-muted-foreground">{estimatedTime} min</div>
        )}
      </div>
    </div>
  );
};

export const CustomerTrackingView = ({ orderId }: CustomerTrackingViewProps) => {
  const order = useDashboardStore((state) => state.getOrder(orderId));
  const services = useDashboardStore((state) => state.services);

  const trackingData = useMemo(() => {
    if (!order) return null;

    const service = services.find((s) => s.id === order.serviceId);
    if (!service) return null;

    const workflow = getWorkflowConfig(service.type);
    const currentStage = order.currentStage || 'reception';
    const completedStages = order.completedStages || [];
    const estimatedCompletion = calculateEstimatedCompletion(
      currentStage as WorkflowStage,
      workflow
    );

    return {
      order,
      service,
      workflow,
      currentStage: currentStage as WorkflowStage,
      completedStages,
      estimatedCompletion,
    };
  }, [order, services]);

  if (!trackingData) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Order not found</p>
      </Card>
    );
  }

  const { order: orderData, service, workflow, currentStage, completedStages, estimatedCompletion } = trackingData;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Order Tracking</h3>
          <div className="text-sm text-muted-foreground">
            Service: <Badge variant="outline">{service.name}</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Order ID: {orderData.id.slice(-8)}
          </div>
        </div>

        {/* Workflow Pipeline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {workflow.stages.map((stage, index) => {
            const isCompleted = completedStages.includes(stage);
            const isCurrent = currentStage === stage;
            const estimatedTime = workflow.stageDurations[stage];

            return (
              <Fragment key={stage}>
                <StageIndicator
                  stage={stage}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  estimatedTime={estimatedTime}
                />
                {index < workflow.stages.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Current Status */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Stage:</span>
              <Badge variant="outline">{getStageLabel(currentStage)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estimated Completion:</span>
              <span className="text-sm font-medium">{estimatedCompletion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Order Date:</span>
              <span className="text-sm">
                {format(new Date(orderData.createdAt), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
            {orderData.weight && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Weight:</span>
                <span className="text-sm">{orderData.weight} kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground mb-2">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${(completedStages.length / workflow.requiredStages.length) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {completedStages.length} of {workflow.requiredStages.length} stages completed
          </div>
        </div>
      </div>
    </Card>
  );
};

