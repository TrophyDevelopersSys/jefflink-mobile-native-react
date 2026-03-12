# JEFFLink Database Schema

This folder contains the financial-grade Neon PostgreSQL schema used by JEFFLink.

- `jefflink_finance_schema.sql` defines the core authority tables, ledger engine, and enforcement triggers.
- The mobile app never connects to Neon directly; all access goes through the backend API.
