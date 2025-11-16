import type { Order } from "../types";
import type { WorkflowStage } from "../types/workflow";

/**
 * Get order status based on workflow stage and tagging status
 * This provides a dynamic status that reflects the actual workflow progress
 */
export const getOrderStatusFromWorkflow = (order: Order): Order["status"] => {
  const currentStage = order.currentStage || 'reception';
  const taggingStatus = order.taggingStatus;
  
  // If order is cancelled, return cancelled
  if (order.status === 'cancelled') {
    return 'cancelled';
  }
  
  // If tagging is required but not done yet, status is pending
  if (order.taggingRequired && taggingStatus === 'pending') {
    return 'pending';
  }
  
  // Map workflow stages to order status
  switch (currentStage) {
    case 'reception':
      // Reception stage: waiting for tagging
      if (taggingStatus === 'pending') {
        return 'pending';
      }
      return 'processing';
      
    case 'sorting':
    case 'washing':
    case 'drying':
    case 'ironing':
    case 'packing':
      // All processing stages
      return 'processing';
      
    case 'ready':
      // Ready for pickup
      return 'ready';
      
    case 'picked':
      // Completed
      return 'completed';
      
    default:
      // Fallback to original status if stage is unknown
      return order.status || 'pending';
  }
};

/**
 * Get status label in Indonesian
 */
export const getStatusLabel = (status: Order["status"]): string => {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "processing":
      return "Diproses";
    case "ready":
      return "Siap";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
};

/**
 * Get status color classes
 */
export const getStatusColor = (status: Order["status"]): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ready":
      return "bg-green-100 text-green-800 border-green-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * Get workflow stage label in Indonesian
 */
export const getWorkflowStageLabel = (stage: WorkflowStage): string => {
  switch (stage) {
    case 'reception':
      return 'Reception';
    case 'sorting':
      return 'Sorting';
    case 'washing':
      return 'Washing';
    case 'drying':
      return 'Drying';
    case 'ironing':
      return 'Ironing';
    case 'packing':
      return 'Packing';
    case 'ready':
      return 'Ready';
    case 'picked':
      return 'Picked';
    default:
      return stage;
  }
};

