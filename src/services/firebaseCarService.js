import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

class FirebaseCarService {
  
  // Get all cars
  async getAllCars() {
    try {
      const carsRef = collection(db, 'cars')
      const q = query(carsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const cars = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: cars }
    } catch (error) {
      console.error('Error getting cars:', error)
      return { success: false, error: error.message }
    }
  }

  // Get available cars
  async getAvailableCars() {
    try {
      const carsRef = collection(db, 'cars')
      const q = query(
        carsRef, 
        where('available', '==', true),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const cars = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: cars }
    } catch (error) {
      console.error('Error getting available cars:', error)
      return { success: false, error: error.message }
    }
  }

  // Get car by ID
  async getCarById(carId) {
    try {
      const carRef = doc(db, 'cars', carId)
      const carSnap = await getDoc(carRef)
      
      if (carSnap.exists()) {
        const car = { id: carSnap.id, ...carSnap.data() }
        return { success: true, data: car }
      } else {
        return { success: false, error: 'Car not found' }
      }
    } catch (error) {
      console.error('Error getting car:', error)
      return { success: false, error: error.message }
    }
  }

  // Add new car (admin only)
  async addCar(carData) {
    try {
      const newCar = {
        ...carData,
        available: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        reviewCount: 0,
        reviews: []
      }

      const carsRef = collection(db, 'cars')
      const docRef = await addDoc(carsRef, newCar)
      
      return { success: true, data: { id: docRef.id, ...newCar } }
    } catch (error) {
      console.error('Error adding car:', error)
      return { success: false, error: error.message }
    }
  }

  // Update car (admin only)
  async updateCar(carId, updateData) {
    try {
      const carRef = doc(db, 'cars', carId)
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      }

      await updateDoc(carRef, updatedData)
      
      return { success: true, data: { id: carId, ...updatedData } }
    } catch (error) {
      console.error('Error updating car:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete car (admin only)
  async deleteCar(carId) {
    try {
      const carRef = doc(db, 'cars', carId)
      await deleteDoc(carRef)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting car:', error)
      return { success: false, error: error.message }
    }
  }

  // Search cars by filters
  async searchCars(filters = {}) {
    try {
      const carsRef = collection(db, 'cars')
      let q = query(carsRef, where('available', '==', true))

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        q = query(q, where('category', '==', filters.category))
      }

      if (filters.minPrice) {
        q = query(q, where('price', '>=', filters.minPrice))
      }

      if (filters.maxPrice) {
        q = query(q, where('price', '<=', filters.maxPrice))
      }

      if (filters.transmission) {
        q = query(q, where('transmission', '==', filters.transmission))
      }

      if (filters.fuel) {
        q = query(q, where('fuel', '==', filters.fuel))
      }

      // Add ordering
      q = query(q, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      
      let cars = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Client-side filtering for complex filters
      if (filters.model) {
        cars = cars.filter(car => 
          car.name.toLowerCase().includes(filters.model.toLowerCase()) ||
          car.model?.toLowerCase().includes(filters.model.toLowerCase())
        )
      }

      if (filters.minYear) {
        cars = cars.filter(car => car.year >= filters.minYear)
      }

      if (filters.maxYear) {
        cars = cars.filter(car => car.year <= filters.maxYear)
      }

      // Sort results
      if (filters.sortBy) {
        cars.sort((a, b) => {
          switch (filters.sortBy) {
            case 'price-low':
              return a.price - b.price
            case 'price-high':
              return b.price - a.price
            case 'rating':
              return (b.averageRating || 0) - (a.averageRating || 0)
            case 'year':
              return b.year - a.year
            case 'popular':
              return (b.totalBookings || 0) - (a.totalBookings || 0)
            default:
              return a.name.localeCompare(b.name)
          }
        })
      }

      return { success: true, data: cars }
    } catch (error) {
      console.error('Error searching cars:', error)
      return { success: false, error: error.message }
    }
  }

  // Update car availability
  async updateCarAvailability(carId, available) {
    try {
      const carRef = doc(db, 'cars', carId)
      await updateDoc(carRef, {
        available,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating car availability:', error)
      return { success: false, error: error.message }
    }
  }

  // Add review to car
  async addReview(carId, reviewData) {
    try {
      const carRef = doc(db, 'cars', carId)
      const carSnap = await getDoc(carRef)
      
      if (!carSnap.exists()) {
        return { success: false, error: 'Car not found' }
      }

      const car = carSnap.data()
      const reviews = car.reviews || []
      const newReview = {
        id: Date.now().toString(),
        ...reviewData,
        createdAt: serverTimestamp()
      }

      const updatedReviews = [...reviews, newReview]
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / updatedReviews.length

      await updateDoc(carRef, {
        reviews: updatedReviews,
        reviewCount: updatedReviews.length,
        averageRating: averageRating,
        updatedAt: serverTimestamp()
      })

      return { success: true, data: newReview }
    } catch (error) {
      console.error('Error adding review:', error)
      return { success: false, error: error.message }
    }
  }

  // Get cars by category
  async getCarsByCategory(category) {
    try {
      const carsRef = collection(db, 'cars')
      const q = query(
        carsRef,
        where('category', '==', category),
        where('available', '==', true),
        orderBy('averageRating', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const cars = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: cars }
    } catch (error) {
      console.error('Error getting cars by category:', error)
      return { success: false, error: error.message }
    }
  }

  // Get featured cars (highest rated or most popular)
  async getFeaturedCars(limitCount = 6) {
    try {
      const carsRef = collection(db, 'cars')
      const q = query(
        carsRef,
        where('available', '==', true),
        orderBy('averageRating', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      
      const cars = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: cars }
    } catch (error) {
      console.error('Error getting featured cars:', error)
      return { success: false, error: error.message }
    }
  }

  // Get car statistics (admin only)
  async getCarStatistics() {
    try {
      const carsRef = collection(db, 'cars')
      const querySnapshot = await getDocs(carsRef)
      
      const cars = querySnapshot.docs.map(doc => doc.data())
      
      const stats = {
        totalCars: cars.length,
        availableCars: cars.filter(car => car.available).length,
        unavailableCars: cars.filter(car => !car.available).length,
        totalBookings: cars.reduce((sum, car) => sum + (car.totalBookings || 0), 0),
        totalRevenue: cars.reduce((sum, car) => sum + (car.totalRevenue || 0), 0),
        averageRating: cars.reduce((sum, car) => sum + (car.averageRating || 0), 0) / cars.length,
        categoryBreakdown: cars.reduce((acc, car) => {
          acc[car.category] = (acc[car.category] || 0) + 1
          return acc
        }, {}),
        topPerformers: cars
          .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
          .slice(0, 5)
          .map(car => ({
            id: car.id,
            name: car.name,
            totalRevenue: car.totalRevenue || 0,
            totalBookings: car.totalBookings || 0,
            averageRating: car.averageRating || 0
          }))
      }
      
      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting car statistics:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create and export singleton instance
const firebaseCarService = new FirebaseCarService()
export default firebaseCarService
