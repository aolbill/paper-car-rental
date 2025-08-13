// Mock database - In production, this would be handled by backend
let mockBookings = [
  {
    id: 1,
    userId: 1,
    carId: 2,
    carName: 'Nissan X-Trail',
    pickupDate: '2024-08-20',
    dropoffDate: '2024-08-25',
    pickupLocation: 'JKIA Airport',
    dropoffLocation: 'Maasai Mara',
    status: 'confirmed',
    totalPrice: 42500,
    createdAt: '2024-08-15T10:00:00Z'
  },
  {
    id: 2,
    userId: 2,
    carId: 1,
    carName: 'Toyota Vitz',
    pickupDate: '2024-08-22',
    dropoffDate: '2024-08-24',
    pickupLocation: 'Nairobi CBD',
    dropoffLocation: 'Nakuru',
    status: 'confirmed',
    totalPrice: 7000,
    createdAt: '2024-08-18T14:30:00Z'
  }
]

let mockRequests = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254700123456',
    subject: 'booking',
    message: 'I need a car for safari trip next month',
    location: 'Nairobi CBD',
    status: 'pending',
    createdAt: '2024-08-10T09:00:00Z'
  }
]

export const bookingService = {
  // Check for booking conflicts
  checkDateConflict: (carId, pickupDate, dropoffDate, excludeBookingId = null) => {
    const requestStart = new Date(pickupDate)
    const requestEnd = new Date(dropoffDate)

    const conflicts = mockBookings.filter(booking => {
      // Skip if it's the same booking (for updates)
      if (excludeBookingId && booking.id === excludeBookingId) return false
      
      // Skip if different car
      if (booking.carId !== carId) return false
      
      // Skip cancelled bookings
      if (booking.status === 'cancelled') return false

      const bookingStart = new Date(booking.pickupDate)
      const bookingEnd = new Date(booking.dropoffDate)

      // Check for overlap: new booking starts before existing ends AND new booking ends after existing starts
      return requestStart < bookingEnd && requestEnd > bookingStart
    })

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts
    }
  },

  // Get available cars for date range
  getAvailableCars: (pickupDate, dropoffDate) => {
    const { cars } = require('../data/cars')
    
    return cars.filter(car => {
      if (!car.available) return false
      
      const conflict = bookingService.checkDateConflict(car.id, pickupDate, dropoffDate)
      return !conflict.hasConflict
    })
  },

  // Create new booking
  createBooking: async (bookingData, user) => {
    try {
      // Check authentication
      if (!user) {
        throw new Error('Authentication required to make a booking')
      }

      // Check for conflicts
      const conflict = bookingService.checkDateConflict(
        bookingData.carId,
        bookingData.pickupDate,
        bookingData.dropoffDate
      )

      if (conflict.hasConflict) {
        throw new Error(`Car is not available for the selected dates. Conflicts with existing booking: ${conflict.conflicts[0].pickupDate} - ${conflict.conflicts[0].dropoffDate}`)
      }

      // Validate dates
      const pickup = new Date(bookingData.pickupDate)
      const dropoff = new Date(bookingData.dropoffDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (pickup < today) {
        throw new Error('Pickup date cannot be in the past')
      }

      if (dropoff <= pickup) {
        throw new Error('Dropoff date must be after pickup date')
      }

      // Create booking
      const newBooking = {
        id: Date.now(),
        userId: user.id,
        ...bookingData,
        status: 'pending_payment', // Pending payment to confirm
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockBookings.push(newBooking)
      
      return {
        success: true,
        booking: newBooking,
        message: 'Booking created successfully and is pending approval'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get user bookings
  getUserBookings: (userId) => {
    return mockBookings.filter(booking => booking.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  // Admin functions
  getAllBookings: () => {
    return mockBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  updateBookingStatus: (bookingId, status, adminUser) => {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Admin access required')
    }

    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId)
    if (bookingIndex === -1) {
      throw new Error('Booking not found')
    }

    mockBookings[bookingIndex] = {
      ...mockBookings[bookingIndex],
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser.id
    }

    return mockBookings[bookingIndex]
  },

  // Update booking payment status
  updateBookingPaymentStatus: (bookingId, paymentStatus, paymentId = null) => {
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId)
    if (bookingIndex === -1) {
      throw new Error('Booking not found')
    }

    let newStatus = mockBookings[bookingIndex].status

    // Update booking status based on payment status
    switch (paymentStatus) {
      case 'completed':
        newStatus = 'confirmed'
        break
      case 'pending':
        newStatus = 'pending_payment_verification'
        break
      case 'failed':
        newStatus = 'payment_failed'
        break
    }

    mockBookings[bookingIndex] = {
      ...mockBookings[bookingIndex],
      status: newStatus,
      paymentStatus,
      paymentId,
      paidAt: paymentStatus === 'completed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    }

    return mockBookings[bookingIndex]
  },

  // Get booking by ID
  getBookingById: (bookingId) => {
    return mockBookings.find(b => b.id === bookingId)
  },

  // Contact requests management
  createContactRequest: async (requestData) => {
    const newRequest = {
      id: Date.now(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    mockRequests.push(newRequest)
    return newRequest
  },

  getAllRequests: () => {
    return mockRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  updateRequestStatus: (requestId, status, adminUser) => {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Admin access required')
    }

    const requestIndex = mockRequests.findIndex(r => r.id === requestId)
    if (requestIndex === -1) {
      throw new Error('Request not found')
    }

    mockRequests[requestIndex] = {
      ...mockRequests[requestIndex],
      status,
      updatedAt: new Date().toISOString(),
      handledBy: adminUser.id
    }

    return mockRequests[requestIndex]
  },

  // Get booking statistics
  getBookingStats: () => {
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisYear = new Date(today.getFullYear(), 0, 1)

    return {
      total: mockBookings.length,
      pending: mockBookings.filter(b => b.status === 'pending').length,
      pendingPayment: mockBookings.filter(b => b.status === 'pending_payment').length,
      confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
      completed: mockBookings.filter(b => b.status === 'completed').length,
      cancelled: mockBookings.filter(b => b.status === 'cancelled').length,
      paymentFailed: mockBookings.filter(b => b.status === 'payment_failed').length,
      thisMonth: mockBookings.filter(b => new Date(b.createdAt) >= thisMonth).length,
      thisYear: mockBookings.filter(b => new Date(b.createdAt) >= thisYear).length,
      revenue: mockBookings
        .filter(b => (b.status === 'completed' || b.status === 'confirmed') && b.paymentStatus === 'completed')
        .reduce((total, b) => total + (b.totalPrice || 0), 0),
      paidBookings: mockBookings.filter(b => b.paymentStatus === 'completed').length
    }
  }
}
