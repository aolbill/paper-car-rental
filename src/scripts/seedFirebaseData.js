import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Initial car data to seed Firebase
const initialCars = [
  {
    name: "Toyota Vitz",
    model: "Vitz",
    category: "Economy",
    price: 3500,
    currency: "KSH",
    year: 2020,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    features: ["Automatic", "Air Conditioning", "Bluetooth", "Power Steering"],
    description: "Perfect city car with excellent fuel economy and reliability. Ideal for navigating Nairobi's busy streets.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1566473179817-5d3e87501e1d?w=500&h=300&fit=crop"
    ],
    location: "Nairobi",
    available: true,
    color: "Silver",
    mileage: "15km/L",
    plateNumber: "KCA 123A",
    averageRating: 4.5,
    reviewCount: 127,
    totalBookings: 89,
    totalRevenue: 311500
  },
  {
    name: "Toyota Prado",
    model: "Prado",
    category: "SUV",
    price: 12000,
    currency: "KSH",
    year: 2019,
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 7,
    features: ["4WD", "Air Conditioning", "Bluetooth", "GPS Navigation", "Leather Seats"],
    description: "Premium SUV perfect for safari adventures and family trips. Spacious and comfortable for long journeys.",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop"
    ],
    location: "Nairobi",
    available: true,
    color: "White",
    mileage: "10km/L",
    plateNumber: "KCB 456B",
    averageRating: 4.8,
    reviewCount: 94,
    totalBookings: 67,
    totalRevenue: 804000
  },
  {
    name: "Honda Fit",
    model: "Fit",
    category: "Compact",
    price: 4000,
    currency: "KSH",
    year: 2021,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    features: ["Automatic", "Air Conditioning", "Bluetooth", "Reverse Camera"],
    description: "Modern compact car with great fuel efficiency and modern features. Perfect for city driving.",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&h=300&fit=crop"
    ],
    location: "Mombasa",
    available: true,
    color: "Blue",
    mileage: "16km/L",
    plateNumber: "KCC 789C",
    averageRating: 4.3,
    reviewCount: 76,
    totalBookings: 54,
    totalRevenue: 216000
  },
  {
    name: "Toyota Hilux",
    model: "Hilux",
    category: "Pickup",
    price: 8000,
    currency: "KSH",
    year: 2020,
    transmission: "Manual",
    fuel: "Diesel",
    seats: 5,
    features: ["4WD", "Air Conditioning", "Power Steering", "Tow Bar"],
    description: "Rugged pickup truck perfect for cargo transport and off-road adventures. Built tough for Kenya's terrain.",
    image: "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1596008194705-2091cd6764d4?w=500&h=300&fit=crop"
    ],
    location: "Nakuru",
    available: true,
    color: "Red",
    mileage: "12km/L",
    plateNumber: "KCD 012D",
    averageRating: 4.6,
    reviewCount: 43,
    totalBookings: 32,
    totalRevenue: 256000
  },
  {
    name: "Mercedes C-Class",
    model: "C-Class",
    category: "Luxury",
    price: 15000,
    currency: "KSH",
    year: 2022,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    features: ["Leather Seats", "Sunroof", "Bluetooth", "GPS Navigation", "Premium Sound"],
    description: "Luxury sedan for special occasions and business meetings. Experience premium comfort and style.",
    image: "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1617467735692-c7d6a61a8e61?w=500&h=300&fit=crop"
    ],
    location: "Nairobi",
    available: true,
    color: "Black",
    mileage: "11km/L",
    plateNumber: "KCE 345E",
    averageRating: 4.9,
    reviewCount: 28,
    totalBookings: 19,
    totalRevenue: 285000
  },
  {
    name: "Nissan X-Trail",
    model: "X-Trail",
    category: "SUV",
    price: 9000,
    currency: "KSH",
    year: 2021,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 7,
    features: ["4WD", "Air Conditioning", "Bluetooth", "Reverse Camera", "Panoramic Roof"],
    description: "Versatile SUV perfect for family trips and weekend getaways. Spacious interior with modern features.",
    image: "https://images.unsplash.com/photo-1520446266423-b5a8a07ede9e?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1520446266423-b5a8a07ede9e?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=500&h=300&fit=crop"
    ],
    location: "Kisumu",
    available: true,
    color: "Silver",
    mileage: "13km/L",
    plateNumber: "KCF 678F",
    averageRating: 4.4,
    reviewCount: 51,
    totalBookings: 38,
    totalRevenue: 342000
  }
]

// Initial admin user data
const adminUser = {
  email: "admin@papercarrental.com",
  name: "Admin User",
  phone: "+254700000000",
  role: "admin",
  profileImageUrl: "",
  dateOfBirth: "",
  address: {
    street: "Admin Office",
    city: "Nairobi",
    county: "Nairobi",
    postalCode: "00100"
  },
  preferences: {
    notifications: true,
    newsletter: true,
    smsUpdates: true,
    language: "en"
  },
  verification: {
    isVerified: true,
    verificationStatus: "verified",
    documents: {
      nationalId: { uploaded: true, verified: true, url: "", rejectionReason: "" },
      drivingLicense: { uploaded: true, verified: true, url: "", rejectionReason: "" },
      proofOfResidence: { uploaded: true, verified: true, url: "", rejectionReason: "" }
    }
  },
  bookingHistory: [],
  favoriteVehicles: [],
  paymentMethods: [],
  emergencyContact: {
    name: "",
    phone: "",
    relationship: ""
  },
  accountStatus: "active",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  lastLoginAt: serverTimestamp()
}

export const seedFirebaseData = async () => {
  try {
    console.log('Starting Firebase data seeding...')
    
    // Seed cars
    console.log('Seeding cars...')
    const carsRef = collection(db, 'cars')
    
    for (const car of initialCars) {
      const carData = {
        ...car,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        bookings: [],
        reviews: []
      }
      
      const docRef = await addDoc(carsRef, carData)
      console.log(`Added car: ${car.name} with ID: ${docRef.id}`)
    }
    
    // Create admin user with specific ID
    console.log('Creating admin user...')
    const adminDocRef = doc(db, 'users', 'admin-user-papercarrental')
    await setDoc(adminDocRef, adminUser)
    console.log('Admin user created successfully')
    
    console.log('Firebase data seeding completed successfully!')
    return { success: true, message: 'Data seeded successfully' }
    
  } catch (error) {
    console.error('Error seeding Firebase data:', error)
    return { success: false, error: error.message }
  }
}

// Function to clear all data (use with caution)
export const clearFirebaseData = async () => {
  try {
    console.log('WARNING: This will clear all data from Firebase!')
    // Note: In production, you'd need to implement proper deletion
    // For now, we'll just log a warning
    console.log('Clear function not implemented for safety reasons')
    return { success: false, message: 'Clear function not implemented' }
  } catch (error) {
    console.error('Error clearing Firebase data:', error)
    return { success: false, error: error.message }
  }
}

export default { seedFirebaseData, clearFirebaseData }
