import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { handleCreateOrder } from './api/create_order';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/create_order', handleCreateOrder);
app.post('/orders', handleCreateOrder);
app.post('/customers', async (req, res) => {
  const { handleCreateCustomer } = await import('./api/customers');
  await handleCreateCustomer(req, res);
});
app.put('/update_service', async (req, res) => {
  const { handleUpdateService } = await import('./api/update_service');
  await handleUpdateService(req, res);
});
app.get('/customers/details', async (req, res) => {
  const { handleCustomerDetails } = await import('./api/customers_details');
  await handleCustomerDetails(req, res);
});
app.post('/customers/details', async (req, res) => {
  const { handleCustomerDetails } = await import('./api/customers_details');
  await handleCustomerDetails(req, res);
});
app.post('/customer_endpoint', async (req, res) => {
  const { handleCustomerDetails } = await import('./api/customers_details');
  await handleCustomerDetails(req, res);
});
app.get('/customers/details/:id', async (req, res) => {
  const { handleCustomerDetails } = await import('./api/customers_details');
  // Add ID to query for path parameter support
  req.query = { ...req.query, id: req.params.id };
  await handleCustomerDetails(req, res);
});
app.get('/pickup-status', async (req, res) => {
  const { handlePickupStatus } = await import('./api/pickup_status');
  await handlePickupStatus(req, res);
});
app.post('/service', async (req, res) => {
  const { handleCreateService } = await import('./api/create_service');
  await handleCreateService(req, res);
});
app.get('/services', async (req, res) => {
  const { handleGetAllServices } = await import('./api/services');
  await handleGetAllServices(req, res);
});
app.post('/orders/edit', async (req, res) => {
  const { handleEditOrder } = await import('./api/edit_order');
  await handleEditOrder(req, res);
});
app.put('/orders/edit', async (req, res) => {
  const { handleEditOrder } = await import('./api/edit_order');
  await handleEditOrder(req, res);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`📦 Create order: http://localhost:${PORT}/create_order`);
  });
};

// Check if this is the main module (ES modules way)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server/index.ts')) {
  startServer();
}

export default app;

