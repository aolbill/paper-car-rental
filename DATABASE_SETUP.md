# 🗄️ Database Setup Guide

This guide explains how to set up a proper database for the Car Rental Platform, transitioning from mock data to a production-ready database system.

## 📋 Current Architecture

### Current State (Mock Data)
- **Frontend**: React with mock data in `/src/data/cars.js`
- **Authentication**: Local storage simulation
- **Real-time**: WebSocket simulation service
- **Database**: JSON objects in memory

### Recommended Production Architecture
- **Database**: PostgreSQL with Supabase (recommended) or MongoDB
- **Authentication**: Supabase Auth or Firebase Auth
- **Real-time**: Supabase Realtime or Socket.io
- **File Storage**: Supabase Storage or Cloudinary
- **API**: REST + GraphQL (optional)

## 🏗️ Database Schema Design

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- For email auth
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin', 'host'
  is_verified BOOLEAN DEFAULT false,
  date_of_birth DATE,
  license_number VARCHAR(50),
  license_expiry DATE,
  address JSONB, -- Flexible address storage
  preferences JSONB, -- User preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. Hosts Table
```sql
CREATE TABLE hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  business_name VARCHAR(255),
  business_license VARCHAR(100),
  tax_number VARCHAR(50),
  bank_details JSONB, -- Encrypted bank information
  commission_rate DECIMAL(4,2) DEFAULT 15.00, -- Platform commission %
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'suspended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hosts_user_id ON hosts(user_id);
CREATE INDEX idx_hosts_status ON hosts(status);
```

### 3. Cars Table
```sql
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES hosts(id),
  name VARCHAR(255) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'economy', 'suv', 'luxury', etc.
  
  -- Specifications
  engine VARCHAR(100),
  fuel_type VARCHAR(20) NOT NULL, -- 'petrol', 'diesel', 'hybrid', 'electric'
  transmission VARCHAR(20) NOT NULL, -- 'manual', 'automatic', 'cvt'
  doors INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  luggage_capacity VARCHAR(50),
  mileage VARCHAR(20), -- e.g., "15 km/l"
  
  -- Pricing
  price_per_day DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  security_deposit DECIMAL(10,2),
  late_fee_per_hour DECIMAL(8,2),
  
  -- Images and Media
  primary_image_url TEXT,
  images JSONB, -- Array of image URLs
  
  -- Features and Description
  features JSONB, -- Array of features
  description TEXT,
  
  -- Availability and Status
  is_available BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'maintenance', 'retired'
  
  -- Location
  default_location JSONB, -- { address, lat, lng, pickup_instructions }
  allowed_areas JSONB, -- Geographic restrictions
  
  -- Insurance and Legal
  insurance_details JSONB,
  registration_number VARCHAR(20) UNIQUE,
  registration_expiry DATE,
  
  -- Platform Data
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  last_service_date DATE,
  next_service_due DATE,
  odometer_reading INTEGER, -- in kilometers
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_cars_host_id ON cars(host_id);
CREATE INDEX idx_cars_category ON cars(category);
CREATE INDEX idx_cars_is_available ON cars(is_available);
CREATE INDEX idx_cars_price_per_day ON cars(price_per_day);
CREATE INDEX idx_cars_rating ON cars(rating);
CREATE INDEX idx_cars_location ON cars USING GIN(default_location);
```

