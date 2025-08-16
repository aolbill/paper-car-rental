// Sample car data for Firebase Firestore
// This data can be imported into your Firebase console or used with the Firebase Admin SDK

export const sampleCars = [
  {
    id: 'car_001',
    name: 'Toyota Vitz',
    category: 'Economy',
    price: 2500,
    currency: 'KSH',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=500',
    features: ['Air Conditioning', 'Manual Transmission', 'Radio', '4 Seats'],
    fuel: 'Petrol',
    transmission: 'Manual',
    year: 2018,
    available: true,
    rating: 4.2,
    reviews: 15,
    description: 'Compact and fuel-efficient car perfect for city driving in Nairobi.',
    pickup_locations: ['Nairobi CBD', 'JKIA Airport', 'Westlands'],
    averageRating: 4.2,
    reviewCount: 15,
    totalBookings: 45,
    totalRevenue: 112500,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'car_002', 
    name: 'Nissan X-Trail',
    category: 'SUV',
    price: 4500,
    currency: 'KSH',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500',
    features: ['4WD', 'Air Conditioning', 'Automatic Transmission', '7 Seats', 'GPS'],
    fuel: 'Petrol',
    transmission: 'Automatic',
    year: 2020,
    available: true,
    rating: 4.7,
    reviews: 28,
    description: 'Spacious SUV perfect for family trips and safari adventures.',
    pickup_locations: ['Nairobi CBD', 'JKIA Airport', 'Karen', 'Gigiri'],
    averageRating: 4.7,
    reviewCount: 28,
    totalBookings: 32,
    totalRevenue: 144000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'car_003',
    name: 'Toyota Prado',
    category: 'Luxury',
    price: 8000,
    currency: 'KSH',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500',
    features: ['4WD', 'Leather Seats', 'Sunroof', 'Premium Audio', 'Climate Control', '7 Seats'],
    fuel: 'Diesel',
    transmission: 'Automatic',
    year: 2021,
    available: true,
    rating: 4.9,
    reviews: 12,
    description: 'Premium luxury SUV for special occasions and VIP transportation.',
    pickup_locations: ['Nairobi CBD', 'JKIA Airport', 'Runda', 'Karen'],
    averageRating: 4.9,
    reviewCount: 12,
    totalBookings: 18,
    totalRevenue: 144000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'car_004',
    name: 'Subaru Impreza',
    category: 'Economy',
    price: 3200,
    currency: 'KSH',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500',
    features: ['Air Conditioning', 'Manual Transmission', 'Radio', '5 Seats', 'ABS'],
    fuel: 'Petrol',
    transmission: 'Manual',
    year: 2019,
    available: true,
    rating: 4.3,
    reviews: 22,
    description: 'Reliable and efficient sedan perfect for business and daily commute.',
    pickup_locations: ['Nairobi CBD', 'JKIA Airport', 'Westlands', 'Kilimani'],
    averageRating: 4.3,
    reviewCount: 22,
    totalBookings: 55,
    totalRevenue: 176000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'car_005',
    name: 'Honda CR-V',
    category: 'SUV',
    price: 5500,
    currency: 'KSH',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500',
    features: ['AWD', 'Air Conditioning', 'Automatic Transmission', '5 Seats', 'Backup Camera'],
    fuel: 'Petrol',
    transmission: 'Automatic',
    year: 2020,
    available: true,
    rating: 4.5,
    reviews: 19,
    description: 'Modern SUV with advanced safety features and comfortable interior.',
    pickup_locations: ['Nairobi CBD', 'JKIA Airport', 'Westlands', 'Karen'],
    averageRating: 4.5,
    reviewCount: 19,
    totalBookings: 26,
    totalRevenue: 143000,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const sampleLocations = [
  {
    id: 'loc_001',
    name: 'Nairobi CBD',
    city: 'Nairobi',
    county: 'Nairobi',
    type: 'city_center',
    address: 'Kimathi Street, Nairobi CBD',
    phone: '+254712345678',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'loc_002',
    name: 'JKIA Airport',
    city: 'Nairobi',
    county: 'Nairobi',
    type: 'airport',
    address: 'Jomo Kenyatta International Airport',
    phone: '+254712345679',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'loc_003',
    name: 'Westlands',
    city: 'Nairobi',
    county: 'Nairobi',
    type: 'business_district',
    address: 'Westlands Shopping Centre',
    phone: '+254712345680',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'loc_004',
    name: 'Karen',
    city: 'Nairobi',
    county: 'Nairobi',
    type: 'residential',
    address: 'Karen Shopping Centre',
    phone: '+254712345681',
    active: true,
    createdAt: new Date()
  }
]

// Instructions for importing this data to Firebase:
// 1. Go to Firebase Console > Firestore Database
// 2. Create a new collection called 'cars'
// 3. Add each car as a document with the respective ID
// 4. Create a new collection called 'locations'
// 5. Add each location as a document with the respective ID
// 
// Alternatively, use the Firebase Admin SDK or the data seeding component in the app
