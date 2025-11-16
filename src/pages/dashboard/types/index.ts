// Dashboard Types
import type { WorkflowStage } from './workflow';

export interface OrderServiceItem {
  serviceId: string;
  serviceName: string;
  serviceType: 'regular' | 'wash_iron' | 'iron_only' | 'express' | 'dry_clean' | 'custom';
  weight?: number;
  quantity?: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  // Support both single service (backward compatible) and multi-service
  serviceId?: string; // Deprecated: use services array instead
  serviceName?: string; // Deprecated: use services array instead
  serviceType?: 'regular' | 'wash_iron' | 'iron_only' | 'express' | 'dry_clean' | 'custom'; // Deprecated: use services array instead
  services?: OrderServiceItem[]; // Multi-service support
  weight?: number; // Deprecated: use services array instead
  quantity?: number;
  unitPrice?: number; // Deprecated: use services array instead
  subtotal: number;
  discount?: number;
  surcharge?: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'transfer' | 'qris' | 'credit';
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  outletId?: string;
  outletName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  express?: boolean;
  pickupDelivery?: {
    type: 'pickup' | 'delivery';
    address?: string;
    status?: string;
  };
  // Workflow tracking fields
  currentStage?: WorkflowStage;
  completedStages?: WorkflowStage[];
  estimatedCompletion?: string;
  // RFID tracking
  rfidTagId?: string;
  // New features
  initialConditionPhotos?: string[]; // Base64 encoded photos or URLs
  membershipDiscount?: number; // Auto-calculated membership discount
  estimatedCompletionTime?: string; // ISO timestamp
  // Tagging workflow
  taggingRequired?: boolean;
  taggingStatus?: 'pending' | 'tagged' | 'lost' | 'replaced';
  taggedBy?: string; // Supervisor name/ID
  taggedAt?: string; // ISO timestamp
  tagType?: 'rfid' | 'qr';
  // Workflow logs for audit trail
  workflowLogs?: WorkflowLog[];
  // Sorting metadata
  sortingMetadata?: SortingMetadata;
}

export interface WorkflowLog {
  id: string;
  orderId: string;
  oldStep?: WorkflowStage;
  newStep: WorkflowStage;
  changedAt: string;
  changedBy: string; // User/Staff name or ID
  notes?: string;
}

// Sorting Bag/Container Management
export interface SortingBag {
  id: string;
  bagNumber: string; // Bag #001, #002, etc.
  bagName?: string; // Auto: BAG-OUTLET-A-001
  status: 'filling' | 'ready' | 'sent' | 'in_transit'; // filling, ready for pickup, sent to central, in transit
  priority?: 'express' | 'regular' | 'mixed'; // Bag priority type
  items: string[]; // Order IDs in this bag
  totalWeight: number;
  expressCount: number;
  regularCount: number;
  maxCapacity?: number; // Max capacity in kg (default 7kg)
  destination: 'central_main' | 'sub_facility';
  outletId?: string; // Outlet ID for multi-outlet support
  createdAt: string;
  readyAt?: string;
  sentAt?: string;
  inTransitAt?: string;
  qrCode?: string; // QR manifest code
  manifestValidated?: boolean; // Whether manifest has been validated
  handoverChecklist?: {
    itemsScanned: boolean;
    manifestScanned: boolean;
    courierName?: string;
    handoverTime?: string;
    supervisorSignature?: string; // Optional digital signature
  };
  notes?: string;
}

// Sorting Status for Orders - Updated to match workflow specification
export type SortingStatus = 'pending_sorting' | 'in_sorting' | 'sorted' | 'in_bag' | 'ready_for_central_pickup' | 'in_transit_central' | 'received_central';

