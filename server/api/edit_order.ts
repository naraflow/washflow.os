// Request/Response types compatible with both Express and Vite middleware
interface ApiRequest {
  method?: string;
  body?: any;
  headers?: any;
  url?: string;
  path?: string;
  query?: any;
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
  const { supabaseOrders } = await import('../../src/lib/supabase.helpers');
  return supabaseOrders;
}

export async function handleEditOrder(req: Request, res: Response) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow POST and PUT
    if (req.method !== 'POST' && req.method !== 'PUT') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST or PUT.',
      });
    }

    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const data = req.body;

    // Validate required fields
    if (!data.order_id) {
      return res.status(400).json({
        success: false,
        error: 'order_id is required',
      });
    }

    // Validate order_id is not empty
    if (typeof data.order_id === 'string' && data.order_id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'order_id cannot be empty',
      });
    }

    // Check if Supabase is configured
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

    // Get Supabase orders helper
    const supabaseOrders = await getSupabaseOrders();

    // Check if order exists
    let existingOrder: Order | null = null;
    try {
      existingOrder = await supabaseOrders.getById(data.order_id);
    } catch (error: any) {
      // If getById throws an error (e.g., order not found), existingOrder will be null
      console.error('Error fetching order:', error);
    }

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        order_id: data.order_id,
        message: `No order found with ID: ${data.order_id}`,
      });
    }

    // Prepare update data
    const updateData: Partial<Order> = {
      updatedAt: new Date().toISOString(),
    };

    // Update status if provided
    if (data.status !== undefined) {
      const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
      if (validStatuses.includes(data.status)) {
        updateData.status = data.status;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }
    }

    // Update other fields if provided
    if (data.customer_name !== undefined) {
      updateData.customerName = data.customer_name;
    }
    if (data.customer_phone !== undefined) {
      updateData.customerPhone = data.customer_phone;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.total_amount !== undefined) {
      updateData.totalAmount = data.total_amount;
    }
    if (data.payment_method !== undefined) {
      updateData.paymentMethod = data.payment_method;
    }

    // Update order
    const updatedOrder = await supabaseOrders.update(data.order_id, updateData);

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        id: updatedOrder.id,
        order_id: updatedOrder.id,
        customer_name: updatedOrder.customerName,
        customer_phone: updatedOrder.customerPhone,
        status: updatedOrder.status,
        total_amount: updatedOrder.totalAmount,
        payment_method: updatedOrder.paymentMethod,
        notes: updatedOrder.notes,
        updated_at: updatedOrder.updatedAt,
      },
      message: 'Order updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating order:', error);
    
    // Return proper error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

