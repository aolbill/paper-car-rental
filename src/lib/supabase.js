import { createClient } from '@supabase/supabase-js'

// These would typically come from environment variables
// For demo purposes, using placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseKey)

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
  // Cars
  async getCars() {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('available', true)
    return { data, error }
  },

  async getCarById(id) {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Bookings
  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
    return { data, error }
  },

  async getUserBookings(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, image, category)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Locations
  async getLocations() {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('active', true)
      .order('city', { ascending: true })
    return { data, error }
  },

  // Users
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    return { data, error }
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    return { data, error }
  }
}
