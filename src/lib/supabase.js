import { createClient } from '@supabase/supabase-js'

// Check if Supabase credentials are properly configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create client if valid credentials are provided
const isSupabaseConfigured = supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'your-supabase-url' &&
  supabaseKey !== 'your-supabase-anon-key' &&
  supabaseUrl.startsWith('https://')

let supabase = null

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error.message)
  }
} else {
  console.warn('Supabase not configured. Using Firebase as primary database.')
}

export { supabase }

// Database schemas for reference
export const dbSchemas = {
  cars: {
    id: 'uuid',
    name: 'text',
    category: 'text',
    price: 'integer',
    currency: 'text',
    image: 'text',
    features: 'text[]',
    fuel: 'text',
    transmission: 'text',
    year: 'integer',
    available: 'boolean',
    rating: 'numeric',
    reviews: 'integer',
    description: 'text',
    pickup_locations: 'text[]',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  users: {
    id: 'uuid',
    email: 'text',
    name: 'text',
    phone: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  bookings: {
    id: 'uuid',
    user_id: 'uuid',
    car_id: 'uuid',
    pickup_location: 'text',
    dropoff_location: 'text',
    pickup_date: 'date',
    dropoff_date: 'date',
    pickup_time: 'time',
    dropoff_time: 'time',
    driver_license: 'text',
    special_requests: 'text',
    base_price: 'integer',
    tax: 'integer',
    total_price: 'integer',
    status: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  locations: {
    id: 'uuid',
    name: 'text',
    city: 'text',
    county: 'text',
    type: 'text', // airport, hotel, city_center, etc.
    address: 'text',
    phone: 'text',
    active: 'boolean',
    created_at: 'timestamp'
  }
}

// Database service functions
export const dbService = {
  // Helper to check if Supabase is available
  _checkSupabase() {
    if (!supabase) {
      throw new Error('Supabase not configured. Please use Firebase services instead.')
    }
    return supabase
  },

  // Cars
  async getCars() {
    try {
      const client = this._checkSupabase()
      const { data, error } = await client
        .from('cars')
        .select('*')
        .eq('available', true)
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  async getCarById(id) {
    try {
      const client = this._checkSupabase()
      const { data, error } = await client
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Bookings
  async createBooking(bookingData) {
    try {
      const client = this._checkSupabase()
      const { data, error } = await client
        .from('bookings')
        .insert([bookingData])
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  async getUserBookings(userId) {
    try {
      const client = this._checkSupabase()
      const { data, error } = await client
        .from('bookings')
        .select(`
          *,
          cars(name, image, category)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Locations
  async getLocations() {
    try {
      const client = this._checkSupabase()
      const { data, error } = await client
        .from('locations')
        .select('*')
        .eq('active', true)
        .order('city', { ascending: true })
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Users
  async createUser(userData) {
    try {
      const client = this._checkSupabase()
      const { data, error } = await client
        .from('users')
        .insert([userData])
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  async getUserByEmail(email) {
    try {
      const client = this._checkSupabase()
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}
