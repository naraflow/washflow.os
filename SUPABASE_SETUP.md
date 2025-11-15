# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `washflow-os` (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Wait for project to be created (takes ~2 minutes)

## 2. Get Your Credentials

1. Go to Project Settings (gear icon)
2. Click on "API" in the sidebar
3. Copy:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## 3. Configure Environment Variables

1. Create a `.env` file in the root directory
2. Add your credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit `.env` file to git! It's already in `.gitignore`

## 4. Create Database Tables

Run the following SQL in Supabase SQL Editor (SQL Editor → New Query):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT,
  service_type TEXT,
  weight NUMERIC NOT NULL,
  quantity NUMERIC,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  surcharge NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  outlet_id TEXT,
  outlet_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  express BOOLEAN DEFAULT FALSE,
  pickup_delivery JSONB,
  current_stage TEXT,
  completed_stages TEXT[],
  estimated_completion TEXT,
  rfid_tag_id TEXT
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  address TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Machines table
CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'empty',
  current_order_id TEXT,
  outlet_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address JSONB,
  pricing JSONB,
  operating_hours JSONB,
  manager JSONB,
  iot_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pickup & Delivery table
CREATE TABLE IF NOT EXISTS pickups_deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_current_stage ON orders(current_stage);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on services" ON services
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on machines" ON machines
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on outlets" ON outlets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on pickups_deliveries" ON pickups_deliveries
  FOR ALL USING (true) WITH CHECK (true);
```

## 5. Insert Default Services

Run this SQL to insert default services:

```sql
INSERT INTO services (id, name, description, type, unit_price, unit, is_active, is_default, created_at)
VALUES
  ('svc-1', 'Laundry Regular', 'Cuci biasa', 'regular', 8000, 'kg', true, true, NOW()),
  ('svc-2', 'Cuci + Setrika', 'Cuci dan setrika', 'wash_iron', 10000, 'kg', true, true, NOW()),
  ('svc-3', 'Setrika Saja', 'Setrika saja', 'iron_only', 5000, 'kg', true, true, NOW()),
  ('svc-4', 'Express', 'Cuci cepat', 'express', 12000, 'kg', true, true, NOW()),
  ('svc-5', 'Dry Clean', 'Dry clean', 'dry_clean', 15000, 'kg', true, true, NOW())
ON CONFLICT (id) DO NOTHING;
```

## 6. Test Connection

After setup, the application will automatically use Supabase when credentials are configured. The store will sync data with Supabase instead of localStorage.

## Next Steps

1. Update `useDashboardStore.ts` to sync with Supabase
2. Add real-time subscriptions for workflow updates
3. Implement authentication if needed
4. Set up proper RLS policies based on user roles

