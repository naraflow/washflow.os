import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// Simple Express-like request/response adapters
function createRequest(req: IncomingMessage): any {
  return {
    method: req.method,
    body: (req as any).body,
    headers: req.headers,
    url: req.url,
    path: req.url?.split('?')[0],
  };
}

function createResponse(res: ServerResponse): any {
  const headers: Record<string, string> = {};
  
  return {
    setHeader: (name: string, value: string) => {
      headers[name] = value;
      res.setHeader(name, value);
    },
    status: (code: number) => {
      res.statusCode = code;
      return {
        json: (data: any) => {
          Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        end: () => {
          Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
          res.end();
        },
      };
    },
    json: (data: any) => {
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
  };
}

// Parse JSON body
async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function apiPlugin(): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {
      // Register API middleware early to catch routes before Vite's SPA fallback
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0] || '';
        const isApiRoute = 
          url === '/create_order' || 
          url === '/orders' ||
          url === '/orders/edit' ||
          url === '/health' || 
          url.startsWith('/customers/details') ||
          url === '/customers' ||
          url === '/update_service' ||
          url === '/customer_endpoint' ||
          url === '/pickup-status' ||
          url === '/service' ||
          url === '/services';
        
        if (!isApiRoute) {
          return next();
        }

        let handled = false;
        
        try {
          // Handle /health endpoint
          if (url === '/health') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
            return;
          }

          // Handle /pickup-status endpoint
          if (url === '/pickup-status' && (req.method === 'GET' || req.method === 'OPTIONS')) {
            const request = createRequest(req);
            const response = createResponse(res);

            // Add query parsing for URL
            if (req.url) {
              try {
                const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                request.query = Object.fromEntries(urlObj.searchParams);
              } catch (e) {
                // If URL parsing fails, try to extract query manually
                const queryMatch = req.url.match(/\?([^#]+)/);
                if (queryMatch) {
                  const params = new URLSearchParams(queryMatch[1]);
                  request.query = Object.fromEntries(params);
                }
              }
            }

            // Dynamically import to handle potential module issues
            try {
              const pickupStatusModule = await import('./server/api/pickup_status');
              const handlePickupStatus = pickupStatusModule.handlePickupStatus;
              if (!handlePickupStatus) {
                throw new Error('handlePickupStatus export not found');
              }
              await handlePickupStatus(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing pickup_status handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                status: 'error',
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /customer_endpoint (POST only - for test compatibility)
          if (url === '/customer_endpoint' && (req.method === 'POST' || req.method === 'OPTIONS')) {
            // Parse body for POST requests
            if (req.method === 'POST') {
              (req as any).body = await parseBody(req);
            }

            const request = createRequest(req);
            const response = createResponse(res);

            // Extract customer_id from body
            if (req.body) {
              request.body = req.body;
            }

            // Dynamically import to handle potential module issues
            try {
              const customerDetailsModule = await import('./server/api/customers_details');
              const handleCustomerDetails = customerDetailsModule.handleCustomerDetails;
              if (!handleCustomerDetails) {
                throw new Error('handleCustomerDetails export not found');
              }
              await handleCustomerDetails(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing customers_details handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /customers/details endpoint (GET and POST)
          if (url.startsWith('/customers/details') && (req.method === 'GET' || req.method === 'POST' || req.method === 'OPTIONS')) {
            // Parse body for POST requests
            if (req.method === 'POST') {
              (req as any).body = await parseBody(req);
            }
            const request = createRequest(req);
            const response = createResponse(res);

            // Add query parsing for URL
            if (req.url) {
              try {
                const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                request.query = Object.fromEntries(urlObj.searchParams);
              } catch (e) {
                // If URL parsing fails, try to extract query manually
                const queryMatch = req.url.match(/\?([^#]+)/);
                if (queryMatch) {
                  const params = new URLSearchParams(queryMatch[1]);
                  request.query = Object.fromEntries(params);
                }
              }
            }

            // Dynamically import to handle potential module issues
            try {
              const customerDetailsModule = await import('./server/api/customers_details');
              const handleCustomerDetails = customerDetailsModule.handleCustomerDetails;
              if (!handleCustomerDetails) {
                throw new Error('handleCustomerDetails export not found');
              }
              await handleCustomerDetails(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing customers_details handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /customers endpoint
          if (url === '/customers' && (req.method === 'POST' || req.method === 'OPTIONS')) {
            // Parse body for POST requests
            if (req.method === 'POST') {
              (req as any).body = await parseBody(req);
            }

            const request = createRequest(req);
            const response = createResponse(res);
            
            // Dynamically import to handle potential module issues
            try {
              const customersModule = await import('./server/api/customers');
              const handleCreateCustomer = customersModule.handleCreateCustomer;
              if (!handleCreateCustomer) {
                throw new Error('handleCreateCustomer export not found');
              }
              await handleCreateCustomer(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing customers handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /update_service endpoint
          if (url === '/update_service' && (req.method === 'PUT' || req.method === 'OPTIONS')) {
            // Parse body for PUT requests
            if (req.method === 'PUT') {
              (req as any).body = await parseBody(req);
            }

            const request = createRequest(req);
            const response = createResponse(res);
            
            // Dynamically import to handle potential module issues
            try {
              const updateServiceModule = await import('./server/api/update_service');
              const handleUpdateService = updateServiceModule.handleUpdateService;
              if (!handleUpdateService) {
                throw new Error('handleUpdateService export not found');
              }
              await handleUpdateService(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing update_service handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /services endpoint (get all services)
          if (url === '/services' && (req.method === 'GET' || req.method === 'OPTIONS')) {
            const request = createRequest(req);
            const response = createResponse(res);

            // Add query parsing for URL
            if (req.url) {
              try {
                const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                request.query = Object.fromEntries(urlObj.searchParams);
              } catch (e) {
                // If URL parsing fails, try to extract query manually
                const queryMatch = req.url.match(/\?([^#]+)/);
                if (queryMatch) {
                  const params = new URLSearchParams(queryMatch[1]);
                  request.query = Object.fromEntries(params);
                }
              }
            }

            // Dynamically import to handle potential module issues
            try {
              const servicesModule = await import('./server/api/services');
              const handleGetAllServices = servicesModule.handleGetAllServices;
              if (!handleGetAllServices) {
                throw new Error('handleGetAllServices export not found');
              }
              await handleGetAllServices(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing services handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /service endpoint (create service)
          if (url === '/service' && (req.method === 'POST' || req.method === 'OPTIONS')) {
            // Parse body for POST requests
            if (req.method === 'POST') {
              (req as any).body = await parseBody(req);
            }

            const request = createRequest(req);
            const response = createResponse(res);
            
            // Dynamically import to handle potential module issues
            try {
              const createServiceModule = await import('./server/api/create_service');
              const handleCreateService = createServiceModule.handleCreateService;
              if (!handleCreateService) {
                throw new Error('handleCreateService export not found');
              }
              await handleCreateService(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing create_service handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /orders/edit endpoint (update order)
          if (url === '/orders/edit' && (req.method === 'POST' || req.method === 'PUT' || req.method === 'OPTIONS')) {
            // Parse body for POST/PUT requests
            if (req.method === 'POST' || req.method === 'PUT') {
              (req as any).body = await parseBody(req);
            }

            const request = createRequest(req);
            const response = createResponse(res);
            
            // Dynamically import to handle potential module issues
            try {
              const editOrderModule = await import('./server/api/edit_order');
              const handleEditOrder = editOrderModule.handleEditOrder;
              if (!handleEditOrder) {
                throw new Error('handleEditOrder export not found');
              }
              await handleEditOrder(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing edit_order handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }

          // Handle /create_order and /orders endpoints (both create orders)
          if ((url === '/create_order' || url === '/orders') && (req.method === 'POST' || req.method === 'OPTIONS')) {
            // Parse body for POST requests
            if (req.method === 'POST') {
              (req as any).body = await parseBody(req);
            }

            const request = createRequest(req);
            const response = createResponse(res);
            
            // Dynamically import to handle potential module issues
            try {
              const createOrderModule = await import('./server/api/create_order');
              const handleOrder = createOrderModule.handleCreateOrder;
              if (!handleOrder) {
                throw new Error('handleCreateOrder export not found');
              }
              await handleOrder(request, response);
              return;
            } catch (importError: any) {
              console.error('Error importing create_order handler:', importError);
              console.error('Error stack:', importError.stack);
              response.status(500).json({
                success: false,
                error: 'Failed to load API handler',
                details: importError.message,
                stack: process.env.NODE_ENV === 'development' ? importError.stack : undefined,
              });
              return;
            }
          }
        } catch (error: any) {
          console.error('API Plugin Error:', error);
          console.error('Stack:', error.stack);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          try {
            res.end(JSON.stringify({
              success: false,
              error: error.message || 'Internal server error',
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            }));
          } catch (jsonError) {
            res.end(JSON.stringify({
              success: false,
              error: 'Internal server error',
            }));
          }
        }
      });

      // Catch-all handler for invalid API endpoints
      // This runs after the specific API routes but before Vite's SPA fallback
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0] || '';
        
        // Skip Vite internal routes, static assets, and root
        if (
          url.startsWith('/@') ||           // Vite internal routes
          url.startsWith('/node_modules') || // Node modules
          url.includes('.') && !url.includes('/api') || // Static assets (has extension)
          url === '/' ||                     // Root
          url.startsWith('/src/') ||        // Source files
          url.startsWith('/public/')         // Public files
        ) {
          return next();
        }

        // Check if this looks like an API endpoint request
        // (not a known frontend route and not a static asset)
        const looksLikeApiRequest = 
          !url.startsWith('/dashboard') &&
          !url.startsWith('/about') &&
          !url.startsWith('/features') &&
          !url.startsWith('/benefits') &&
          !url.startsWith('/how-it-works') &&
          !url.match(/\.(html|css|js|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i);

        if (looksLikeApiRequest && req.method === 'GET') {
          // Return JSON 404 for invalid API endpoints
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: 'Endpoint not found',
            path: url,
            message: `The requested endpoint '${url}' does not exist.`,
          }));
          return;
        }

        // For other methods (POST, PUT, etc.), also return JSON 404 if it looks like an API request
        if (looksLikeApiRequest && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '')) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: 'Endpoint not found',
            path: url,
            message: `The requested endpoint '${url}' does not exist.`,
          }));
          return;
        }

        // Otherwise, let Vite handle it (SPA fallback for frontend routes)
        next();
      });
    },
  };
}
