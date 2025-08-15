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

// Database service functions for Firebase
export const firebaseService = {
  // Cars
  async getCars() {
    try {
      const carsRef = collection(db, 'cars')
      const q = query(carsRef, where('available', '==', true))
      const querySnapshot = await getDocs(q)
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { data, error: null }
    } catch (error) {
      console.error('Error getting cars:', error)
      return { data: null, error }
    }
  },

  async getCarById(id) {
    try {
      const carRef = doc(db, 'cars', id)
      const carSnap = await getDoc(carRef)
      
      if (carSnap.exists()) {
        const data = { id: carSnap.id, ...carSnap.data() }
        return { data, error: null }
      } else {
        return { data: null, error: new Error('Car not found') }
      }
    } catch (error) {
      console.error('Error getting car:', error)
      return { data: null, error }
    }
  },

  async addCar(carData) {
    try {
      const carsRef = collection(db, 'cars')
      const docRef = await addDoc(carsRef, {
        ...carData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      
      const data = { id: docRef.id, ...carData }
      return { data, error: null }
    } catch (error) {
      console.error('Error adding car:', error)
      return { data: null, error }
    }
  },

  async updateCar(id, carData) {
    try {
      const carRef = doc(db, 'cars', id)
      await updateDoc(carRef, {
        ...carData,
        updated_at: serverTimestamp()
      })
      
      return { data: { id, ...carData }, error: null }
    } catch (error) {
      console.error('Error updating car:', error)
      return { data: null, error }
    }
  },

  async deleteCar(id) {
    try {
      const carRef = doc(db, 'cars', id)
      await deleteDoc(carRef)
      
      return { data: { id }, error: null }
    } catch (error) {
      console.error('Error deleting car:', error)
      return { data: null, error }
    }
  },

  // Bookings
  async createBooking(bookingData) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const docRef = await addDoc(bookingsRef, {
        ...bookingData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      
      const data = { id: docRef.id, ...bookingData }
      return { data: [data], error: null }
    } catch (error) {
      console.error('Error creating booking:', error)
      return { data: null, error }
    }
  },

  async getUserBookings(userId) {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(
        bookingsRef, 
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Get car details for each booking
      const bookingsWithCars = await Promise.all(
        bookings.map(async (booking) => {
          if (booking.car_id) {
            const carResult = await this.getCarById(booking.car_id)
            if (carResult.data) {
              booking.cars = {
                name: carResult.data.name,
                image: carResult.data.image,
                category: carResult.data.category
              }
            }
          }
          return booking
        })
      )
      
      return { data: bookingsWithCars, error: null }
    } catch (error) {
      console.error('Error getting user bookings:', error)
      return { data: null, error }
    }
  },

  async getAllBookings() {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(bookingsRef, orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { data, error: null }
    } catch (error) {
      console.error('Error getting all bookings:', error)
      return { data: null, error }
    }
  },

  async updateBooking(id, bookingData) {
    try {
      const bookingRef = doc(db, 'bookings', id)
      await updateDoc(bookingRef, {
        ...bookingData,
        updated_at: serverTimestamp()
      })
      
      return { data: { id, ...bookingData }, error: null }
    } catch (error) {
      console.error('Error updating booking:', error)
      return { data: null, error }
    }
  },

  // Locations
  async getLocations() {
    try {
      const locationsRef = collection(db, 'locations')
      const q = query(
        locationsRef, 
        where('active', '==', true),
        orderBy('city', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { data, error: null }
    } catch (error) {
      console.error('Error getting locations:', error)
      return { data: null, error }
    }
  },

  async addLocation(locationData) {
    try {
      const locationsRef = collection(db, 'locations')
      const docRef = await addDoc(locationsRef, {
        ...locationData,
        created_at: serverTimestamp()
      })
      
      const data = { id: docRef.id, ...locationData }
      return { data, error: null }
    } catch (error) {
      console.error('Error adding location:', error)
      return { data: null, error }
    }
  },

  // Users
  async createUser(userData) {
    try {
      const usersRef = collection(db, 'users')
      const docRef = await addDoc(usersRef, {
        ...userData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      
      const data = { id: docRef.id, ...userData }
      return { data: [data], error: null }
    } catch (error) {
      console.error('Error creating user:', error)
      return { data: null, error }
    }
  },

  async getUserByEmail(email) {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email), limit(1))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = { id: doc.id, ...doc.data() }
        return { data, error: null }
      } else {
        return { data: null, error: new Error('User not found') }
      }
    } catch (error) {
      console.error('Error getting user by email:', error)
      return { data: null, error }
    }
  },

  async updateUser(id, userData) {
    try {
      const userRef = doc(db, 'users', id)
      await updateDoc(userRef, {
        ...userData,
        updated_at: serverTimestamp()
      })
      
      return { data: { id, ...userData }, error: null }
    } catch (error) {
      console.error('Error updating user:', error)
      return { data: null, error }
    }
  },

  // Analytics and Stats
  async getBookingStats() {
    try {
      const bookingsRef = collection(db, 'bookings')
      const querySnapshot = await getDocs(bookingsRef)
      
      const bookings = querySnapshot.docs.map(doc => doc.data())
      
      const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      }
      
      return { data: stats, error: null }
    } catch (error) {
      console.error('Error getting booking stats:', error)
      return { data: null, error }
    }
  }
}

export default firebaseService