### 4. Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  host_id UUID NOT NULL REFERENCES hosts(id),
  
  -- Booking Details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_days INTEGER NOT NULL,
  
  -- Pricing
  daily_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  
  -- Locations
  pickup_location JSONB NOT NULL,
  dropoff_location JSONB NOT NULL,
  
  -- Status Tracking
  status VARCHAR(20) DEFAULT 'pending', 
  -- 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'
  
  -- Additional Information
  special_requests TEXT,
  additional_drivers JSONB, -- Array of additional driver details
  extras JSONB, -- Additional services (GPS, child seat, etc.)
  
  -- Timestamps
  confirmed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_car_id ON bookings(car_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
```

### 5. Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  car_id UUID NOT NULL REFERENCES cars(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  host_id UUID NOT NULL REFERENCES hosts(id),
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  
  -- Categories (optional detailed ratings)
  cleanliness_rating INTEGER,
  communication_rating INTEGER,
  value_rating INTEGER,
  
  -- Review Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  -- Response from Host
  host_response TEXT,
  host_response_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_car_id ON reviews(car_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_host_id ON reviews(host_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
```

### 6. Messages Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  host_id UUID NOT NULL REFERENCES hosts(id),
  
  -- Conversation Metadata
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'closed', 'archived'
  priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Last Message Info (for optimization)
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  unread_count_customer INTEGER DEFAULT 0,
  unread_count_host INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  
  -- Message Content
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  
  -- Attachments
  attachments JSONB, -- Array of file URLs and metadata
  
  -- Message Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  
  -- System Messages
  is_system_message BOOLEAN DEFAULT false,
  system_event_type VARCHAR(50), -- 'booking_confirmed', 'payment_received', etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_host_id ON conversations(host_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### 7. Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  payment_type VARCHAR(20) NOT NULL, -- 'booking', 'security_deposit', 'additional_charges'
  
  -- Payment Method
  payment_method VARCHAR(50), -- 'mpesa', 'card', 'bank_transfer'
  payment_provider VARCHAR(50), -- 'stripe', 'paypal', 'safaricom'
  transaction_id VARCHAR(255),
  provider_reference VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
  
  -- Timestamps
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional Info
  failure_reason TEXT,
  refund_reason TEXT,
  metadata JSONB, -- Provider-specific data
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
```

## 🚀 Supabase Setup (Recommended)

### Step 1: Create Supabase Project
```bash
# 1. Go to https://supabase.com
# 2. Click "New Project"
# 3. Choose organization and fill project details
# 4. Wait for project to be ready (2-3 minutes)
```

### Step 2: Set up Environment Variables
```bash
# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For local development
DATABASE_URL=your-database-connection-string
```

### Step 3: Install Supabase Client
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-ui-react
npm install @supabase/auth-ui-shared
```

### Step 4: Configure Supabase Client
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database helper functions
export const db = {
  // Cars
  getCars: () => supabase.from('cars').select('*'),
  getCarById: (id) => supabase.from('cars').select('*').eq('id', id).single(),
  
  // Bookings
  createBooking: (booking) => supabase.from('bookings').insert(booking),
  getBookings: (userId) => supabase.from('bookings').select('*').eq('customer_id', userId),
  
  // Reviews
  createReview: (review) => supabase.from('reviews').insert(review),
  getCarReviews: (carId) => supabase.from('reviews').select('*').eq('car_id', carId),
  
  // Messages
  createConversation: (conversation) => supabase.from('conversations').insert(conversation),
  sendMessage: (message) => supabase.from('messages').insert(message),
  getConversations: (userId) => supabase.from('conversations').select('*').eq('customer_id', userId)
}
```

### Step 5: Set up Authentication
```javascript
// src/context/AuthContext.jsx (Updated for Supabase)
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.user_metadata?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Step 6: Set up Real-time Subscriptions
```javascript
// src/hooks/useRealTimeBookings.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useRealTimeBookings = (userId) => {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    // Initial fetch
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', userId)
      setBookings(data || [])
    }

    fetchBookings()

    // Set up real-time subscription
    const subscription = supabase
      .channel('bookings')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `customer_id=eq.${userId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookings(current => [...current, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setBookings(current => 
              current.map(booking => 
                booking.id === payload.new.id ? payload.new : booking
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setBookings(current => 
              current.filter(booking => booking.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  return bookings
}
```

## 🔐 Security Setup

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Car policies
CREATE POLICY "Cars are publicly readable" ON cars
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage their cars" ON cars
  FOR ALL USING (host_id IN (
    SELECT id FROM hosts WHERE user_id = auth.uid()
  ));

-- Booking policies
CREATE POLICY "Users can read their own bookings" ON bookings
  FOR SELECT USING (customer_id = auth.uid() OR host_id IN (
    SELECT id FROM hosts WHERE user_id = auth.uid()
  ));

-- Review policies
CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());
```

### API Security
```javascript
// src/middleware/auth.js
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token verification failed' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
```

## 📊 Data Migration

### Migrate from Mock Data
```javascript
// scripts/migrate-mock-data.js
import { supabase } from '../src/lib/supabase'
import { cars } from '../src/data/cars'

const migrateCars = async () => {
  console.log('🚀 Starting car data migration...')
  
  for (const car of cars) {
    const carData = {
      name: car.name,
      make: car.name.split(' ')[0], // Extract make from name
      model: car.name.split(' ').slice(1).join(' '), // Extract model
      year: car.year,
      category: car.category.toLowerCase(),
      engine: car.specifications?.engine,
      fuel_type: car.fuel?.toLowerCase(),
      transmission: car.transmission?.toLowerCase(),
      doors: car.specifications?.doors || 4,
      seats: car.specifications?.doors || 4,
      luggage_capacity: car.specifications?.luggage,
      mileage: car.specifications?.mileage,
      price_per_day: car.price,
      currency: car.currency,
      primary_image_url: car.image,
      images: car.images || [car.image],
      features: car.features,
      description: car.description,
      is_available: car.available,
      default_location: {
        address: car.pickupLocations?.[0] || 'Nairobi CBD',
        lat: -1.2921,
        lng: 36.8219
      },
      rating: car.rating,
      total_reviews: car.reviewCount || 0
    }
    
    const { data, error } = await supabase
      .from('cars')
      .insert(carData)
    
    if (error) {
      console.error(`❌ Failed to migrate car ${car.name}:`, error)
    } else {
      console.log(`✅ Migrated car: ${car.name}`)
    }
  }
  
  console.log('🎉 Car migration completed!')
}

const migrateReviews = async () => {
  console.log('🚀 Starting reviews migration...')
  
  // Get all cars from database
  const { data: carsInDb } = await supabase.from('cars').select('id, name')
  
  for (const mockCar of cars) {
    const dbCar = carsInDb.find(c => c.name === mockCar.name)
    if (!dbCar || !mockCar.reviews) continue
    
    for (const review of mockCar.reviews) {
      const reviewData = {
        car_id: dbCar.id,
        reviewer_id: 'placeholder-user-id', // You'd need to create users first
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_verified: review.verified,
        helpful_count: review.helpful || 0
      }
      
      const { error } = await supabase
        .from('reviews')
        .insert(reviewData)
      
      if (error) {
        console.error(`❌ Failed to migrate review:`, error)
      } else {
        console.log(`✅ Migrated review for ${mockCar.name}`)
      }
    }
  }
  
  console.log('🎉 Reviews migration completed!')
}

// Run migrations
const runMigrations = async () => {
  try {
    await migrateCars()
    await migrateReviews()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMigrations()
```

## 🔄 Real-time Updates Setup

### Supabase Realtime
```javascript
// src/hooks/useRealTimeCars.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useRealTimeCars = () => {
  const [cars, setCars] = useState([])

  useEffect(() => {
    // Initial fetch
    const fetchCars = async () => {
      const { data } = await supabase.from('cars').select('*')
      setCars(data || [])
    }

    fetchCars()

    // Real-time subscription
    const subscription = supabase
      .channel('cars-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cars' }, 
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCars(current => 
              current.map(car => 
                car.id === payload.new.id ? payload.new : car
              )
            )
          }
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  return cars
}
```

## 📱 Mobile App Considerations

### React Native Setup
```bash
# Install React Native dependencies
npm install @react-native-async-storage/async-storage
npm install react-native-url-polyfill

# Configure Supabase for React Native
# src/lib/supabase-native.js
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'your-project-url'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

## 🚀 Deployment Checklist

### Pre-Production
- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Set up Row Level Security policies
- [ ] Configure authentication providers
- [ ] Set up file storage buckets
- [ ] Configure real-time subscriptions
- [ ] Set up monitoring and logging

### Production Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Payment Processing
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@your-domain.com

# SMS (for Kenyan market)
AFRICAS_TALKING_USERNAME=your-username
AFRICAS_TALKING_API_KEY=your-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_cars_available_price ON cars(is_available, price_per_day);
CREATE INDEX CONCURRENTLY idx_bookings_dates_status ON bookings(start_date, end_date, status);
CREATE INDEX CONCURRENTLY idx_reviews_car_rating ON reviews(car_id, rating);

-- Add partial indexes
CREATE INDEX CONCURRENTLY idx_active_cars ON cars(id) WHERE is_available = true;
CREATE INDEX CONCURRENTLY idx_confirmed_bookings ON bookings(id) WHERE status = 'confirmed';

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW car_stats AS
SELECT 
  c.id,
  c.name,
  c.rating,
  COUNT(b.id) as total_bookings,
  AVG(b.total_amount) as avg_booking_value,
  SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END) as total_revenue
FROM cars c
LEFT JOIN bookings b ON c.id = b.car_id
GROUP BY c.id, c.name, c.rating;

-- Refresh materialized view (run periodically)
REFRESH MATERIALIZED VIEW car_stats;
```

### Caching Strategy
```javascript
// src/lib/cache.js
import { supabase } from './supabase'

class CacheManager {
  constructor() {
    this.cache = new Map()
    this.ttl = new Map()
  }

  set(key, value, ttlMinutes = 5) {
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + (ttlMinutes * 60 * 1000))
  }

  get(key) {
    if (this.ttl.get(key) < Date.now()) {
      this.cache.delete(key)
      this.ttl.delete(key)
      return null
    }
    return this.cache.get(key)
  }

  async getCachedCars() {
    const cached = this.get('cars')
    if (cached) return cached

    const { data } = await supabase.from('cars').select('*')
    this.set('cars', data, 2) // Cache for 2 minutes
    return data
  }
}

export const cache = new CacheManager()
```

This comprehensive database setup provides a solid foundation for scaling your car rental platform from a prototype to a production-ready application with real-time capabilities, robust security, and excellent performance.
