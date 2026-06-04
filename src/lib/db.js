import { openDB } from 'idb'

const DB_NAME = 'dompet-keluarga'
const DB_VERSION = 1

let dbInstance = null

export async function getDB() {
  if (dbInstance) return dbInstance
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' })
        txStore.createIndex('date', 'date')
        txStore.createIndex('context', 'context')
        txStore.createIndex('synced', 'synced')
      }
      // Wallets store
      if (!db.objectStoreNames.contains('wallets')) {
        db.createObjectStore('wallets', { keyPath: 'id' })
      }
      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        const catStore = db.createObjectStore('categories', { keyPath: 'id' })
        catStore.createIndex('context', 'context')
      }
      // Budgets store
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'id' })
      }
      // Pending queue for offline mutations
      if (!db.objectStoreNames.contains('pending_queue')) {
        db.createObjectStore('pending_queue', { keyPath: 'id', autoIncrement: true })
      }
    },
  })
  return dbInstance
}

// ─── Transactions ────────────────────────────────────────────────────────────
export async function localGetTransactions(filters = {}) {
  const db = await getDB()
  let txs = await db.getAll('transactions')
  if (filters.context) txs = txs.filter(t => t.context === filters.context)
  if (filters.month !== undefined && filters.year !== undefined) {
    txs = txs.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === filters.month && d.getFullYear() === filters.year
    })
  }
  return txs.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function localSaveTransaction(tx) {
  const db = await getDB()
  await db.put('transactions', tx)
}

export async function localDeleteTransaction(id) {
  const db = await getDB()
  await db.delete('transactions', id)
}

// ─── Wallets ─────────────────────────────────────────────────────────────────
export async function localGetWallets() {
  const db = await getDB()
  return db.getAll('wallets')
}

export async function localSaveWallet(wallet) {
  const db = await getDB()
  await db.put('wallets', wallet)
}

// ─── Categories ──────────────────────────────────────────────────────────────
export async function localGetCategories(context) {
  const db = await getDB()
  let cats = await db.getAll('categories')
  if (context) cats = cats.filter(c => c.context === context)
  return cats
}

export async function localSaveCategory(cat) {
  const db = await getDB()
  await db.put('categories', cat)
}

// ─── Budgets ─────────────────────────────────────────────────────────────────
export async function localGetBudgets(month, year) {
  const db = await getDB()
  let buds = await db.getAll('budgets')
  if (month !== undefined) buds = buds.filter(b => b.month === month && b.year === year)
  return buds
}

export async function localSaveBudget(budget) {
  const db = await getDB()
  await db.put('budgets', budget)
}

// ─── Pending Queue ───────────────────────────────────────────────────────────
export async function queueOperation(op) {
  const db = await getDB()
  await db.add('pending_queue', { ...op, createdAt: new Date().toISOString() })
}

export async function getPendingQueue() {
  const db = await getDB()
  return db.getAll('pending_queue')
}

export async function clearQueueItem(id) {
  const db = await getDB()
  await db.delete('pending_queue', id)
}
