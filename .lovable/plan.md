# Plan

## 1. Fix Renew Loan calculation
Change order: compute new loan's interest on principal FIRST, then add carried remaining unpaid balance.
- New principal = original principal (e.g. 10,000)
- New total payable = principal × (1 + rate/100) + carried remaining
- Daily/weekly payment computed on this new total
- Update preview labels accordingly

## 2. Reset all data in database
Truncate `payments`, `loans`, `clients`, `transactions` (keep schema, profiles, roles).

## 3. Active/Overdue loan picker — add search
Replace plain Select with a searchable Combobox (Command + Popover) so user types client name to filter loans.

## 4. Responsive mobile navigation
- Sidebar/topbar collapses to a hamburger menu on small screens (< md).
- Each main item (Clients, Loans, Reports, Messages) has its own dropdown with sub-actions:
  - Clients: New Client, Manage Clients, Client Book, Messages
  - Loans: Give Loan, Renew Loan, Add Fine
  - Reports: All sub-reports
- Hidden by default on phone, opens via menu button.

## 5. Remove "Quick Actions" wording
From dashboard / app layout.

## 6. Settings page (per user)
New `/settings` page where any logged-in user can:
- Change profile picture (upload to storage bucket `avatars`)
- Change password — must enter current password (re-auth) and confirm via email link before applying.
- Edit display name & phone.

Backend additions:
- Create `avatars` storage bucket + RLS (each user manages own folder).
- Use `supabase.auth.updateUser({ password })` after `signInWithPassword` re-auth check; send email confirmation via `reauthenticate()` or `resetPasswordForEmail` flow.

## 7. Sign-up page — add phone number field
Store phone in `profiles.phone` via metadata + handler trigger update.

## 8. Daily Report footer summary on every page
Add to each daily report page a summary block:
- Cash in
- Cash out
- Closing stock
- Mom withdrawal
- Paid mom
- Closing stock mom

## 9. Messages page (under Clients dropdown)
New `/clients/messages` page where user can:
- Pick a client (searchable)
- See their loan status / remaining / next payment
- (Optional: send WhatsApp/SMS link)

## Technical notes
- Files to edit/create:
  - `src/pages/loans/RenewLoan.tsx` (calc + searchable picker)
  - `src/components/app/AppLayout.tsx` (responsive nav + dropdowns + remove "Quick Actions")
  - `src/components/app/QuickActions.tsx` (rename text or remove)
  - `src/pages/Settings.tsx` (new)
  - `src/pages/Auth.tsx` (add phone field)
  - `src/pages/reports/DailyReport.tsx` + other daily report pages (footer summary)
  - `src/pages/clients/Messages.tsx` (new)
  - `src/App.tsx` (new routes)
  - Supabase migration: avatars bucket + policies; truncate tables; profile trigger update for phone.

Please confirm and I'll implement all of the above.
