import type { Service } from './index';

// Workflow stages
export type WorkflowStage = 
  | 'reception' 
  | 'sorting' 
  | 'washing' 
  | 'drying' 
  | 'ironing' 
  | 'qc' 
  | 'ready' 
  | 'picked';

// Service workflow configuration
export interface ServiceWorkflowConfig {
  serviceType: Service['type'];
  stages: WorkflowStage[];
  stageDurations: Record<WorkflowStage, number>; // in minutes
  requiredStages: WorkflowStage[]; // Stages that must be completed
  optionalStages: WorkflowStage[]; // Stages that can be skipped
}

// Workflow templates for each service type
export const SERVICE_WORKFLOWS: Record<Service['type'], ServiceWorkflowConfig> = {
  'regular': {
    serviceType: 'regular',
    stages: ['reception', 'sorting', 'washing', 'drying', 'ready', 'picked'],
    stageDurations: {
      reception: 5,
      sorting: 10,
      washing: 60,
      drying: 45,
      ironing: 0, // Not used
      qc: 0, // Not used
      ready: 0,
      picked: 0,
    },
    requiredStages: ['reception', 'sorting', 'washing', 'drying', 'ready'],
    optionalStages: [],
  },
  
  'wash_iron': {
    serviceType: 'wash_iron',
    stages: ['reception', 'sorting', 'washing', 'drying', 'ironing', 'qc', 'ready', 'picked'],
    stageDurations: {
      reception: 5,
      sorting: 10,
      washing: 60,
      drying: 45,
      ironing: 30,
      qc: 15,
      ready: 0,
      picked: 0,
    },
    requiredStages: ['reception', 'sorting', 'washing', 'drying', 'ironing', 'qc', 'ready'],
    optionalStages: [],
  },
  
  'iron_only': {
    serviceType: 'iron_only',
    stages: ['reception', 'sorting', 'ironing', 'qc', 'ready', 'picked'],
    stageDurations: {
      reception: 5,
      sorting: 10,
      washing: 0, // Not used
      drying: 0, // Not used
      ironing: 30,
      qc: 15,
      ready: 0,
      picked: 0,
    },
    requiredStages: ['reception', 'sorting', 'ironing', 'qc', 'ready'],
    optionalStages: [],
  },
  
  'express': {
    serviceType: 'express',
    stages: ['reception', 'sorting', 'washing', 'drying', 'ready', 'picked'],
    stageDurations: {
      reception: 3, // Faster
      sorting: 5, // Faster
      washing: 40, // Faster (50% reduction)
      drying: 30, // Faster
      ironing: 0,
      qc: 0,
      ready: 0,
      picked: 0,
    },
    requiredStages: ['reception', 'sorting', 'washing', 'drying', 'ready'],
    optionalStages: [],
  },
  
  'dry_clean': {
    serviceType: 'dry_clean',
    stages: ['reception', 'sorting', 'washing', 'drying', 'qc', 'ready', 'picked'],
    stageDurations: {
      reception: 5,
      sorting: 15, // More careful sorting
      washing: 90, // Longer for dry clean
      drying: 60, // Longer
      ironing: 0,
      qc: 20, // More thorough QC
      ready: 0,
      picked: 0,
    },
    requiredStages: ['reception', 'sorting', 'washing', 'drying', 'qc', 'ready'],
    optionalStages: [],
  },
  
  'custom': {
    serviceType: 'custom',
    stages: ['reception', 'sorting', 'washing', 'drying', 'ironing', 'qc', 'ready', 'picked'],
    stageDurations: {
      reception: 5,
      sorting: 10,
      washing: 60,
      drying: 45,
      ironing: 30,
      qc: 15,
      ready: 0,
      picked: 0,
    },
    requiredStages: ['reception', 'sorting', 'ready'], // Minimum required
    optionalStages: ['washing', 'drying', 'ironing', 'qc'], // Can be configured
  },
};

// Helper function to get workflow config for a service type
export function getWorkflowConfig(serviceType: Service['type']): ServiceWorkflowConfig {
  return SERVICE_WORKFLOWS[serviceType] || SERVICE_WORKFLOWS['custom'];
}

// Helper function to calculate estimated completion time
export function calculateEstimatedCompletion(
  currentStage: WorkflowStage,
  workflowConfig: ServiceWorkflowConfig,
  enteredAtStage?: string
): string {
  const currentStageIndex = workflowConfig.stages.indexOf(currentStage);
  if (currentStageIndex === -1) return 'Unknown';
  
  const remainingStages = workflowConfig.stages.slice(currentStageIndex);
  let totalMinutes = 0;
  
  for (const stage of remainingStages) {
    totalMinutes += workflowConfig.stageDurations[stage];
  }
  
  const now = new Date();
  const completionTime = new Date(now.getTime() + totalMinutes * 60 * 1000);
  
  return completionTime.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Validate RFID scan against service workflow
export function validateRFIDScan(
  currentStage: WorkflowStage,
  completedStages: WorkflowStage[],
  targetStage: WorkflowStage,
  serviceConfig: ServiceWorkflowConfig
): { isValid: boolean; error?: string } {
  // Check if stage is part of this service's workflow
  if (!serviceConfig.stages.includes(targetStage)) {
    return {
      isValid: false,
      error: `Stage ${targetStage} is not part of ${serviceConfig.serviceType} workflow`
    };
  }
  
  // Check if all required previous stages are completed
  const stageIndex = serviceConfig.stages.indexOf(targetStage);
  const previousStages = serviceConfig.stages.slice(0, stageIndex);
  
  for (const prevStage of previousStages) {
    if (serviceConfig.requiredStages.includes(prevStage)) {
      if (!completedStages.includes(prevStage)) {
        return {
          isValid: false,
          error: `Required stage ${prevStage} must be completed before ${targetStage}`
        };
      }
    }
  }
  
  return { isValid: true };
}

