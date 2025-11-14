// Dashboard Types
export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName?: string;
  weight: number;
  quantity?: number;
  unitPrice: number;
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

