export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          username: string
          email: string
          role: string
          department: string
          status: 'Active' | 'Inactive' | 'Locked'
          last_login: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      vehicles: {
        Row: {
          id: string
          vehicle_no: string
          type: string
          model: string
          brand: string
          year: number
          rc_no: string
          insurance_valid_up_to: string
          permit_valid_up_to: string
          fc_valid_up_to: string
          status: 'Running' | 'Available' | 'Workshop' | 'Breakdown' | 'Inactive'
          location: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>
      }
      drivers: {
        Row: {
          id: string
          name: string
          mobile: string
          license_no: string
          license_expiry: string
          status: 'Active' | 'Inactive' | 'On Trip'
          city: string
          joined_date: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['drivers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>
      }
      customers: {
        Row: {
          id: string
          customer_no: string
          name: string
          mobile: string
          city: string
          credit_limit: number
          outstanding: number
          status: 'Active' | 'Inactive'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      suppliers: {
        Row: {
          id: string
          supplier_no: string
          name: string
          category: string
          mobile: string
          city: string
          credit_limit: number
          outstanding: number
          status: 'Active' | 'Inactive'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>
      }
      trips: {
        Row: {
          id: string
          trip_no: string
          date: string
          vehicle_id: string
          driver_id: string
          customer_id: string | null
          from_location: string
          to_location: string
          load_type: string
          load_quantity: number
          load_unit: string
          freight_amount: number
          advance_received: number
          expenses: number
          status: 'Loading' | 'In Transit' | 'Unloading' | 'Completed' | 'Delayed' | 'Cancelled'
          eta: string | null
          distance_km: number | null
          start_time: string | null
          end_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          expense_no: string
          date: string
          category: string
          description: string
          vendor: string | null
          vehicle_id: string | null
          driver_id: string | null
          amount: number
          payment_mode: string
          status: 'Approved' | 'Pending' | 'Rejected'
          trip_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      diesel_issuances: {
        Row: {
          id: string
          reference_no: string
          date_time: string
          vehicle_id: string
          driver_id: string
          liters: number
          rate_per_liter: number
          amount: number
          pump_vendor: string
          issued_by: string
          odometer_reading: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['diesel_issuances']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['diesel_issuances']['Insert']>
      }
      maintenances: {
        Row: {
          id: string
          work_order_no: string
          vehicle_id: string
          type: string
          description: string
          date: string
          cost: number
          status: 'Completed' | 'In Progress' | 'Planned' | 'Overdue'
          technician: string | null
          next_due_km: number | null
          next_due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenances']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['maintenances']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          invoice_no: string
          date: string
          type: 'Customer' | 'Supplier'
          party_id: string
          amount: number
          paid: number
          outstanding: number
          due_date: string
          status: 'Paid' | 'Partial' | 'Unpaid'
          trip_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      payments: {
        Row: {
          id: string
          date: string
          type: 'Receipt' | 'Payment'
          party_id: string
          party_type: 'Customer' | 'Supplier'
          amount: number
          mode: string
          reference_no: string | null
          invoice_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
    }
  }
}
