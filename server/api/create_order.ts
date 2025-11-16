// Request/Response types compatible with both Express and Vite middleware
interface ApiRequest {
  method?: string;
  body?: any;
  headers?: any;
  url?: string;
  path?: string;
}

interface ApiResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (data: any) => void;
    end: () => void;
  };
  json: (data: any) => void;
}

type Request = ApiRequest;
type Response = ApiResponse;
import type { Order } from '../../src/pages/dashboard/types';

// Lazy load Supabase helpers to avoid import.meta.env issues in Node.js context
async function getSupabaseOrders() {
  // In Node.js context (Vite plugin), use process.env
  // In browser context, import.meta.env will be used by the supabase client
  const { supabaseOrders } = await import('../../src/lib/supabase.helpers');
  return supabaseOrders;
}

// API request format from test
interface CreateOrderRequest {
  customer_id?: number | string;
  customer_name?: string;
  customer_phone?: string;
  service_type: string;
  pickup_date?: string;
  delivery_date?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Generate order ID
function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

// Transform API request to Order format
async function transformToOrder(data: CreateOrderRequest): Promise<Order> {
  // Calculate totals from items
  const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = totalQuantity; // Assuming quantity represents weight in kg

  // Get or create customer
  let customerName = data.customer_name || 'Customer';
  let customerPhone = data.customer_phone || '';

  // If customer_id is provided, try to fetch customer
  if (data.customer_id && !customerPhone) {
    // Try to get customer by ID (assuming it's stored somewhere)
    // For now, we'll use a default
    customerPhone = `customer-${data.customer_id}`;
  }

  // Map service_type to our service type
  const serviceTypeMap: Record<string, 'regular' | 'wash_iron' | 'iron_only' | 'express' | 'dry_clean' | 'custom'> = {
    'Washing': 'regular',
    'Wash & Iron': 'wash_iron',
    'Iron Only': 'iron_only',
    'Express': 'express',
    'Dry Clean': 'dry_clean',
  };

  const serviceType = serviceTypeMap[data.service_type] || 'regular';

  // Create order services from items
  const services = data.items.map((item, index) => ({
    serviceId: `service-${index}`,
    serviceName: item.name,
    serviceType: serviceType,
    weight: item.quantity,
    quantity: item.quantity,
    unitPrice: item.price,
    subtotal: item.price * item.quantity,
  }));

  const firstService = services[0];

  const orderId = generateOrderId();
  
  // Create order
  const order: Order = {
    id: orderId,
    customerName: customerName,
    customerPhone: customerPhone,
    services: services,
    // Backward compatibility fields
    serviceId: firstService?.serviceId,
    serviceName: firstService?.serviceName || services.map(s => s.serviceName).join(", "),
    serviceType: firstService?.serviceType,
    weight: totalWeight,
    unitPrice: firstService?.unitPrice || 0,
    quantity: totalQuantity,
    subtotal: subtotal,
    discount: 0,
    surcharge: 0,
    totalAmount: subtotal,
    paymentMethod: 'cash',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStage: 'reception',
    completedStages: [],
    // Pickup/delivery info
    pickupDelivery: data.pickup_date || data.delivery_date ? {
      type: data.pickup_date ? 'pickup' : 'delivery',
      address: '',
      status: 'pending',
    } : undefined,
    // Workflow log
    workflowLogs: [{
      id: `log-${Date.now()}`,
      orderId: orderId,
      newStep: 'reception',
      changedAt: new Date().toISOString(),
      changedBy: 'API',
      notes: 'Order created via API',
    }],
    taggingRequired: true,
    taggingStatus: 'pending',
  };

  return order;
}

export async function handleCreateOrder(req: Request, res: Response) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      });
    }

    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const data: CreateOrderRequest = req.body;

    // Validate required fields with specific error messages
    const validationErrors: string[] = [];

    // Validate service_type or service_id
    // Check if both are missing or both are empty strings
    const hasServiceType = data.service_type !== undefined && data.service_type !== '';
    const hasServiceId = data.service_id !== undefined && data.service_id !== '';
    
    if (!hasServiceType && !hasServiceId) {
      validationErrors.push('service_type or service_id is required');
    } else {
      // If service_id is provided, it should not be empty
      if (data.service_id === '') {
        validationErrors.push('service_id cannot be empty');
      }
      // If service_type is provided, it should not be empty
      if (data.service_type === '') {
        validationErrors.push('service_type cannot be empty');
      }
    }

    // Validate customer_id (if provided, should not be empty)
    if (data.customer_id !== undefined && data.customer_id === '') {
      validationErrors.push('customer_id cannot be empty');
    }

    // Validate items
    if (!data.items || !Array.isArray(data.items)) {
      validationErrors.push('items must be a valid array');
    } else if (data.items.length === 0) {
      validationErrors.push('items array cannot be empty');
    }

    // Validate pickup_date format if provided
    if (data.pickup_date && data.pickup_date !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.pickup_date)) {
        validationErrors.push('pickup_date must be in YYYY-MM-DD format');
      } else {
        // Check if it's a valid date
        const date = new Date(data.pickup_date);
        if (isNaN(date.getTime())) {
          validationErrors.push('pickup_date must be a valid date');
        }
      }
    }

    // Validate delivery_date format if provided
    if (data.delivery_date && data.delivery_date !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.delivery_date)) {
        validationErrors.push('delivery_date must be in YYYY-MM-DD format');
      } else {
        // Check if it's a valid date
        const date = new Date(data.delivery_date);
        if (isNaN(date.getTime())) {
          validationErrors.push('delivery_date must be a valid date');
        }
      }
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationErrors,
        message: validationErrors.join('; '),
      });
    }

    // Check if Supabase is configured
    // In server context, use process.env; in browser context, use import.meta.env
    const supabaseUrl = process.env.VITE_SUPABASE_URL || (globalThis as any).VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || (globalThis as any).VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseKey === 'placeholder-key') {
      return res.status(503).json({
        success: false,
        error: 'Database not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
      });
    }

    // Transform and create order
    const order = await transformToOrder(data);
    const supabaseOrders = await getSupabaseOrders();
    const createdOrder = await supabaseOrders.create(order);

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        id: createdOrder.id,
        customer_name: createdOrder.customerName,
        customer_phone: createdOrder.customerPhone,
        service_type: createdOrder.serviceType,
        total_amount: createdOrder.totalAmount,
        status: createdOrder.status,
        created_at: createdOrder.createdAt,
      },
      message: 'Order created successfully',
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    
    // Return proper error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

