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

export async function handleCustomerDetails(req: Request, res: Response) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Allow both GET and POST
    if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'OPTIONS') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use GET or POST.',
      });
    }

    // Extract customer ID from query parameters, URL path, or request body
    let customerId: string | undefined;
    
    // For POST requests, check request body first
    if (req.method === 'POST' && req.body) {
      customerId = req.body.customer_id || req.body.id;
    }
    
    // For GET requests, try to get from query string
    if (!customerId && req.url) {
      try {
        const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
        customerId = urlObj.searchParams.get('id') || undefined;
        
        // If not in query, try to extract from path like /customers/details/123
        if (!customerId) {
          const pathMatch = req.url.match(/\/customers\/details\/([^/?]+)/);
          if (pathMatch) {
            customerId = pathMatch[1];
          }
        }
      } catch (e) {
        // URL parsing failed, try manual extraction
        const queryMatch = req.url.match(/\?id=([^&]+)/);
        if (queryMatch) {
          customerId = queryMatch[1];
        }
      }
    }

    // If still no ID, check query object (for Express compatibility)
    if (!customerId && req.query?.id) {
      customerId = req.query.id;
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required. Use ?id=<customer_id> or /customers/details/<customer_id>',
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

    // Get customer details
    const supabaseCustomers = await getSupabaseCustomers();
    const customer = await supabaseCustomers.getById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: `Customer with ID '${customerId}' not found`,
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        total_orders: customer.totalOrders,
        total_spent: customer.totalSpent,
        last_order_date: customer.lastOrderDate,
        created_at: customer.createdAt,
        notes: customer.notes,
        preferences: customer.preferences,
      },
      message: 'Customer details retrieved successfully',
    });

  } catch (error: any) {
    console.error('Error retrieving customer details:', error);
    
    // Return proper error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

