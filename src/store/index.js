import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import {
  localGetTransactions, localSaveTransaction, localDeleteTransaction,
  localGetWallets, localSaveWallet,
  localGetCategories, localSaveCategory,
  localGetBudgets, localSaveBudget,
  queueOperation
} from '../lib/db'
import { syncDown, syncUp } from '../lib/sync'
import { generateId, todayISO } from '../lib/utils'

export const useStore = create((set, get) => ({
  // State
  transactions: [],
  wallets: [],
  categories: [],
  budgets: [],
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null,
  activeContext: 'household', // 'household' | 'business'
  session: null,
  loadingAuth: true,

  // ─── Auth ────────────────────────────────────────────────────────────────
  setSession: (session) => set({ session, loadingAuth: false }),
  setLoadingAuth: (v) => set({ loadingAuth: v }),

  // ─── Context switch ───────────────────────────────────────────────────────
  setContext: (ctx) => set({ activeContext: ctx }),

  // ─── Load data ────────────────────────────────────────────────────────────
  loadAll: async () => {
    const [wallets, categories, budgets] = await Promise.all([
      localGetWallets(),
      localGetCategories(),
      localGetBudgets(),
    ])
    const now = new Date()
    const transactions = await localGetTransactions({
      month: now.getMonth(),
      year: now.getFullYear(),
    })
    set({ wallets, categories, budgets, transactions })
  },

  loadTransactions: async (filters = {}) => {
    const transactions = await localGetTransactions(filters)
    set({ transactions })
  },

  // ─── Transactions ─────────────────────────────────────────────────────────
  addTransaction: async (data) => {
    const tx = {
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      date: todayISO(),
      synced: false,
      ...data,
    }
    await localSaveTransaction(tx)
    await queueOperation({ action: 'upsert', table: 'transactions', data: tx })

    // Update wallet balance locally
    const wallets = get().wallets
    const wallet = wallets.find(w => w.id === tx.wallet_id)
    if (wallet) {
      const delta = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount)
      const updated = { ...wallet, balance: Number(wallet.balance) + delta, updated_at: new Date().toISOString() }
      await localSaveWallet(updated)
      await queueOperation({ action: 'upsert', table: 'wallets', data: updated })
      set({ wallets: wallets.map(w => w.id === wallet.id ? updated : w) })
    }

    const now = new Date()
    const txDate = new Date(tx.date + 'T00:00:00')
    const sameMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
    if (sameMonth) {
      set(state => ({ transactions: [tx, ...state.transactions] }))
    }

    get().trySyncUp()
    return tx
  },

  deleteTransaction: async (id) => {
    const tx = get().transactions.find(t => t.id === id)
    await localDeleteTransaction(id)
    await queueOperation({ action: 'delete', table: 'transactions', id })

    // Reverse wallet balance
    if (tx) {
      const wallets = get().wallets
      const wallet = wallets.find(w => w.id === tx.wallet_id)
      if (wallet) {
        const delta = tx.type === 'income' ? -Number(tx.amount) : Number(tx.amount)
        const updated = { ...wallet, balance: Number(wallet.balance) + delta, updated_at: new Date().toISOString() }
        await localSaveWallet(updated)
        await queueOperation({ action: 'upsert', table: 'wallets', data: updated })
        set({ wallets: get().wallets.map(w => w.id === wallet.id ? updated : w) })
      }
    }

    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }))
    get().trySyncUp()
  },

  // ─── Wallets ──────────────────────────────────────────────────────────────
  addWallet: async (data) => {
    const wallet = { id: generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), balance: 0, ...data }
    await localSaveWallet(wallet)
    await queueOperation({ action: 'upsert', table: 'wallets', data: wallet })
    set(state => ({ wallets: [...state.wallets, wallet] }))
    get().trySyncUp()
    return wallet
  },

  // ─── Categories ───────────────────────────────────────────────────────────
  addCategory: async (data) => {
    const cat = { id: generateId(), created_at: new Date().toISOString(), ...data }
    await localSaveCategory(cat)
    await queueOperation({ action: 'upsert', table: 'categories', data: cat })
    set(state => ({ categories: [...state.categories, cat] }))
    get().trySyncUp()
    return cat
  },

  // ─── Budgets ──────────────────────────────────────────────────────────────
  saveBudget: async (data) => {
    const budget = { id: data.id || generateId(), ...data }
    await localSaveBudget(budget)
    await queueOperation({ action: 'upsert', table: 'budgets', data: budget })
    set(state => ({
      budgets: state.budgets.find(b => b.id === budget.id)
        ? state.budgets.map(b => b.id === budget.id ? budget : b)
        : [...state.budgets, budget]
    }))
    get().trySyncUp()
  },

  // ─── Sync ─────────────────────────────────────────────────────────────────
  trySyncUp: async () => {
    if (!get().isOnline) return
    await syncUp()
  },

  fullSync: async () => {
    set({ isSyncing: true })
    await syncDown()
    await get().loadAll()
    set({ isSyncing: false, lastSync: new Date() })
  },

  setOnline: (v) => {
    set({ isOnline: v })
    if (v) get().fullSync()
  },
}))
