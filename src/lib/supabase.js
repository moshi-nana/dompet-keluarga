import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const SCHEMA_SQL = `
create extension if not exists "uuid-ossp";

create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'cash',
  balance numeric(15,2) not null default 0,
  color text default '#16a34a',
  icon text default '💵',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  context text not null default 'household',
  type text not null default 'expense',
  icon text default '📦',
  color text default '#16a34a',
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid references wallets(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type text not null,
  context text not null default 'household',
  amount numeric(15,2) not null,
  note text,
  date date not null default current_date,
  synced boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete cascade,
  context text not null default 'household',
  amount numeric(15,2) not null,
  month int not null,
  year int not null,
  created_at timestamptz default now(),
  unique(category_id, month, year)
);

insert into categories (name, context, type, icon, color) values
  ('Belanja Dapur', 'household', 'expense', '🛒', '#16a34a'),
  ('Makan & Minum', 'household', 'expense', '🍽️', '#059669'),
  ('Transport', 'household', 'expense', '🚗', '#0d9488'),
  ('Tagihan & Utilitas', 'household', 'expense', '⚡', '#0891b2'),
  ('Kesehatan', 'household', 'expense', '💊', '#7c3aed'),
  ('Pendidikan', 'household', 'expense', '📚', '#db2777'),
  ('Hiburan', 'household', 'expense', '🎉', '#ea580c'),
  ('Gaji / Pemasukan', 'household', 'income', '💰', '#16a34a'),
  ('Lainnya (Rumah)', 'household', 'expense', '📦', '#6b7280'),
  ('Modal / Bahan Baku', 'business', 'expense', '🏪', '#15803d'),
  ('Operasional Usaha', 'business', 'expense', '🔧', '#0369a1'),
  ('Omzet / Penjualan', 'business', 'income', '📈', '#16a34a'),
  ('Pendapatan Lain', 'business', 'income', '💵', '#059669'),
  ('Lainnya (Usaha)', 'business', 'expense', '📦', '#6b7280')
on conflict do nothing;

insert into wallets (name, type, balance, icon) values
  ('Dompet Utama', 'cash', 0, '👜')
on conflict do nothing;
`
