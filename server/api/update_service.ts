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
import type { Service } from '../../src/pages/dashboard/types';

// Lazy load Supabase helpers to avoid import.meta.env issues in Node.js context
async function getSupabaseServices() {
  const { supabaseServices } = await import('../../src/lib/supabase.helpers');
  return supabaseServices;
}

export async function handleUpdateService(req: Request, res: Response) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow PUT
    if (req.method !== 'PUT') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use PUT.',
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
    if (!data.service_id) {
      return res.status(400).json({
        success: false,
        error: 'service_id is required',
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

    // Get Supabase services helper
    const supabaseServices = await getSupabaseServices();

    // Check if service exists
    const allServices = await supabaseServices.getAll();
    const existingService = allServices.find((s: Service) => s.id === data.service_id);
    
    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: `Service with ID '${data.service_id}' not found`,
      });
    }

    // Prepare update data - map API format to Service format
    const updates: Partial<Service> = {};

    if (data.service_name !== undefined) {
      updates.name = data.service_name;
    }

    if (data.price !== undefined) {
      updates.unitPrice = typeof data.price === 'number' ? data.price : parseFloat(data.price);
    }

    if (data.description !== undefined) {
      updates.description = data.description;
    }

    // Preserve existing values for fields not provided
    const updatedService: Service = {
      ...existingService,
      ...updates,
    };

    // Update service
    const result = await supabaseServices.update(data.service_id, updatedService);

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        id: result.id,
        service_id: result.id,
        service_name: result.name,
        name: result.name,
        price: result.unitPrice,
        unit_price: result.unitPrice,
        description: result.description,
        type: result.type,
        unit: result.unit,
        is_active: result.isActive,
        is_default: result.isDefault,
        created_at: result.createdAt,
      },
      message: 'Service updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating service:', error);
    
    // Return proper error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

