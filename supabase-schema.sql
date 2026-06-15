-- ============================================================
-- MLS TRANSPORTS - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Viewer',
  department TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Locked')),
  last_login TIMESTAMPTZ,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES TABLE
-- ============================================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_no TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  year INTEGER NOT NULL,
  rc_no TEXT,
  insurance_valid_up_to DATE,
  permit_valid_up_to DATE,
  fc_valid_up_to DATE,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Running','Available','Workshop','Breakdown','Inactive')),
  location TEXT,
  current_odometer INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DRIVERS TABLE
-- ============================================================
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  license_no TEXT,
  license_expiry DATE,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive','On Trip')),
  city TEXT,
  address TEXT,
  joined_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  city TEXT,
  address TEXT,
  credit_limit NUMERIC DEFAULT 0,
  outstanding NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  gstin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPPLIERS TABLE
-- ============================================================
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  city TEXT,
  address TEXT,
  credit_limit NUMERIC DEFAULT 0,
  outstanding NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  gstin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIPS TABLE
-- ============================================================
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.drivers(id),
  customer_id UUID REFERENCES public.customers(id),
  helper_name TEXT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  load_type TEXT,
  load_quantity NUMERIC DEFAULT 0,
  load_unit TEXT DEFAULT 'MT',
  freight_amount NUMERIC DEFAULT 0,
  advance_received NUMERIC DEFAULT 0,
  expenses NUMERIC DEFAULT 0,
  balance_amount NUMERIC GENERATED ALWAYS AS (freight_amount - advance_received - expenses) STORED,
  status TEXT NOT NULL DEFAULT 'Loading' CHECK (status IN ('Loading','In Transit','Unloading','Completed','Delayed','Cancelled')),
  eta TIMESTAMPTZ,
  distance_km NUMERIC,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  loading_point TEXT,
  loading_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPENSES TABLE
