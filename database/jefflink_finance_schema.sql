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

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  location TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id),
  branch_id UUID REFERENCES branches(id),
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

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

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

CREATE TABLE IF NOT EXISTS vendor_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP
);

CREATE OR REPLACE FUNCTION request_vendor_withdrawal(
  p_vendor_id UUID,
  p_amount NUMERIC
) RETURNS UUID AS $$
DECLARE
  v_wallet RECORD;
  v_id UUID;
BEGIN
  SELECT * INTO v_wallet
  FROM wallets
  WHERE vendor_id = p_vendor_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for vendor %', p_vendor_id;
  END IF;

  IF v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance for vendor %', p_vendor_id;
  END IF;

  UPDATE wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE vendor_id = p_vendor_id;

  INSERT INTO vendor_withdrawals (vendor_id, amount)
  VALUES (p_vendor_id, p_amount)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_vendor_withdrawal(
  p_withdrawal_id UUID,
  p_status VARCHAR,
  p_approved_by UUID,
  p_debit_account VARCHAR,
  p_credit_account VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_withdrawal RECORD;
BEGIN
  SELECT * INTO v_withdrawal
  FROM vendor_withdrawals
  WHERE id = p_withdrawal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal % not found', p_withdrawal_id;
  END IF;

  IF v_withdrawal.status <> 'PENDING' THEN
    RAISE EXCEPTION 'Withdrawal % already processed', p_withdrawal_id;
  END IF;

  IF p_status = 'REJECTED' THEN
    UPDATE wallets
    SET balance = balance + v_withdrawal.amount,
        updated_at = NOW()
    WHERE vendor_id = v_withdrawal.vendor_id;
  ELSIF p_status = 'APPROVED' THEN
    PERFORM create_ledger_transaction(
      'VENDOR_WITHDRAWAL',
      p_withdrawal_id,
      NULL,
      'Vendor withdrawal approved',
      p_debit_account,
      p_credit_account,
      v_withdrawal.amount
    );
  ELSE
    RAISE EXCEPTION 'Invalid withdrawal status %', p_status;
  END IF;

  UPDATE vendor_withdrawals
  SET status = p_status,
      approved_by = p_approved_by,
      approved_at = NOW()
  WHERE id = p_withdrawal_id;
END;
$$ LANGUAGE plpgsql;

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
  branch_id UUID REFERENCES branches(id),
  cash_price NUMERIC(18, 2),
  hire_price NUMERIC(18, 2),
  down_payment NUMERIC(18, 2),
  interest_rate NUMERIC(5, 2),
  term_months INT,
  installments_generated BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

-- Contract lifecycle FSM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
    CREATE TYPE contract_status AS ENUM (
      'DRAFT',
      'UNDER_REVIEW',
      'APPROVED',
      'ACTIVE',
      'DEFAULT_WARNING',
      'OVERDUE',
      'DEFAULT',
      'REPOSSESSION',
      'CLOSED',
      'CANCELLED'
    );
  END IF;
END $$;

ALTER TYPE contract_status
  ADD VALUE IF NOT EXISTS 'DEFAULT_WARNING';

ALTER TABLE contracts
  ALTER COLUMN status TYPE contract_status
  USING status::contract_status;

CREATE TABLE IF NOT EXISTS contract_status_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_status contract_status NOT NULL,
  to_status contract_status NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (from_status, to_status)
);

