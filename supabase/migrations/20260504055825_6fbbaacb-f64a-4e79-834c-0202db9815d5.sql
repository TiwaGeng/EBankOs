
-- Roles enum + table
create type public.app_role as enum ('admin', 'loan_officer', 'accountant', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_authenticated()
returns boolean language sql stable as $$ select auth.uid() is not null $$;

-- Auto create profile + default 'viewer' role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  -- if first user => admin, else viewer
  if (select count(*) from public.user_roles) = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'viewer');
  end if;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  national_id text,
  address text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Loans
create type public.loan_status as enum ('active', 'completed', 'overdue', 'renewed');

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  principal numeric(14,2) not null check (principal > 0),
  interest_rate numeric(5,2) not null default 0,
  term_months int not null default 1,
  status loan_status not null default 'active',
  fine numeric(14,2) not null default 0,
  given_at date not null default current_date,
  due_at date,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  method text not null default 'cash',
  paid_at date not null default current_date,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Transactions
create type public.tx_type as enum ('income', 'expense');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type tx_type not null,
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  description text,
  occurred_at date not null default current_date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Generic updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger clients_touch before update on public.clients for each row execute function public.touch_updated_at();
create trigger loans_touch before update on public.loans for each row execute function public.touch_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.clients enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;
alter table public.transactions enable row level security;

-- Profiles policies
create policy "Profiles viewable by authenticated" on public.profiles for select to authenticated using (true);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- User roles policies
create policy "Roles viewable by authenticated" on public.user_roles for select to authenticated using (true);
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Clients policies
create policy "Clients viewable by authenticated" on public.clients for select to authenticated using (true);
create policy "Admin/Officer insert clients" on public.clients for insert to authenticated with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'loan_officer'));
create policy "Admin/Officer update clients" on public.clients for update to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'loan_officer'));
create policy "Admin delete clients" on public.clients for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Loans policies
create policy "Loans viewable by authenticated" on public.loans for select to authenticated using (true);
create policy "Admin/Officer insert loans" on public.loans for insert to authenticated with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'loan_officer'));
create policy "Admin/Officer update loans" on public.loans for update to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'loan_officer'));
create policy "Admin delete loans" on public.loans for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Payments policies
create policy "Payments viewable by authenticated" on public.payments for select to authenticated using (true);
create policy "Admin/Officer/Accountant insert payments" on public.payments for insert to authenticated with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'loan_officer') or public.has_role(auth.uid(),'accountant'));
create policy "Admin delete payments" on public.payments for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Transactions policies
create policy "Transactions viewable by authenticated" on public.transactions for select to authenticated using (true);
create policy "Admin/Accountant insert tx" on public.transactions for insert to authenticated with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'accountant'));
create policy "Admin/Accountant update tx" on public.transactions for update to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'accountant'));
create policy "Admin delete tx" on public.transactions for delete to authenticated using (public.has_role(auth.uid(),'admin'));
