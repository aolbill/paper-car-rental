import React, { useState } from 'react'
import { collection, addDoc, doc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/FirebaseAuthContext'

const FirebaseDataSeeder = () => {
  const { user } = useAuth()
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResults, setSeedResults] = useState([])
  const [existingCarsCount, setExistingCarsCount] = useState(null)

  // Sample car data
  const sampleCars = [
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

  const checkExistingCars = async () => {
    try {
      const carsRef = collection(db, 'cars')
      const snapshot = await getDocs(carsRef)
      setExistingCarsCount(snapshot.size)
    } catch (error) {
      console.error('Error checking existing cars:', error)
    }
  }

  const seedDatabase = async () => {
    if (!user) {
      setSeedResults([{ type: 'error', message: 'Please log in first' }])
      return
    }

    setIsSeeding(true)
    setSeedResults([])

    try {
      // Check existing cars first
      await checkExistingCars()
      
      setSeedResults(prev => [...prev, { type: 'info', message: 'Starting database seeding...' }])

      // Seed cars
      const carsRef = collection(db, 'cars')
      
      for (const car of sampleCars) {
        try {
          const carData = {
            ...car,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            bookings: [],
            reviews: []
          }
          
          const docRef = await addDoc(carsRef, carData)
          setSeedResults(prev => [...prev, { 
            type: 'success', 
            message: `Added car: ${car.name} (ID: ${docRef.id})`
          }])
        } catch (error) {
          setSeedResults(prev => [...prev, { 
            type: 'error', 
            message: `Failed to add ${car.name}: ${error.message}`
          }])
        }
      }

      setSeedResults(prev => [...prev, { 
        type: 'success', 
        message: '🎉 Database seeding completed successfully!' 
      }])

      // Refresh cars count
      await checkExistingCars()

    } catch (error) {
      setSeedResults(prev => [...prev, { 
        type: 'error', 
        message: `Seeding failed: ${error.message}`
      }])
    }

    setIsSeeding(false)
  }

  React.useEffect(() => {
    if (user) {
      checkExistingCars()
    }
  }, [user])

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h1 style={{ margin: '0 0 1rem 0' }}>🌱 Firebase Database Seeder</h1>
        <p style={{ margin: '0', color: '#6B7280' }}>
          This tool helps populate your Firebase database with sample car rental data.
        </p>
      </div>

      {!user ? (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#FEF2F2', 
          border: '1px solid #FECACA',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#DC2626' }}>❌ Not Authenticated</h3>
          <p style={{ margin: '0', color: '#7F1D1D' }}>
            Please log in to seed the database.
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#F0F9FF', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0369A1' }}>📊 Database Status</h3>
            <p style={{ margin: '0', color: '#0C4A6E' }}>
              Current cars in database: <strong>{existingCarsCount !== null ? existingCarsCount : 'Loading...'}</strong>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#0C4A6E', fontSize: '0.875rem' }}>
              This will add {sampleCars.length} sample cars to your database.
            </p>
          </div>

          <button
            onClick={seedDatabase}
            disabled={isSeeding}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isSeeding ? '#9CA3AF' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSeeding ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              marginBottom: '2rem'
            }}
          >
            {isSeeding ? '🔄 Seeding Database...' : '🌱 Seed Database'}
          </button>

          {seedResults.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '1rem' }}>📝 Seeding Results</h2>
              
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                border: '1px solid #E5E7EB', 
                borderRadius: '6px' 
              }}>
                {seedResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: index < seedResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                      backgroundColor: result.type === 'success' ? '#F0F9FF' : 
                                     result.type === 'error' ? '#FEF2F2' : '#FAFAFA'
                    }}
                  >
                    <span style={{
                      marginRight: '0.5rem',
                      fontSize: '1.2rem'
                    }}>
                      {result.type === 'success' ? '✅' : 
                       result.type === 'error' ? '❌' : 'ℹ️'}
                    </span>
                    <span style={{
                      color: result.type === 'success' ? '#065F46' : 
                             result.type === 'error' ? '#991B1B' : '#374151'
                    }}>
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '2rem',
            padding: '1rem', 
            backgroundColor: '#FFFBEB', 
            border: '1px solid #FDE68A',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400E' }}>💡 Sample Data Includes</h3>
            <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#78350F' }}>
              <li>6 different vehicles (Economy, SUV, Compact, Pickup, Luxury)</li>
              <li>Various transmission types (Automatic, Manual)</li>
              <li>Different fuel types (Petrol, Diesel)</li>
              <li>Multiple locations (Nairobi, Mombasa, Nakuru, Kisumu)</li>
              <li>Realistic pricing in Kenyan Shillings</li>
              <li>Sample ratings and booking history</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default FirebaseDataSeeder