-- ============================================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  vendor TEXT,
  vehicle_id UUID REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.drivers(id),
  trip_id UUID REFERENCES public.trips(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_mode TEXT DEFAULT 'Cash',
  status TEXT NOT NULL DEFAULT 'Approved' CHECK (status IN ('Approved','Pending','Rejected')),
  created_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DIESEL ISSUANCES TABLE
-- ============================================================
CREATE TABLE public.diesel_issuances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_no TEXT UNIQUE NOT NULL,
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vehicle_id UUID REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.drivers(id),
  liters NUMERIC NOT NULL DEFAULT 0,
  rate_per_liter NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC GENERATED ALWAYS AS (liters * rate_per_liter) STORED,
  pump_vendor TEXT,
  issued_by TEXT,
  odometer_reading INTEGER,
  trip_id UUID REFERENCES public.trips(id),
  type TEXT DEFAULT 'Issue' CHECK (type IN ('Issue','Receive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DIESEL STOCK TABLE
-- ============================================================
CREATE TABLE public.diesel_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_stock NUMERIC DEFAULT 0,
  received NUMERIC DEFAULT 0,
  issued NUMERIC DEFAULT 0,
  closing_stock NUMERIC GENERATED ALWAYS AS (opening_stock + received - issued) STORED,
  rate_per_liter NUMERIC DEFAULT 0,
  pump_vendor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MAINTENANCES TABLE
-- ============================================================
CREATE TABLE public.maintenances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_no TEXT UNIQUE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  type TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  cost NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Completed','In Progress','Planned','Overdue')),
  technician TEXT,
  next_due_km INTEGER,
  next_due_date DATE,
  service_provider TEXT,
  parts_used TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Customer','Supplier')),
  party_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  outstanding NUMERIC GENERATED ALWAYS AS (amount - paid) STORED,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Paid','Partial','Unpaid')),
  trip_id UUID REFERENCES public.trips(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('Receipt','Payment')),
  party_id UUID NOT NULL,
  party_type TEXT NOT NULL CHECK (party_type IN ('Customer','Supplier')),
  amount NUMERIC NOT NULL DEFAULT 0,
  mode TEXT DEFAULT 'Cash',
  reference_no TEXT,
  invoice_id UUID REFERENCES public.invoices(id),
  bank_account TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOURNAL ENTRIES TABLE (Accounts)
-- ============================================================
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('Receipt','Payment','Journal','Contra')),
  particulars TEXT NOT NULL,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  account TEXT,
  party_id UUID,
  party_type TEXT,
  reference TEXT,
  narration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  user_id UUID REFERENCES public.users(id),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN VALUES ('users'),('vehicles'),('drivers'),('customers'),('suppliers'),('trips'),('expenses'),('diesel_issuances'),('maintenances'),('invoices'),('payments'),('journal_entries')
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diesel_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diesel_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write (adjust per role in production)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN VALUES ('users'),('vehicles'),('drivers'),('customers'),('suppliers'),('trips'),('expenses'),('diesel_issuances'),('diesel_stock'),('maintenances'),('invoices'),('payments'),('journal_entries'),('notifications')
  LOOP
    EXECUTE format('CREATE POLICY "auth_all_%s" ON public.%s FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ============================================================
-- SEED DATA - Sample records for testing
-- ============================================================

-- Vehicles
INSERT INTO public.vehicles (vehicle_no,type,model,brand,year,rc_no,insurance_valid_up_to,permit_valid_up_to,fc_valid_up_to,status,location) VALUES
('TN 01 AB 1234','Trailer','Ashok Leyland','Ashok Leyland',2021,'TN01AB1234','2026-08-15','2026-12-31','2026-11-10','Running','Chennai'),
('TN 02 CD 5678','Truck','Bharat Benz','Bharat Benz',2020,'TN02CD5678','2026-09-10','2026-12-05','2026-12-15','Running','Coimbatore'),
('TN 03 EF 9012','Trailer','Ashok Leyland','Ashok Leyland',2019,'TN03EF9012','2026-11-22','2026-11-30','2026-10-18','Running','Hyderabad'),
('TN 04 GH 3456','Truck','Eicher','Eicher',2019,'TN04GH3456','2026-06-05','2026-12-31','2026-05-22','Workshop','Workshop'),
('TN 05 IJ 7890','Trailer','Bharat Benz','Bharat Benz',2021,'TN05IJ7890','2026-10-18','2026-12-31','2026-09-12','Running','Bangalore'),
('TN 06 KL 1122','Truck','Tata Prima','Tata',2018,'TN06KL1122','2026-04-20','2026-09-30','2026-04-15','Workshop','Workshop'),
('TN 07 MN 2233','Trailer','Ashok Leyland','Ashok Leyland',2020,'TN07MN2233','2026-11-11','2026-12-31','2026-10-30','Running','Madurai'),
('TN 08 OP 3344','Truck','Eicher','Eicher',2019,'TN08OP3344','2026-05-25','2026-12-31','2026-05-10','Breakdown','Workshop'),
('TN 09 QR 4455','Trailer','Bharat Benz','Bharat Benz',2022,'TN09QR4455','2027-02-12','2027-01-31','2027-01-20','Running','Chennai'),
('TN 10 ST 5566','Truck','Tata Prima','Tata',2019,'TN10ST5566','2026-03-30','2026-09-30','2026-03-25','Available','Chennai');

-- Drivers
INSERT INTO public.drivers (driver_no,name,mobile,license_no,license_expiry,status,city,joined_date) VALUES
('DRV-0001','Arun Kumar','98450 12345','TN2015123456','2028-06-15','On Trip','Coimbatore','2020-01-15'),
('DRV-0002','Kumaravel','97501 23456','TN2016234567','2027-09-20','On Trip','Chennai','2019-06-10'),
('DRV-0003','Ramesh Babu','99402 34567','TN2014345678','2026-12-10','On Trip','Bangalore','2021-03-05'),
('DRV-0004','Suresh','98433 45678','TN2017456789','2028-03-25','On Trip','Madurai','2022-07-20'),
('DRV-0005','Vijayakumar','97502 56789','TN2015567890','2027-08-15','On Trip','Coimbatore','2020-11-12'),
('DRV-0006','Manikandan','98460 67890','TN2018678901','2029-01-30','Active','Hyderabad','2023-01-08'),
('DRV-0007','Prakash','96555 78901','TN2013789012','2025-11-20','Active','Chennai','2018-09-15'),
('DRV-0008','Selvam','97919 11122','TN2019890123','2029-04-10','Active','Coimbatore','2023-06-01');

-- Customers
INSERT INTO public.customers (customer_no,name,mobile,city,credit_limit,outstanding,status) VALUES
('CUS001','ABC Steels Pvt Ltd','98450 12345','Coimbatore',1000000,245000,'Active'),
('CUS002','Sri Venkateshwara Traders','97501 23456','Chennai',500000,180000,'Active'),
('CUS003','Kaveri Industries','99402 34567','Bangalore',800000,320000,'Active'),
('CUS004','Sakthi Traders','98433 45678','Madurai',300000,75000,'Active'),
('CUS005','Global Enterprises','97502 56789','Hyderabad',750000,295000,'Active'),
('CUS006','Vijay Exports','98460 67890','Coimbatore',600000,110000,'Active'),
('CUS007','SSK Logistics','96555 78901','Coimbatore',500000,0,'Inactive'),
('CUS008','MJM Infra','97919 11122','Trichy',400000,125000,'Active');

-- Suppliers
INSERT INTO public.suppliers (supplier_no,name,category,mobile,city,credit_limit,outstanding,status) VALUES
('SUP001','Bharat Petroleum Corp','Fuel Supplier','98450 12345','Coimbatore',1000000,245000,'Active'),
('SUP002','Indian Oil Corporation','Fuel Supplier','97501 23456','Chennai',800000,180000,'Active'),
('SUP003','HP Diesel Pump','Fuel Supplier','99402 34567','Bangalore',600000,125000,'Active'),
('SUP004','Sri Balaji Tyres','Tyres','98433 45678','Madurai',500000,75000,'Active'),
('SUP005','Shree Tyres & Tubes','Tyres','97502 56789','Coimbatore',400000,40000,'Active'),
('SUP006','Om Sai Auto Parts','Parts','98460 67890','Hyderabad',500000,110000,'Active'),
('SUP007','R.K. Automobiles','Parts','96555 78901','Chennai',300000,25000,'Inactive'),
('SUP008','Sakthi Workshop','Repair & Service','97919 11122','Coimbatore',400000,60000,'Active');

-- ============================================================
-- VIEWS for Dashboard Stats
-- ============================================================
CREATE OR REPLACE VIEW public.v_trip_stats AS
SELECT
  COUNT(*) FILTER (WHERE status != 'Completed' AND status != 'Cancelled') AS active_trips,
  COUNT(*) FILTER (WHERE status = 'Loading') AS loading_trips,
  COUNT(*) FILTER (WHERE status = 'In Transit') AS in_transit_trips,
  COUNT(*) FILTER (WHERE status = 'Unloading') AS unloading_trips,
  COUNT(*) FILTER (WHERE status = 'Completed' AND date >= DATE_TRUNC('month', CURRENT_DATE)) AS completed_this_month,
  COUNT(*) FILTER (WHERE status = 'Delayed') AS delayed_trips,
  SUM(freight_amount) FILTER (WHERE date >= DATE_TRUNC('month', CURRENT_DATE)) AS revenue_this_month
FROM public.trips;

CREATE OR REPLACE VIEW public.v_vehicle_stats AS
SELECT
  COUNT(*) AS total_vehicles,
  COUNT(*) FILTER (WHERE status = 'Running') AS running,
  COUNT(*) FILTER (WHERE status = 'Available') AS available,
  COUNT(*) FILTER (WHERE status = 'Workshop') AS workshop,
  COUNT(*) FILTER (WHERE status = 'Breakdown') AS breakdown
FROM public.vehicles;
