import { supabase } from './supabase';
import type { Order, Customer, Service } from '../../pages/dashboard/types';

// Helper functions to sync with Supabase

// Orders
export const supabaseOrders = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapOrderFromDB) || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? mapOrderFromDB(data) : null;
  },

  async create(order: Order) {
    const { data, error } = await supabase
      .from('orders')
      .insert(mapOrderToDB(order))
      .select()
      .single();
    
    if (error) throw error;
    return mapOrderFromDB(data);
  },

  async update(id: string, updates: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .update(mapOrderToDB(updates as Order, true))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapOrderFromDB(data);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribe(callback: (payload: any) => void) {
    return supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  }
};

// Customers
export const supabaseCustomers = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapCustomerFromDB) || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? mapCustomerFromDB(data) : null;
  },

  async create(customer: Customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert(mapCustomerToDB(customer))
      .select()
      .single();
    
    if (error) throw error;
    return mapCustomerFromDB(data);
  },

  async update(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(mapCustomerToDB(updates as Customer, true))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapCustomerFromDB(data);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Services
export const supabaseServices = {
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapServiceFromDB) || [];
  },

  async create(service: Service) {
    const { data, error } = await supabase
      .from('services')
      .insert(mapServiceToDB(service))
      .select()
      .single();
    
    if (error) throw error;
    return mapServiceFromDB(data);
  },

  async update(id: string, updates: Partial<Service>) {
    const { data, error } = await supabase
      .from('services')
      .update(mapServiceToDB(updates as Service, true))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapServiceFromDB(data);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Mapping functions
function mapOrderFromDB(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    customerName: dbOrder.customer_name,
    customerPhone: dbOrder.customer_phone,
    serviceId: dbOrder.service_id,
    serviceName: dbOrder.service_name,
    serviceType: dbOrder.service_type,
    weight: dbOrder.weight,
    quantity: dbOrder.quantity,
    unitPrice: dbOrder.unit_price,
    subtotal: dbOrder.subtotal,
    discount: dbOrder.discount,
    surcharge: dbOrder.surcharge,
    totalAmount: dbOrder.total_amount,
    paymentMethod: dbOrder.payment_method,
    status: dbOrder.status,
    outletId: dbOrder.outlet_id,
    outletName: dbOrder.outlet_name,
    notes: dbOrder.notes,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    completedAt: dbOrder.completed_at,
    express: dbOrder.express,
    pickupDelivery: dbOrder.pickup_delivery,
    currentStage: dbOrder.current_stage,
    completedStages: dbOrder.completed_stages,
    estimatedCompletion: dbOrder.estimated_completion,
    rfidTagId: dbOrder.rfid_tag_id,
  };
}

function mapOrderToDB(order: Order, isUpdate = false): any {
  const dbOrder: any = {
    id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    service_id: order.serviceId,
    service_name: order.serviceName,
    service_type: order.serviceType,
    weight: order.weight,
    quantity: order.quantity,
    unit_price: order.unitPrice,
    subtotal: order.subtotal,
    discount: order.discount ?? 0,
    surcharge: order.surcharge ?? 0,
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    status: order.status,
    outlet_id: order.outletId,
    outlet_name: order.outletName,
    notes: order.notes,
    express: order.express ?? false,
    pickup_delivery: order.pickupDelivery,
    current_stage: order.currentStage,
    completed_stages: order.completedStages,
    estimated_completion: order.estimatedCompletion,
    rfid_tag_id: order.rfidTagId,
  };

  if (!isUpdate) {
    dbOrder.created_at = order.createdAt || new Date().toISOString();
  }
  dbOrder.updated_at = order.updatedAt || new Date().toISOString();
  if (order.completedAt) {
    dbOrder.completed_at = order.completedAt;
  }

  // Remove undefined values
  Object.keys(dbOrder).forEach(key => {
    if (dbOrder[key] === undefined) {
      delete dbOrder[key];
    }
  });

  return dbOrder;
}

function mapCustomerFromDB(dbCustomer: any): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    phone: dbCustomer.phone,
    email: dbCustomer.email,
    address: dbCustomer.address,
    totalOrders: dbCustomer.total_orders,
    totalSpent: dbCustomer.total_spent,
    lastOrderDate: dbCustomer.last_order_date,
    createdAt: dbCustomer.created_at,
  };
}

function mapCustomerToDB(customer: Customer, isUpdate = false): any {
  const dbCustomer: any = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    total_orders: customer.totalOrders,
    total_spent: customer.totalSpent,
    last_order_date: customer.lastOrderDate,
  };

  if (!isUpdate) {
    dbCustomer.created_at = customer.createdAt || new Date().toISOString();
  }

  Object.keys(dbCustomer).forEach(key => {
    if (dbCustomer[key] === undefined) {
      delete dbCustomer[key];
    }
  });

  return dbCustomer;
}

function mapServiceFromDB(dbService: any): Service {
  return {
    id: dbService.id,
    name: dbService.name,
    description: dbService.description,
    type: dbService.type,
    unitPrice: dbService.unit_price,
    unit: dbService.unit,
    isActive: dbService.is_active,
    isDefault: dbService.is_default,
    createdAt: dbService.created_at,
  };
}

function mapServiceToDB(service: Service, isUpdate = false): any {
  const dbService: any = {
    id: service.id,
    name: service.name,
    description: service.description,
    type: service.type,
    unit_price: service.unitPrice,
    unit: service.unit,
    is_active: service.isActive,
    is_default: service.isDefault,
  };

  if (!isUpdate) {
    dbService.created_at = service.createdAt || new Date().toISOString();
  }

  Object.keys(dbService).forEach(key => {
    if (dbService[key] === undefined) {
      delete dbService[key];
    }
  });

  return dbService;
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key');
}

