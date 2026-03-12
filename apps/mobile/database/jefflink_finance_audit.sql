WITH checks AS (
  SELECT 'ledger_transactions_table' AS check_name,
         CASE WHEN to_regclass('public.ledger_transactions') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
  UNION ALL
  SELECT 'ledger_entries_table',
         CASE WHEN to_regclass('public.ledger_entries') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'ledger_entries_fk',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_constraint
           WHERE conname = 'ledger_entries_transaction_id_fkey'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'ledger_balance_trigger',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ledger_balance'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'ledger_immutability_trigger',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ledger_immutable'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'payment_requires_ledger_trigger',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_trigger WHERE tgname = 'trg_payment_requires_ledger'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'momo_transaction_id_unique',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_momo_transaction_id'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'reference_number_unique',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_reference_number'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'installments_generated_column',
         CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='contracts' AND column_name='installments_generated'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'installment_duplication_guard',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes WHERE indexname = 'idx_installments_contract_due'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'penalty_config_table',
         CASE WHEN to_regclass('public.penalty_config') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'detect_overdue_function',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname='public' AND p.proname='detect_overdue_contracts'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'installment_generation_function',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname='public' AND p.proname='generate_installments_for_contract'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'settlement_function',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname='public' AND p.proname='settle_contract_early'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'reconcile_momo_function',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname='public' AND p.proname='reconcile_momo_payment'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'contract_status_enum',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_type WHERE typname = 'contract_status'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'fsm_transition_table',
         CASE WHEN to_regclass('public.contract_status_transitions') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'fsm_audit_table',
         CASE WHEN to_regclass('public.contract_status_audit') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'fsm_transition_trigger',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contract_status_transition'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'recovery_auto_trigger',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contract_default_recovery'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'close_guard_trigger',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contract_close_guard'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'branch_table',
         CASE WHEN to_regclass('public.branches') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'branch_id_payments',
         CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='payments' AND column_name='branch_id'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'branch_id_contracts',
         CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='contracts' AND column_name='branch_id'
         ) THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'branch_id_ledger_transactions',
         CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='ledger_transactions' AND column_name='branch_id'
         ) THEN 'PASS' ELSE 'FAIL' END
)
SELECT check_name, status
FROM checks
ORDER BY check_name;
