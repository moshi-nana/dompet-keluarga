# 💰 Dompet Keluarga

Aplikasi pencatatan keuangan untuk keluarga — gabungkan keuangan rumah tangga dan usaha dalam satu tempat. Digunakan berdua (suami & istri) dengan saldo terintegrasi.

## Fitur
- ✅ **Dua konteks** — Rumah Tangga & Usaha (tab terpisah, saldo tetap 1)
- ✅ **Catat transaksi** — pemasukan & pengeluaran dengan kategori
- ✅ **Multi dompet** — Cash, Bank, E-Wallet
- ✅ **Laporan visual** — chart harian, pie chart per kategori
- ✅ **Offline first** — IndexedDB, sync otomatis saat online
- ✅ **PWA** — bisa diinstall di HP seperti app native
- ✅ **Shared login** — 1 akun untuk berdua

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/USERNAME/dompet-keluarga.git
cd dompet-keluarga
npm install
```

### 2. Setup Supabase
1. Buat project baru di https://supabase.com
2. Buka **SQL Editor** di dashboard Supabase
3. Copy isi `SCHEMA_SQL` dari `src/lib/supabase.js` dan jalankan
4. Copy **Project URL** dan **Anon Key** dari Settings > API

### 3. Konfigurasi Environment
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```

### 4. Jalankan Lokal
```bash
npm run dev
```

### 5. Deploy ke GitHub Pages

**Set GitHub Secrets:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Enable Pages:** Settings → Pages → Source: GitHub Actions

Setiap push ke `main` otomatis deploy ke:
`https://USERNAME.github.io/dompet-keluarga/`

## Struktur Project
```
src/
├── components/
│   ├── Auth/Login.jsx
│   ├── Dashboard/Dashboard.jsx
│   ├── Layout/{BottomNav,ContextSwitcher}.jsx
│   ├── Transaction/{AddTransaction,TransactionList,TransactionItem}.jsx
│   ├── Report/Report.jsx
│   └── Settings/Settings.jsx
├── hooks/{useAuth,useOnlineStatus}.js
├── lib/{db,supabase,sync,utils}.js
└── store/index.js
```

## Tech Stack
React 18 + Vite · Supabase (PostgreSQL + Auth) · IndexedDB (idb) · Zustand · Tailwind CSS 3 · Recharts · GitHub Actions → GitHub Pages
