import { supabase } from './supabase'

// ─── Generic CRUD ─────────────────────────────────────────────────────────────

export async function fetchAll<T>(
  table: string,
  options?: { select?: string; filters?: Record<string, unknown>; order?: string; ascending?: boolean; limit?: number }
): Promise<T[]> {
  let q = supabase.from(table).select(options?.select || '*')
  if (options?.filters) {
    for (const [k, v] of Object.entries(options.filters)) {
      q = q.eq(k, v as string)
    }
  }
  if (options?.order) q = q.order(options.order, { ascending: options.ascending ?? false })
  if (options?.limit) q = q.limit(options.limit)
  const { data, error } = await q
  if (error) throw error
  return (data as T[]) || []
}

export async function fetchOne<T>(table: string, id: string, select = '*'): Promise<T | null> {
  const { data, error } = await supabase.from(table).select(select).eq('id', id).single()
  if (error) throw error
  return data as T
}

export async function insertRow<T>(table: string, row: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(row as never).select().single()
  if (error) throw error
  return data as T
}

export async function updateRow<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).update(updates as never).eq('id', id).select().single()
  if (error) throw error
  return data as T
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export async function upsertRow<T>(table: string, row: Partial<T>, conflict = 'id'): Promise<T> {
  const { data, error } = await supabase.from(table).upsert(row as never, { onConflict: conflict }).select().single()
  if (error) throw error
  return data as T
}

// ─── Specific helpers ─────────────────────────────────────────────────────────

// Vehicles
export const getVehicles = () => fetchAll('vehicles', { order: 'vehicle_no', ascending: true })
export const getVehicle = (id: string) => fetchOne('vehicles', id)
export const createVehicle = (data: unknown) => insertRow('vehicles', data as never)
export const updateVehicle = (id: string, data: unknown) => updateRow('vehicles', id, data as never)
export const deleteVehicle = (id: string) => deleteRow('vehicles', id)

// Drivers
export const getDrivers = () => fetchAll('drivers', { order: 'name', ascending: true })
export const getDriver = (id: string) => fetchOne('drivers', id)
export const createDriver = (data: unknown) => insertRow('drivers', data as never)
export const updateDriver = (id: string, data: unknown) => updateRow('drivers', id, data as never)
export const deleteDriver = (id: string) => deleteRow('drivers', id)

// Customers
export const getCustomers = () => fetchAll('customers', { order: 'name', ascending: true })
export const getCustomer = (id: string) => fetchOne('customers', id)
export const createCustomer = (data: unknown) => insertRow('customers', data as never)
export const updateCustomer = (id: string, data: unknown) => updateRow('customers', id, data as never)
export const deleteCustomer = (id: string) => deleteRow('customers', id)

// Suppliers
export const getSuppliers = () => fetchAll('suppliers', { order: 'name', ascending: true })
export const getSupplier = (id: string) => fetchOne('suppliers', id)
export const createSupplier = (data: unknown) => insertRow('suppliers', data as never)
export const updateSupplier = (id: string, data: unknown) => updateRow('suppliers', id, data as never)
export const deleteSupplier = (id: string) => deleteRow('suppliers', id)

// Trips
export const getTrips = (filters?: Record<string, unknown>) => fetchAll('trips', { order: 'date', ascending: false, filters })
export const getTrip = (id: string) => fetchOne('trips', id, '*, vehicles(*), drivers(*), customers(*)')
export const createTrip = (data: unknown) => insertRow('trips', data as never)
export const updateTrip = (id: string, data: unknown) => updateRow('trips', id, data as never)
export const deleteTrip = (id: string) => deleteRow('trips', id)

// Expenses
export const getExpenses = (filters?: Record<string, unknown>) => fetchAll('expenses', { order: 'date', ascending: false, filters })
export const createExpense = (data: unknown) => insertRow('expenses', data as never)
export const updateExpense = (id: string, data: unknown) => updateRow('expenses', id, data as never)
export const deleteExpense = (id: string) => deleteRow('expenses', id)

// Diesel
export const getDieselIssuances = () => fetchAll('diesel_issuances', { order: 'date_time', ascending: false })
export const createDieselIssuance = (data: unknown) => insertRow('diesel_issuances', data as never)
export const updateDieselIssuance = (id: string, data: unknown) => updateRow('diesel_issuances', id, data as never)
export const deleteDieselIssuance = (id: string) => deleteRow('diesel_issuances', id)

// Maintenances
export const getMaintenances = () => fetchAll('maintenances', { order: 'date', ascending: false })
export const createMaintenance = (data: unknown) => insertRow('maintenances', data as never)
export const updateMaintenance = (id: string, data: unknown) => updateRow('maintenances', id, data as never)
export const deleteMaintenance = (id: string) => deleteRow('maintenances', id)

// Invoices
export const getInvoices = (filters?: Record<string, unknown>) => fetchAll('invoices', { order: 'date', ascending: false, filters })
export const createInvoice = (data: unknown) => insertRow('invoices', data as never)
export const updateInvoice = (id: string, data: unknown) => updateRow('invoices', id, data as never)
export const deleteInvoice = (id: string) => deleteRow('invoices', id)

// Payments
export const getPayments = () => fetchAll('payments', { order: 'date', ascending: false })
export const createPayment = (data: unknown) => insertRow('payments', data as never)
export const updatePayment = (id: string, data: unknown) => updateRow('payments', id, data as never)
export const deletePayment = (id: string) => deleteRow('payments', id)

// Journal Entries
export const getJournalEntries = () => fetchAll('journal_entries', { order: 'date', ascending: false })
export const createJournalEntry = (data: unknown) => insertRow('journal_entries', data as never)
export const updateJournalEntry = (id: string, data: unknown) => updateRow('journal_entries', id, data as never)
export const deleteJournalEntry = (id: string) => deleteRow('journal_entries', id)

// Users
export const getUsers = () => fetchAll('users', { order: 'name', ascending: true })
export const getUser = (id: string) => fetchOne('users', id)
export const createUser = (data: unknown) => insertRow('users', data as never)
export const updateUser = (id: string, data: unknown) => updateRow('users', id, data as never)
export const deleteUser = (id: string) => deleteRow('users', id)

// Dashboard stats from views
export async function getDashboardStats() {
  const [tripStats, vehicleStats] = await Promise.all([
    supabase.from('v_trip_stats').select('*').single(),
    supabase.from('v_vehicle_stats').select('*').single(),
  ])
  return {
    trips: tripStats.data,
    vehicles: vehicleStats.data,
  }
}

// Search with full text
export async function searchTable<T>(table: string, column: string, query: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').ilike(column, `%${query}%`)
  if (error) throw error
  return (data as T[]) || []
}

// Get counts by status
export async function getCountByStatus(table: string, statusColumn = 'status') {
  const { data, error } = await supabase.from(table).select(statusColumn)
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const row of (data || [])) {
    const s = (row as Record<string, string>)[statusColumn]
    counts[s] = (counts[s] || 0) + 1
  }
  return counts
}
