-- ============================================
-- CAR MANAGEMENT APPLICATION DATABASE SCHEMA
-- ============================================
-- This schema creates tables for managing vehicles, maintenance tasks,
-- expenses, and fuel logs with proper Row Level Security (RLS)

-- ============================================
-- 1. EXPENSE TYPE ENUM
-- ============================================
-- Define allowed expense types for categorization
CREATE TYPE public.expense_type AS ENUM (
  'fuel',
  'maintenance', 
  'repair',
  'insurance',
  'other'
);

-- ============================================
-- 2. VEHICLES TABLE
-- ============================================
-- Stores information about user-owned vehicles
-- Each vehicle belongs to exactly one user (via user_id foreign key)
CREATE TABLE public.vehicles (
  -- Primary key: unique identifier for each vehicle
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to auth.users: associates vehicle with owner
  -- ON DELETE CASCADE: if user is deleted, their vehicles are also deleted
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic vehicle information
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  
  -- Optional identification fields
  vin TEXT,
  license_plate TEXT,
  
  -- Tire pressure monitoring (in PSI)
  -- All tire pressures are optional and stored as numeric values
  tire_pressure_front_left NUMERIC,
  tire_pressure_front_right NUMERIC,
  tire_pressure_rear_left NUMERIC,
  tire_pressure_rear_right NUMERIC,
  
  -- Timestamps for record tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on user_id for faster queries filtering by user
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);

-- Enable Row Level Security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON public.vehicles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own vehicles
CREATE POLICY "Users can insert own vehicles"
  ON public.vehicles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own vehicles
CREATE POLICY "Users can update own vehicles"
  ON public.vehicles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own vehicles
CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. MAINTENANCE TASKS TABLE
-- ============================================
-- Stores scheduled and completed maintenance tasks for vehicles
CREATE TABLE public.maintenance_tasks (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to vehicles table
  -- ON DELETE CASCADE: if vehicle is deleted, its maintenance tasks are deleted
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  -- Task details
  task_name TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on vehicle_id for faster queries
CREATE INDEX idx_maintenance_tasks_vehicle_id ON public.maintenance_tasks(vehicle_id);

-- Enable Row Level Security
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view maintenance tasks for their own vehicles
CREATE POLICY "Users can view own vehicle maintenance"
  ON public.maintenance_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = maintenance_tasks.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert maintenance tasks for their own vehicles
CREATE POLICY "Users can insert own vehicle maintenance"
  ON public.maintenance_tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = maintenance_tasks.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update maintenance tasks for their own vehicles
CREATE POLICY "Users can update own vehicle maintenance"
  ON public.maintenance_tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = maintenance_tasks.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete maintenance tasks for their own vehicles
CREATE POLICY "Users can delete own vehicle maintenance"
  ON public.maintenance_tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = maintenance_tasks.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. EXPENSES TABLE
-- ============================================
-- Tracks all vehicle-related expenses
CREATE TABLE public.expenses (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to vehicles
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  -- Expense details
  date DATE NOT NULL,
  type public.expense_type NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on vehicle_id
CREATE INDEX idx_expenses_vehicle_id ON public.expenses(vehicle_id);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view expenses for their own vehicles
CREATE POLICY "Users can view own vehicle expenses"
  ON public.expenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = expenses.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert expenses for their own vehicles
CREATE POLICY "Users can insert own vehicle expenses"
  ON public.expenses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = expenses.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update expenses for their own vehicles
CREATE POLICY "Users can update own vehicle expenses"
  ON public.expenses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = expenses.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete expenses for their own vehicles
CREATE POLICY "Users can delete own vehicle expenses"
  ON public.expenses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = expenses.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. FUEL LOGS TABLE
-- ============================================
-- Records fuel fill-ups and calculates fuel economy
CREATE TABLE public.fuel_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to vehicles
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  -- Fuel log details
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  odometer INTEGER NOT NULL CHECK (odometer >= 0),
  gallons NUMERIC NOT NULL CHECK (gallons > 0),
  price_per_gallon NUMERIC NOT NULL CHECK (price_per_gallon >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on vehicle_id
CREATE INDEX idx_fuel_logs_vehicle_id ON public.fuel_logs(vehicle_id);

-- Enable Row Level Security
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view fuel logs for their own vehicles
CREATE POLICY "Users can view own vehicle fuel logs"
  ON public.fuel_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = fuel_logs.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert fuel logs for their own vehicles
CREATE POLICY "Users can insert own vehicle fuel logs"
  ON public.fuel_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = fuel_logs.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update fuel logs for their own vehicles
CREATE POLICY "Users can update own vehicle fuel logs"
  ON public.fuel_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = fuel_logs.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete fuel logs for their own vehicles
CREATE POLICY "Users can delete own vehicle fuel logs"
  ON public.fuel_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = fuel_logs.vehicle_id
        AND vehicles.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. AUTOMATIC TIMESTAMP UPDATE FUNCTION
-- ============================================
-- Creates a reusable function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- 7. APPLY TIMESTAMP TRIGGERS
-- ============================================
-- Automatically update updated_at on record modification

CREATE TRIGGER set_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_maintenance_updated_at
  BEFORE UPDATE ON public.maintenance_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_fuel_logs_updated_at
  BEFORE UPDATE ON public.fuel_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();