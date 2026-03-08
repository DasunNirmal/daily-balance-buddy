

# Expense Tracker for Henuka Fresh Fruits

## Overview
A dark-mode-first expense tracking app with Supabase backend, featuring daily expense/income management, salary tracking, and PDF report generation.

## Pages & Routes

1. **Login** (`/login`) - Email/password auth
2. **Dashboard** (`/`) - Overview with totals, combined table, PDF report button
3. **Daily Expenses** (`/daily`) - Add/edit/delete income & expenses, daily summary with carry-forward balance
4. **Salary** (`/salary`) - Manage salary records

## Database Schema (Supabase)

- **profiles** - `id (FK auth.users)`, `full_name`, `created_at`
- **transactions** - `id`, `user_id (FK)`, `type (income/expense)`, `amount`, `description`, `category`, `date`, `created_at`, `updated_at`
- **daily_balances** - `id`, `user_id (FK)`, `date`, `opening_balance`, `closing_balance` (tracks carry-forward)
- **salaries** - `id`, `user_id (FK)`, `employee_name`, `amount`, `date`, `description`, `created_at`
- **categories** - `id`, `name`, `type (income/expense)`, `user_id (FK)`
- RLS on all tables scoped to `auth.uid()`

## Daily Expenses Page Layout

**Top Summary Bar:**
- Previous day carry-forward balance
- Today's income total | Today's expense total
- Today's net balance (moves to next day)
- Color-coded: green for income side, red for expense side

**Two toggle buttons:** Income | Expense

**Add Transaction Form (dialog):**
- Date picker (defaults to today, adjustable)
- Description (text)
- Amount (number)
- Category (select from predefined + custom)

**Transactions Table:**
- Columns: Date, Description, Category, Amount, Actions (Edit/Delete)
- Inline edit via dialog, delete with confirmation
- Filtered by selected date

## Dashboard
- Cards: Total Balance, Total Income, Total Expenses
- Combined transactions table (all dates)
- "Generate Report" button → PDF with:
  - "Henuka Fresh Fruits" header
  - Date, "Expense Report" centered
  - Organized table of all transactions

## Technical Approach

- **Auth**: Supabase email/password with profiles table + auto-create trigger
- **PDF**: `jspdf` + `jspdf-autotable` for report generation
- **State**: React Query for server state, Supabase client for data operations
- **Theme**: Dark mode default, light mode with soft warm tones (low-contrast, eye-friendly)
- **Routing**: React Router with protected routes (redirect to `/login` if unauthenticated)
- **Daily balance carry-forward**: Computed from `daily_balances` table; closing balance of previous day becomes opening balance of current day

## File Structure (new files)
```
src/
  contexts/AuthContext.tsx
  pages/Login.tsx
  pages/Dashboard.tsx
  pages/DailyExpenses.tsx
  pages/Salary.tsx
  components/TransactionForm.tsx
  components/TransactionTable.tsx
  components/SummaryCards.tsx
  components/ReportGenerator.tsx
  components/ProtectedRoute.tsx
  lib/supabase.ts
  types/database.ts
```

## Implementation Order
1. Supabase setup + auth + profiles
2. Database tables + RLS policies
3. Login page
4. Daily Expenses page (core feature)
5. Dashboard with summary + combined table
6. Salary page
7. PDF report generation
8. Theme (dark default + eye-friendly light mode)

