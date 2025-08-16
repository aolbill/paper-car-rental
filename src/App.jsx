import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/FirebaseAuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CarsPage from './pages/CarsPage'
import CarDetailPage from './pages/CarDetailPage'
import UserDashboard from './pages/UserDashboard'
import ModernUserDashboard from './pages/ModernUserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserProfile from './components/UserProfile'
import FirebaseUserTest from './components/FirebaseUserTest'
import GoogleMapsApiDiagnostic from './components/GoogleMapsApiDiagnostic'
import FirebasePermissionsDiagnostic from './components/FirebasePermissionsDiagnostic'
import FirebaseDataSeeder from './components/FirebaseDataSeeder'
import FirebaseConnectionTest from './components/FirebaseConnectionTest'
import QuickFirebaseSeeder from './components/QuickFirebaseSeeder'
import ModernAuthModal from './components/ModernAuthModal'
import BookingModal from './components/BookingModal'
import ToastNotification from './components/ToastNotification'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const openBookingModal = (car) => {
    setSelectedCar(car)
    setBookingModalOpen(true)
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <Navigation onOpenAuth={openAuthModal} />
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage onBookCar={openBookingModal} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cars" element={<CarsPage onBookCar={openBookingModal} />} />
              <Route path="/cars/:id" element={<CarDetailPage onBookCar={openBookingModal} />} />
              <Route path="/dashboard" element={<ModernUserDashboard />} />
            <Route path="/dashboard/legacy" element={<UserDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/test/firebase" element={<FirebaseUserTest />} />
            <Route path="/test/googlemaps" element={<GoogleMapsApiDiagnostic />} />
            <Route path="/test/permissions" element={<FirebasePermissionsDiagnostic />} />
            <Route path="/test/seed" element={<FirebaseDataSeeder />} />
            <Route path="/test/firebase" element={<FirebaseConnectionTest />} />
            <Route path="/test/quick-seed" element={<QuickFirebaseSeeder />} />
            <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          <Footer />

          <ModernAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
          
          <BookingModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            car={selectedCar}
          />

          <ToastNotification />
        </div>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