INSERT INTO contract_status_transitions (from_status, to_status)
VALUES
  ('DRAFT', 'UNDER_REVIEW'),
  ('UNDER_REVIEW', 'APPROVED'),
  ('UNDER_REVIEW', 'CANCELLED'),
  ('APPROVED', 'ACTIVE'),
  ('APPROVED', 'CANCELLED'),
  ('ACTIVE', 'DEFAULT_WARNING'),
  ('ACTIVE', 'OVERDUE'),
  ('ACTIVE', 'CLOSED'),
  ('DEFAULT_WARNING', 'ACTIVE'),
  ('DEFAULT_WARNING', 'DEFAULT'),
  ('OVERDUE', 'ACTIVE'),
  ('OVERDUE', 'DEFAULT'),
  ('DEFAULT', 'REPOSSESSION'),
  ('DEFAULT', 'ACTIVE'),
  ('REPOSSESSION', 'CLOSED')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS contract_status_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  from_status contract_status,
  to_status contract_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  change_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION enforce_contract_transition() RETURNS trigger AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM contract_status_transitions
    WHERE from_status = OLD.status
      AND to_status = NEW.status
  ) THEN
    RAISE EXCEPTION 'Invalid contract transition: % -> %', OLD.status, NEW.status;
  END IF;

  INSERT INTO contract_status_audit (
    contract_id,
    from_status,
    to_status,
    changed_by,
    change_reason
  ) VALUES (
    NEW.id,
    OLD.status,
    NEW.status,
    NULL,
    NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contract_status_transition ON contracts;
CREATE TRIGGER trg_contract_status_transition
BEFORE UPDATE OF status ON contracts
FOR EACH ROW
EXECUTE PROCEDURE enforce_contract_transition();

CREATE OR REPLACE FUNCTION auto_create_recovery_case() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'DEFAULT' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO recovery_cases (contract_id, assigned_to, status, notes)
    VALUES (NEW.id, NULL, 'OPEN', 'Auto-created on DEFAULT status')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contract_default_recovery ON contracts;
CREATE TRIGGER trg_contract_default_recovery
AFTER UPDATE OF status ON contracts
FOR EACH ROW
EXECUTE PROCEDURE auto_create_recovery_case();


CREATE TABLE IF NOT EXISTS penalty_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grace_days INT NOT NULL DEFAULT 0,
  default_days INT NOT NULL DEFAULT 30,
  penalty_type VARCHAR(10) NOT NULL CHECK (penalty_type IN ('FLAT', 'PERCENT')),
  penalty_value NUMERIC(10, 2) NOT NULL CHECK (penalty_value >= 0),
  frequency VARCHAR(10) NOT NULL DEFAULT 'DAILY' CHECK (frequency IN ('DAILY', 'MONTHLY')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penalty_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grace_days INT NOT NULL DEFAULT 0,
  penalty_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  penalty_type VARCHAR(20) NOT NULL CHECK (penalty_type IN ('FLAT', 'PERCENT')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION enforce_contract_closure_balance() RETURNS trigger AS $$
DECLARE
  v_outstanding NUMERIC(18, 2);
BEGIN
  IF NEW.status = 'CLOSED' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT COALESCE(SUM(amount_due + penalty_amount - amount_paid), 0)
    INTO v_outstanding
    FROM installments
    WHERE contract_id = NEW.id;

    IF v_outstanding > 0 THEN
      RAISE EXCEPTION 'Cannot close contract % with outstanding balance %', NEW.id, v_outstanding;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contract_close_guard ON contracts;
CREATE TRIGGER trg_contract_close_guard
BEFORE UPDATE OF status ON contracts
FOR EACH ROW
EXECUTE PROCEDURE enforce_contract_closure_balance();

CREATE OR REPLACE FUNCTION auto_generate_installments_on_activation() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'ACTIVE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM generate_installments_for_contract(NEW.id, NEW.start_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contract_activate_installments ON contracts;
CREATE TRIGGER trg_contract_activate_installments
AFTER UPDATE OF status ON contracts
FOR EACH ROW
EXECUTE PROCEDURE auto_generate_installments_on_activation();

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
  payment_type VARCHAR(30) NOT NULL DEFAULT 'INSTALLMENT'
    CHECK (payment_type IN ('DOWN_PAYMENT', 'INSTALLMENT', 'RECOVERY', 'ADJUSTMENT')),
);

-- Installment generation (amortization schedule)
CREATE OR REPLACE FUNCTION generate_installments_for_contract(
  p_contract_id UUID,
  p_start_date DATE DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_contract RECORD;
  v_principal NUMERIC(18, 2);
  v_term INT;
  v_payment NUMERIC(18, 2);
  v_total NUMERIC(18, 2);
  v_sum NUMERIC(18, 2) := 0;
  v_due_date DATE;
  v_start DATE;
  v_end DATE;
  v_down_paid NUMERIC(18, 2);
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

  IF v_contract.hire_price IS NULL THEN
    RAISE EXCEPTION 'Contract % requires hire_price for amortization', p_contract_id;
  END IF;

  IF v_contract.installments_generated OR EXISTS (
    SELECT 1 FROM installments WHERE contract_id = p_contract_id
  ) THEN
    RAISE EXCEPTION 'Installments already exist for contract %', p_contract_id;
  END IF;

  IF COALESCE(v_contract.down_payment, 0) > 0 THEN
    SELECT COALESCE(SUM(amount), 0)
    INTO v_down_paid
    FROM payments
    WHERE contract_id = p_contract_id
      AND payment_type = 'DOWN_PAYMENT'
      AND status = 'SUCCESS';

    IF v_down_paid < v_contract.down_payment THEN
      RAISE EXCEPTION 'Down payment not settled for contract %', p_contract_id;
    END IF;
  END IF;

  v_start := COALESCE(p_start_date, v_contract.start_date, CURRENT_DATE);
  v_term := v_contract.term_months;
  v_principal := GREATEST(v_contract.hire_price - COALESCE(v_contract.down_payment, 0), 0);
  v_payment := ROUND(v_principal / v_term, 2);

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
      installments_generated = TRUE,
      updated_at = NOW()
  WHERE id = p_contract_id;
END;
$$ LANGUAGE plpgsql;

-- 5) Financial Engine (Payments + Double Entry Ledger)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  contract_id UUID REFERENCES contracts(id),
  branch_id UUID REFERENCES branches(id),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  method VARCHAR(50),
  payment_type VARCHAR(30) NOT NULL DEFAULT 'INSTALLMENT'
    CHECK (payment_type IN ('DOWN_PAYMENT', 'INSTALLMENT', 'RECOVERY', 'ADJUSTMENT')),
  momo_transaction_id VARCHAR(100),
  is_recovery BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_case_id UUID REFERENCES recovery_cases(id),
  reference_number VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_momo_transaction_id
  ON payments(momo_transaction_id)
  WHERE momo_transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_reference_number
  ON payments(reference_number)
  WHERE reference_number IS NOT NULL;

CREATE OR REPLACE FUNCTION enforce_payment_acceptance() RETURNS trigger AS $$
DECLARE
  v_status contract_status;
  v_outstanding NUMERIC(18, 2);
  v_down_payment NUMERIC(18, 2);
BEGIN
  SELECT status INTO v_status FROM contracts WHERE id = NEW.contract_id;

  IF v_status IN ('DEFAULT', 'REPOSSESSION', 'CLOSED') AND NEW.is_recovery = FALSE THEN
    RAISE EXCEPTION 'Payments are restricted for contract % in status %', NEW.contract_id, v_status;
  END IF;

  IF NEW.payment_type IN ('INSTALLMENT', 'RECOVERY') THEN
    SELECT COALESCE(SUM(amount_due + penalty_amount - amount_paid), 0)
    INTO v_outstanding
    FROM installments
    WHERE contract_id = NEW.contract_id;

    IF NEW.amount > v_outstanding THEN
      RAISE EXCEPTION 'Payment exceeds outstanding balance for contract %', NEW.contract_id;
    END IF;
  END IF;

  IF NEW.payment_type = 'DOWN_PAYMENT' THEN
    SELECT COALESCE(down_payment, 0)
    INTO v_down_payment
    FROM contracts
    WHERE id = NEW.contract_id;

    IF NEW.amount > v_down_payment THEN
      RAISE EXCEPTION 'Down payment exceeds required deposit for contract %', NEW.contract_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_acceptance ON payments;
CREATE TRIGGER trg_payments_acceptance
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE PROCEDURE enforce_payment_acceptance();

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

INSERT INTO account_types (name, normal_balance)
VALUES
  ('Asset', 'DEBIT'),
  ('Liability', 'CREDIT'),
  ('Revenue', 'CREDIT')
ON CONFLICT (name) DO NOTHING;

INSERT INTO accounts (account_code, account_name, account_type_id)
VALUES
  ('1000', 'MoMo Clearing', (SELECT id FROM account_types WHERE name = 'Asset')),
  ('1100', 'Accounts Receivable', (SELECT id FROM account_types WHERE name = 'Asset')),
  ('2000', 'Vendor Payable', (SELECT id FROM account_types WHERE name = 'Liability')),
  ('3000', 'Commission Revenue', (SELECT id FROM account_types WHERE name = 'Revenue')),
  ('4000', 'Penalty Revenue', (SELECT id FROM account_types WHERE name = 'Revenue'))
ON CONFLICT (account_code) DO NOTHING;

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
  branch_id UUID REFERENCES branches(id),
  reference_type VARCHAR(50),
  reference_id UUID,
  reference VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE ledger_transactions
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES ledger_transactions(id),
  account_code VARCHAR(100) NOT NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  debit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION normalize_ledger_entry_amounts() RETURNS trigger AS $$
BEGIN
  IF NEW.entry_type = 'DEBIT' THEN
    NEW.debit := NEW.amount;
    NEW.credit := 0;
  ELSE
    NEW.credit := NEW.amount;
    NEW.debit := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_entry_normalize ON ledger_entries;
CREATE TRIGGER trg_ledger_entry_normalize
BEFORE INSERT OR UPDATE ON ledger_entries
FOR EACH ROW
EXECUTE PROCEDURE normalize_ledger_entry_amounts();

CREATE OR REPLACE FUNCTION enforce_ledger_balance() RETURNS trigger AS $$
DECLARE
  v_debits NUMERIC(18, 2);
  v_credits NUMERIC(18, 2);
BEGIN
  SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
  INTO v_debits, v_credits
  FROM ledger_entries
  WHERE transaction_id = COALESCE(NEW.transaction_id, OLD.transaction_id);

  IF v_debits <> v_credits THEN
    RAISE EXCEPTION 'Ledger out of balance for transaction %', COALESCE(NEW.transaction_id, OLD.transaction_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_balance ON ledger_entries;
CREATE CONSTRAINT TRIGGER trg_ledger_balance
AFTER INSERT OR UPDATE OR DELETE ON ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE PROCEDURE enforce_ledger_balance();

CREATE OR REPLACE FUNCTION create_ledger_transaction(
  p_reference_type VARCHAR,
  p_reference_id UUID,
  p_reference VARCHAR,
  p_description TEXT,
  p_debit_account VARCHAR,
  p_credit_account VARCHAR,
  p_amount NUMERIC
) RETURNS UUID AS $$
DECLARE
  v_txn_id UUID;
BEGIN
  INSERT INTO ledger_transactions (
    reference_type,
    reference_id,
    reference,
    description
  ) VALUES (
    p_reference_type,
    p_reference_id,
    p_reference,
    p_description
  ) RETURNING id INTO v_txn_id;

  INSERT INTO ledger_entries (transaction_id, account_code, entry_type, amount)
  VALUES (v_txn_id, p_debit_account, 'DEBIT', p_amount);

  INSERT INTO ledger_entries (transaction_id, account_code, entry_type, amount)
  VALUES (v_txn_id, p_credit_account, 'CREDIT', p_amount);

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION apply_payment_to_installments(
  p_contract_id UUID,
  p_amount NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  v_remaining NUMERIC(18, 2) := p_amount;
  v_balance NUMERIC(18, 2);
BEGIN
  FOR rec IN
    SELECT id,
           (amount_due + penalty_amount - amount_paid) AS balance
    FROM installments
    WHERE contract_id = p_contract_id
      AND amount_paid < amount_due + penalty_amount
    ORDER BY due_date
    FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;
    v_balance := rec.balance;
    IF v_balance <= 0 THEN
      CONTINUE;
    END IF;

    IF v_remaining >= v_balance THEN
      UPDATE installments
      SET amount_paid = amount_paid + v_balance,
          status = 'PAID',
          updated_at = NOW()
      WHERE id = rec.id;
      v_remaining := v_remaining - v_balance;
    ELSE
      UPDATE installments
      SET amount_paid = amount_paid + v_remaining,
          updated_at = NOW()
      WHERE id = rec.id;
      v_remaining := 0;
    END IF;
  END LOOP;

  RETURN v_remaining;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reconcile_momo_payment(
  p_payment_id UUID,
  p_amount NUMERIC,
  p_momo_transaction_id VARCHAR,
  p_debit_account VARCHAR,
  p_credit_account VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_payment RECORD;
BEGIN
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment % not found', p_payment_id;
  END IF;

  IF v_payment.status = 'SUCCESS' THEN
    RETURN;
  END IF;

  IF v_payment.amount <> p_amount THEN
    RAISE EXCEPTION 'Payment amount mismatch for %', p_payment_id;
  END IF;

  UPDATE payments
  SET status = 'SUCCESS',
      momo_transaction_id = p_momo_transaction_id,
      updated_at = NOW()
  WHERE id = p_payment_id;

  PERFORM apply_payment_to_installments(v_payment.contract_id, p_amount);

  PERFORM create_ledger_transaction(
    'PAYMENT',
    p_payment_id,
    p_momo_transaction_id,
    'MoMo payment reconciliation',
    p_debit_account,
    p_credit_account,
    p_amount
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION detect_overdue_contracts(
  p_grace_days INT DEFAULT 0,
  p_default_days INT DEFAULT 30
) RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_policy RECORD;
  v_config RECORD;
  v_grace_days INT;
  v_default_days INT;
  rec RECORD;
BEGIN
  SELECT * INTO v_policy
  FROM penalty_policies
  WHERE is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT * INTO v_config
  FROM penalty_config
  ORDER BY created_at DESC
  LIMIT 1;

  v_grace_days := COALESCE(v_config.grace_days, v_policy.grace_days, p_grace_days);
  v_default_days := COALESCE(v_policy.default_days, p_default_days);

  FOR rec IN
    WITH candidates AS (
      SELECT id,
             penalty_amount AS old_penalty,
             CASE
               WHEN v_policy.id IS NULL AND v_config.id IS NULL THEN penalty_amount
               WHEN COALESCE(v_config.penalty_type, v_policy.penalty_type) = 'FLAT' THEN
                 ROUND(GREATEST((v_today - due_date)::INT, 0)
                   * COALESCE(v_config.penalty_rate, v_policy.penalty_value), 2)
               WHEN COALESCE(v_config.penalty_type, v_policy.penalty_type) = 'PERCENT' THEN
                 ROUND(
                   GREATEST((v_today - due_date)::INT, 0)
                   * (amount_due * COALESCE(v_config.penalty_rate, v_policy.penalty_value) / 100),
                   2
                 )
               ELSE penalty_amount
             END AS new_penalty
      FROM installments
      WHERE due_date < v_today
        AND amount_paid < amount_due
        AND status <> 'OVERDUE'
    )
    UPDATE installments i
    SET status = 'OVERDUE',
        penalty_amount = c.new_penalty,
        updated_at = NOW()
    FROM candidates c
    WHERE i.id = c.id
    RETURNING i.id, c.old_penalty, c.new_penalty
  LOOP
    IF rec.new_penalty > rec.old_penalty THEN
      PERFORM create_ledger_transaction(
        'PENALTY',
        rec.id,
        NULL,
        'Penalty applied',
        'ACCOUNTS_RECEIVABLE',
        'PENALTY_REVENUE',
        rec.new_penalty - rec.old_penalty
      );
    END IF;
  END LOOP;

  UPDATE contracts
  SET status = 'OVERDUE', updated_at = NOW()
  WHERE status = 'ACTIVE'
    AND EXISTS (
      SELECT 1
      FROM installments i
      WHERE i.contract_id = contracts.id
        AND i.due_date + v_grace_days < v_today
        AND i.amount_paid < i.amount_due
    );

  UPDATE contracts
  SET status = 'DEFAULT', updated_at = NOW()
  WHERE status IN ('ACTIVE', 'OVERDUE')
    AND EXISTS (
      SELECT 1
      FROM installments i
      WHERE i.contract_id = contracts.id
        AND i.due_date + v_default_days < v_today
        AND i.amount_paid < i.amount_due
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION settle_contract_early(
  p_contract_id UUID,
  p_payment_amount NUMERIC,
  p_debit_account VARCHAR,
  p_credit_account VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_outstanding NUMERIC(18, 2);
  v_remaining NUMERIC(18, 2);
BEGIN
  SELECT COALESCE(SUM(amount_due + penalty_amount - amount_paid), 0)
  INTO v_outstanding
  FROM installments
  WHERE contract_id = p_contract_id;

  IF p_payment_amount < v_outstanding THEN
    RAISE EXCEPTION 'Early settlement amount insufficient for contract %', p_contract_id;
  END IF;

  v_remaining := apply_payment_to_installments(p_contract_id, p_payment_amount);

  IF v_remaining < 0 THEN
    RAISE EXCEPTION 'Payment allocation failed for contract %', p_contract_id;
  END IF;

  UPDATE contracts
  SET status = 'CLOSED', updated_at = NOW()
  WHERE id = p_contract_id;

  PERFORM create_ledger_transaction(
    'EARLY_SETTLEMENT',
    p_contract_id,
    NULL,
    'Early settlement payment',
    p_debit_account,
    p_credit_account,
    p_payment_amount
  );
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION enforce_commission_amount() RETURNS trigger AS $$
DECLARE
  v_payment_amount NUMERIC(18, 2);
  v_rate NUMERIC(5, 2);
  v_vendor_id UUID;
  v_payment_status VARCHAR(30);
BEGIN
  SELECT p.amount, p.status, v.commission_rate, v.id
  INTO v_payment_amount, v_payment_status, v_rate, v_vendor_id
  FROM ledger_transactions lt
  JOIN payments p ON p.id = lt.payment_id
  JOIN contracts c ON c.id = p.contract_id
  JOIN vehicles veh ON veh.id = c.vehicle_id
  JOIN vendors v ON v.id = veh.vendor_id
  WHERE lt.id = NEW.transaction_id;

  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Commission requires a payment-backed transaction';
  END IF;

  IF v_payment_status <> 'SUCCESS' THEN
    RAISE EXCEPTION 'Commission requires successful payment for transaction %', NEW.transaction_id;
  END IF;

  IF NEW.vendor_id <> v_vendor_id THEN
    RAISE EXCEPTION 'Commission vendor mismatch for transaction %', NEW.transaction_id;
  END IF;

  IF NEW.amount > (v_payment_amount * v_rate / 100) THEN
    RAISE EXCEPTION 'Commission exceeds allowed rate for transaction %', NEW.transaction_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_commission_guard ON commissions;
CREATE TRIGGER trg_commission_guard
BEFORE INSERT OR UPDATE ON commissions
FOR EACH ROW
EXECUTE PROCEDURE enforce_commission_amount();

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

CREATE OR REPLACE FUNCTION enforce_gps_active_contracts() RETURNS trigger AS $$
BEGIN
  IF NEW.status <> 'ACTIVE' THEN
    UPDATE contracts
    SET status = 'DEFAULT_WARNING', updated_at = NOW()
    WHERE vehicle_id = NEW.vehicle_id
      AND status = 'ACTIVE';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gps_contract_warning ON gps_devices;
CREATE TRIGGER trg_gps_contract_warning
AFTER INSERT OR UPDATE ON gps_devices
FOR EACH ROW
EXECUTE PROCEDURE enforce_gps_active_contracts();

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

-- Reporting views
CREATE OR REPLACE VIEW contract_financial_summary AS
SELECT
  c.id,
  c.status,
  COALESCE(SUM(i.amount_due), 0) AS total_due,
  COALESCE(SUM(i.amount_paid), 0) AS total_paid,
  COALESCE(SUM(i.amount_due + i.penalty_amount - i.amount_paid), 0) AS outstanding
FROM contracts c
LEFT JOIN installments i ON c.id = i.contract_id
GROUP BY c.id, c.status;

CREATE OR REPLACE VIEW overdue_contracts AS
SELECT *
FROM contracts
WHERE status IN ('OVERDUE', 'DEFAULT');

CREATE OR REPLACE VIEW vendor_commission_summary AS
SELECT
  vendor_id,
  COALESCE(SUM(amount), 0) AS total_commission
FROM commissions
GROUP BY vendor_id;

CREATE OR REPLACE VIEW trial_balance AS
SELECT
  account_code,
  COALESCE(SUM(debit), 0) AS total_debit,
  COALESCE(SUM(credit), 0) AS total_credit
FROM ledger_entries
GROUP BY account_code;

-- Reporting indexes
CREATE INDEX IF NOT EXISTS idx_contract_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_audit_contract ON contract_status_audit(contract_id);
CREATE INDEX IF NOT EXISTS idx_installment_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installment_contract ON installments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_status ON vehicles(status);

COMMIT;
