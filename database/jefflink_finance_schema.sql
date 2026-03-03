-- JEFFLink financial-grade schema (Neon PostgreSQL)
-- Scope: financial authority only; operational logs and GPS traces remain in MongoDB.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Identity & Roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  national_id VARCHAR(50),
  tin VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2) Vendor Module
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  company_name VARCHAR(150),
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  subscription_plan VARCHAR(50),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID UNIQUE REFERENCES vendors(id),
  balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3) Asset Tables
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  make VARCHAR(100),
  model VARCHAR(100),
  year INT,
  chassis_number VARCHAR(100) UNIQUE,
  engine_number VARCHAR(100),
  import_source VARCHAR(100),
  purchase_price NUMERIC(18, 2),
  selling_price NUMERIC(18, 2),
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  is_finance_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  type VARCHAR(50),
  location TEXT,
  plot_size VARCHAR(100),
  price NUMERIC(18, 2),
  is_finance_approved BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  ad_type VARCHAR(50),
  location TEXT,
  price_per_period NUMERIC(18, 2),
  duration_days INT,
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4) Hire Purchase Contract Engine
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  cash_price NUMERIC(18, 2),
  hire_price NUMERIC(18, 2),
  down_payment NUMERIC(18, 2),
  interest_rate NUMERIC(5, 2),
  term_months INT,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  due_date DATE,
  amount_due NUMERIC(18, 2),
  amount_paid NUMERIC(18, 2) NOT NULL DEFAULT 0,
  penalty_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Installment generation (amortization schedule)
CREATE OR REPLACE FUNCTION generate_installments_for_contract(
  p_contract_id UUID,
  p_start_date DATE DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_contract RECORD;
  v_principal NUMERIC(18, 2);
  v_rate NUMERIC(18, 8);
  v_term INT;
  v_payment NUMERIC(18, 2);
  v_total NUMERIC(18, 2);
  v_sum NUMERIC(18, 2) := 0;
  v_due_date DATE;
  v_start DATE;
  v_end DATE;
BEGIN
  SELECT * INTO v_contract
  FROM contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract % not found', p_contract_id;
  END IF;

  IF v_contract.term_months IS NULL OR v_contract.term_months <= 0 THEN
    RAISE EXCEPTION 'Contract % requires a positive term_months', p_contract_id;
  END IF;

  IF v_contract.cash_price IS NULL THEN
    RAISE EXCEPTION 'Contract % requires cash_price for amortization', p_contract_id;
  END IF;

  IF EXISTS (SELECT 1 FROM installments WHERE contract_id = p_contract_id) THEN
    RAISE EXCEPTION 'Installments already exist for contract %', p_contract_id;
  END IF;

  v_start := COALESCE(p_start_date, v_contract.start_date, CURRENT_DATE);
  v_term := v_contract.term_months;
  v_principal := GREATEST(v_contract.cash_price - COALESCE(v_contract.down_payment, 0), 0);
  v_rate := COALESCE(v_contract.interest_rate, 0) / 100 / 12;

  IF v_rate = 0 THEN
    v_payment := ROUND(v_principal / v_term, 2);
  ELSE
    v_payment := ROUND(
      (v_principal * v_rate) / (1 - POWER(1 + v_rate, -v_term)),
      2
    );
  END IF;

  v_total := ROUND(v_payment * v_term, 2);

  FOR i IN 1..v_term LOOP
    v_due_date := (v_start + (i || ' month')::INTERVAL)::DATE;
    v_sum := v_sum + v_payment;

    IF i = v_term THEN
      INSERT INTO installments (contract_id, due_date, amount_due)
      VALUES (p_contract_id, v_due_date, v_total - (v_sum - v_payment));
    ELSE
      INSERT INTO installments (contract_id, due_date, amount_due)
      VALUES (p_contract_id, v_due_date, v_payment);
    END IF;
  END LOOP;

  v_end := (v_start + (v_term || ' month')::INTERVAL)::DATE;
  UPDATE contracts
  SET start_date = v_start,
      end_date = v_end,
      updated_at = NOW()
  WHERE id = p_contract_id;
END;
$$ LANGUAGE plpgsql;

-- 5) Financial Engine (Payments + Double Entry Ledger)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  contract_id UUID REFERENCES contracts(id),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  method VARCHAR(50),
  reference_number VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chart of accounts (double-entry foundation)
CREATE TABLE IF NOT EXISTS account_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(30) UNIQUE NOT NULL,
  account_name VARCHAR(150) NOT NULL,
  account_type_id UUID REFERENCES account_types(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL,
  source_id UUID,
  reference VARCHAR(100),
  memo TEXT,
  posted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id),
  account_id UUID REFERENCES accounts(id),
  debit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

CREATE OR REPLACE FUNCTION enforce_journal_balance() RETURNS trigger AS $$
DECLARE
  v_debits NUMERIC(18, 2);
  v_credits NUMERIC(18, 2);
BEGIN
  SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
  INTO v_debits, v_credits
  FROM journal_lines
  WHERE journal_entry_id = NEW.journal_entry_id;

  IF v_debits <> v_credits THEN
    RAISE EXCEPTION 'Journal entry % is not balanced (debits %, credits %)',
      NEW.journal_entry_id, v_debits, v_credits;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_journal_balance ON journal_lines;
CREATE CONSTRAINT TRIGGER trg_journal_balance
AFTER INSERT OR UPDATE OR DELETE ON journal_lines
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE PROCEDURE enforce_journal_balance();

CREATE TABLE IF NOT EXISTS ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  reference VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES ledger_transactions(id),
  account_code VARCHAR(100) NOT NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6) Commission Engine
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  transaction_id UUID REFERENCES ledger_transactions(id),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7) Recovery & Enforcement
CREATE TABLE IF NOT EXISTS recovery_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8) GPS Enforcement
CREATE TABLE IF NOT EXISTS gps_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  tracker_id VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  last_ping TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ownership rule: vehicle transfer only when contract is CLOSED
CREATE OR REPLACE FUNCTION enforce_vehicle_transfer() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'CLOSED' THEN
    UPDATE vehicles SET status = 'TRANSFERRED', updated_at = NOW()
    WHERE id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contract_close_transfer ON contracts;
CREATE TRIGGER trg_contract_close_transfer
AFTER UPDATE OF status ON contracts
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE PROCEDURE enforce_vehicle_transfer();

-- Reporting indexes
CREATE INDEX IF NOT EXISTS idx_contract_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_installment_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installment_contract ON installments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_status ON vehicles(status);

COMMIT;
