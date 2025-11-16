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

// Generate service ID
function generateServiceId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `svc-${timestamp}-${random}`;
}

export async function handleCreateService(req: Request, res: Response) {
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

    // Validate required fields with specific error messages
    const validationErrors: string[] = [];

    // Validate name - must not be empty
    if (!data.name || (typeof data.name === 'string' && data.name.trim() === '')) {
      validationErrors.push('name is required and cannot be empty');
    }

    // Validate price - must be provided and positive
    const price = data.price !== undefined ? data.price : data.unitPrice;
    if (price === undefined) {
      validationErrors.push('price or unitPrice is required');
    } else {
      // Convert to number if it's a string
      const priceNum = typeof price === 'number' ? price : parseFloat(price);
      
      // Check if it's a valid number
      if (isNaN(priceNum)) {
        validationErrors.push('price must be a valid number');
      } else if (priceNum < 0) {
        validationErrors.push('price must be a positive number');
      } else if (priceNum === 0) {
        validationErrors.push('price must be greater than zero');
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

    // Map API format to Service format
    const service: Service = {
      id: generateServiceId(),
      name: data.name,
      description: data.description || undefined,
      type: data.type || 'regular', // Default to 'regular' if not provided
      unitPrice: data.price !== undefined ? (typeof data.price === 'number' ? data.price : parseFloat(data.price)) : data.unitPrice,
      unit: data.unit || 'kg', // Default to 'kg' if not provided
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDefault: data.isDefault !== undefined ? data.isDefault : false,
      createdAt: new Date().toISOString(),
    };

    // Create service
    const createdService = await supabaseServices.create(service);

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        id: createdService.id,
        name: createdService.name,
        description: createdService.description,
        type: createdService.type,
        price: createdService.unitPrice,
        unit_price: createdService.unitPrice,
        unit: createdService.unit,
        is_active: createdService.isActive,
        is_default: createdService.isDefault,
        created_at: createdService.createdAt,
      },
      message: 'Service created successfully',
    });

  } catch (error: any) {
    console.error('Error creating service:', error);
    
    // Return proper error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

