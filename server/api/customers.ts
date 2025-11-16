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
import type { Customer } from '../../src/pages/dashboard/types';

// Lazy load Supabase helpers to avoid import.meta.env issues in Node.js context
async function getSupabaseCustomers() {
  const { supabaseCustomers } = await import('../../src/lib/supabase.helpers');
  return supabaseCustomers;
}

// Generate customer ID
function generateCustomerId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `cust-${timestamp}-${random}`;
}

export async function handleCreateCustomer(req: Request, res: Response) {
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

    const data = req.body;

    // Validate required fields
    if (!data.name) {
      return res.status(400).json({
        success: false,
        error: 'name is required',
      });
    }

    if (!data.phone) {
      return res.status(400).json({
        success: false,
        error: 'phone is required',
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

    // Get Supabase customers helper
    const supabaseCustomers = await getSupabaseCustomers();

    // Check for duplicate email if provided
    if (data.email) {
      const allCustomers = await supabaseCustomers.getAll();
      const existingCustomer = allCustomers.find(
        (c: Customer) => c.email && c.email.toLowerCase() === data.email.toLowerCase()
      );
      
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          error: 'A customer with this email already exists',
          details: {
            email: data.email,
            existing_customer_id: existingCustomer.id,
          },
        });
      }
    }

    // Check for duplicate phone
    const allCustomers = await supabaseCustomers.getAll();
    const existingPhoneCustomer = allCustomers.find(
      (c: Customer) => c.phone === data.phone
    );
    
    if (existingPhoneCustomer) {
      return res.status(409).json({
        success: false,
        error: 'A customer with this phone number already exists',
        details: {
          phone: data.phone,
          existing_customer_id: existingPhoneCustomer.id,
        },
      });
    }

    // Create customer
    const customer: Customer = {
      id: generateCustomerId(),
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      notes: data.notes || undefined,
      preferences: data.preferences || undefined,
    };

    const createdCustomer = await supabaseCustomers.create(customer);

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        id: createdCustomer.id,
        name: createdCustomer.name,
        phone: createdCustomer.phone,
        email: createdCustomer.email,
        address: createdCustomer.address,
        total_orders: createdCustomer.totalOrders,
        total_spent: createdCustomer.totalSpent,
        created_at: createdCustomer.createdAt,
      },
      message: 'Customer created successfully',
    });

  } catch (error: any) {
    console.error('Error creating customer:', error);
    
    // Check if it's a Supabase unique constraint error
    if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
      return res.status(409).json({
        success: false,
        error: 'A customer with this email or phone number already exists',
        details: error.message,
      });
    }
    
    // Return proper error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