export interface SortingMetadata {
  status: SortingStatus;
  bagId?: string; // If assigned to a bag
  sortedBy?: string; // Service type, priority, etc.
  sortedAt?: string;
  fabricType?: 'cotton' | 'wool' | 'delicate' | 'jeans' | 'mixed';
  colorCategory?: 'white' | 'dark' | 'mixed';
  machineAssignment?: string; // Machine ID for central facility
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  // Customer preferences and notes
  notes?: string; // Alergi, preferensi parfum, dll
  preferences?: {
    preferredService?: string; // Service ID yang sering dipakai
    preferredPaymentMethod?: 'cash' | 'transfer' | 'qris' | 'credit';
    membershipTier?: 'regular' | 'silver' | 'gold' | 'platinum';
    discountEligible?: boolean;
    defaultDiscount?: number; // Default discount percentage or amount
  };
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: 'regular' | 'wash_iron' | 'iron_only' | 'express' | 'dry_clean' | 'custom';
  unitPrice: number;
  unit: 'kg' | 'piece' | 'item';
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface OutletAddress {
  fullAddress: string;
  province: string;
  city: string;
  district: string;
  postalCode?: string;
  phone: string;
  whatsapp: string;
  coordinates?: string;
}

export interface OutletServicePricing {
  price_regular?: number;
  price_dryclean?: number;
  price_iron?: number;
  price_express?: number;
}

export interface OutletOperatingHours {
  weekday_open?: string;
  weekday_close?: string;
  weekend_open?: string;
  weekend_close?: string;
}

export interface OutletManager {
  name?: string;
  phone?: string;
  email?: string;
}

export interface OutletStaffMember {
  id: string;
  name: string;
  role: string;
}

export interface OutletMachine {
  id: string;
  type: string;
  serialNumber: string;
  capacity?: number;
  iotEnabled: boolean;
}

export interface OutletIoTSettings {
  auto_start: boolean;
  remote_control: boolean;
  usage_tracking: boolean;
  maintenance_alert: boolean;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  type: 'regular' | 'premium' | 'express' | 'self-service';
  ownerId: string;
  activationDate: string;
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
  address: OutletAddress;
  servicesOffered: string[];
  pricing: OutletServicePricing;
  operatingHours: OutletOperatingHours;
  manager: OutletManager;
  employees: OutletStaffMember[];
  machines: OutletMachine[];
  iotSettings: OutletIoTSettings;
  createdAt: string;
  lastUpdated: string;
}

export type OutletFormState = Omit<Outlet, 'id' | 'createdAt' | 'lastUpdated'>;

export interface PickupDelivery {
  id: string;
  type: 'pickup' | 'delivery';
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  status: 'pending' | 'assigned' | 'enroute' | 'arrived' | 'picked' | 'transit' | 'completed';
  courierId?: string;
  courierName?: string;
  orderId?: string;
  scheduledDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  name: string;
  type: 'washer' | 'dryer' | 'iron' | 'folder';
  serialNumber: string;
  capacity: number; // in kg
  status: 'empty' | 'in-use' | 'completed' | 'maintenance';
  currentOrderId?: string;
  iotEnabled: boolean;
  timer?: {
    startTime?: string;
    duration?: number; // in minutes
    remaining?: number;
  };
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'owner' | 'kasir' | 'operator' | 'kurir' | 'supervisor';
  outletId?: string;
  outletName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'kasir' | 'operator' | 'kurir' | 'supervisor';
  phone?: string;
  email?: string;
  outletId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'sick' | 'leave';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  services: Record<string, number>;
  outletId?: string;
  createdAt: string;
}

export interface OwnerDashboard {
  selectedOutlet?: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  revenueBreakdown: {
    service: string;
    amount: number;
    percentage: number;
  }[];
  hourlyRevenue: {
    hour: number;
    revenue: number;
  }[];
  serviceAnalysis: {
    service: string;
    orders: number;
    revenue: number;
  }[];
  recentActivities: {
    type: string;
    description: string;
    time: string;
  }[];
}

export interface LaundryItem {
  id: string;
  orderId: string;
  itemName: string;
  quantity: number;
  tags: string[];
  status: 'new' | 'washing' | 'drying' | 'ironing' | 'ready' | 'qc_passed' | 'qc_failed';
  machineId?: string;
  createdAt: string;
  // RFID and workflow tracking
  rfidTagId?: string;
  serviceType?: 'regular' | 'wash_iron' | 'iron_only' | 'express' | 'dry_clean' | 'custom';
  currentStage?: WorkflowStage;
  completedStages?: WorkflowStage[];
  nextValidStages?: WorkflowStage[];
  timeline?: {
    [key in WorkflowStage]?: {
      enteredAt: string;
      completedAt?: string;
      scannedBy?: string;
      machineId?: string;
    };
  };
  estimatedCompletion?: string;
}

export interface QualityControl {
  id: string;
  orderId: string;
  itemId?: string;
  qualityScore: number;
  passed: boolean;
  issues: string[];
  notes?: string;
  checkedBy?: string;
  checkedAt: string;
}

// RFID tracking types
export interface RFIDTag {
  id: string;
  rfidCode: string; // Unique RFID identifier
  orderId: string;
  laundryItemId?: string;
  assignedAt: string;
  status: 'active' | 'lost' | 'replaced';
}

export interface RFIDScanEvent {
  id: string;
  rfidCode: string;
  orderId: string;
  laundryItemId?: string;
  station: WorkflowStage;
  scannedBy?: string; // Staff ID
  scannedAt: string;
  location?: string; // Physical location/outlet
  machineId?: string; // If scanned at a machine
  isValid: boolean; // Validated against service workflow
  validationError?: string; // If scan is invalid
}

