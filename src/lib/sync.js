import { supabase } from './supabase'
import {
  localGetWallets, localSaveWallet,
  localGetCategories, localSaveCategory,
  localGetTransactions, localSaveTransaction, localDeleteTransaction,
  localGetBudgets, localSaveBudget,
  getPendingQueue, clearQueueItem
} from './db'

export async function syncDown() {
  try {
    // Sync wallets
    const { data: wallets } = await supabase.from('wallets').select('*')
    if (wallets) for (const w of wallets) await localSaveWallet(w)

    // Sync categories
    const { data: cats } = await supabase.from('categories').select('*')
    if (cats) for (const c of cats) await localSaveCategory(c)

    // Sync transactions (last 3 months)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', threeMonthsAgo.toISOString().split('T')[0])
    if (txs) for (const t of txs) await localSaveTransaction(t)

    // Sync budgets
    const { data: budgets } = await supabase.from('budgets').select('*')
    if (budgets) for (const b of budgets) await localSaveBudget(b)

    return true
  } catch (err) {
    console.error('Sync down failed:', err)
    return false
  }
}

export async function syncUp() {
  const pending = await getPendingQueue()
  if (!pending.length) return true

  const errors = []
  for (const op of pending) {
    try {
      if (op.action === 'upsert') {
        const { error } = await supabase.from(op.table).upsert(op.data)
        if (error) throw error
      } else if (op.action === 'delete') {
        const { error } = await supabase.from(op.table).delete().eq('id', op.id)
        if (error) throw error
      }
      await clearQueueItem(op.id)
    } catch (err) {
      errors.push({ op, err })
    }
  }
  return errors.length === 0
}

export async function fullSync() {
  await syncUp()
  await syncDown()
}

// Recalculate wallet balance from transactions
export async function recalcWalletBalance(walletId) {
  const txs = await localGetTransactions({})
  const walletTxs = txs.filter(t => t.wallet_id === walletId)
  const balance = walletTxs.reduce((sum, t) => {
    return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount))
  }, 0)
  return balance
}
