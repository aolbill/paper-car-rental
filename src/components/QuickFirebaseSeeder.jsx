import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

const QuickFirebaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false)
  const [results, setResults] = useState([])

  const sampleCars = [
    {
      name: 'Toyota Vitz',
      category: 'Economy',
      price: 2500,
      currency: 'KSH',
      year: 2018,
      transmission: 'Manual',
      fuel: 'Petrol',
      available: true,
      features: ['Air Conditioning', 'Manual Transmission', 'Radio'],
      description: 'Compact car perfect for city driving',
      image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=500',
      averageRating: 4.2,
      reviewCount: 15,
      totalBookings: 0,
      totalRevenue: 0
    },
    {
      name: 'Nissan X-Trail',
      category: 'SUV', 
      price: 4500,
      currency: 'KSH',
      year: 2020,
      transmission: 'Automatic',
      fuel: 'Petrol',
      available: true,
      features: ['4WD', 'Air Conditioning', 'Automatic', '7 Seats'],
      description: 'Spacious SUV perfect for family trips',
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500',
      averageRating: 4.7,
      reviewCount: 28,
      totalBookings: 0,
      totalRevenue: 0
    }
  ]

  const seedData = async () => {
    if (!db) {
      setResults(['❌ Firebase not configured'])
      return
    }

    setIsSeeding(true)
    setResults([])

    try {
      for (const car of sampleCars) {
        const carData = {
          ...car,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        const docRef = await addDoc(collection(db, 'cars'), carData)
        setResults(prev => [...prev, `✅ Added car: ${car.name} (ID: ${docRef.id})`])
      }
      
      setResults(prev => [...prev, '🎉 Sample data seeded successfully!'])
    } catch (error) {
      console.error('Seeding error:', error)
      setResults(prev => [...prev, `❌ Error: ${error.message}`])
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '40px auto', 
      padding: '24px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2>🔥 Quick Firebase Data Seeder</h2>
      <p>Add sample cars to test Firebase connectivity</p>
      
      <button
        onClick={seedData}
        disabled={isSeeding}
        style={{
          background: isSeeding ? '#ccc' : '#667eea',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          cursor: isSeeding ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        {isSeeding ? '⏳ Seeding...' : '🌱 Seed Sample Cars'}
      </button>

      {results.length > 0 && (
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <h3>Results:</h3>
          {results.map((result, index) => (
            <div key={index} style={{ margin: '8px 0', fontFamily: 'monospace' }}>
              {result}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Next Steps:</strong>
        <ol>
          <li>First update Firestore rules in Firebase Console</li>
          <li>Then click "Seed Sample Cars" above</li>
          <li>Check if cars load without permission errors</li>
        </ol>
      </div>
    </div>
  )
}

export default QuickFirebaseSeeder
