import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/FirebaseAuthContext'
import './ModernAuthModal.css'

const ModernAuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { login, register, resetPassword, isLoading } = useAuth()

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen, mode])

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      confirmPassword: ''
    })
    setErrors({})
    setSuccessMessage('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (mode === 'register' && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Register mode validations
    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required'
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid Kenyan phone number'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password)
        if (result.success) {
          setSuccessMessage('Login successful!')
          setTimeout(() => {
            onClose()
          }, 1000)
        } else {
          setErrors({ general: result.error })
        }
      } else if (mode === 'register') {
        const result = await register(formData.email, formData.password, {
          name: formData.name,
          phone: formData.phone
        })
        if (result.success) {
          setSuccessMessage('Account created successfully!')
          setTimeout(() => {
            onClose()
          }, 1000)
        } else {
          setErrors({ general: result.error })
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(formData.email)
        if (result.success) {
          setSuccessMessage('Password reset email sent! Check your inbox.')
          setTimeout(() => {
            setMode('login')
            setSuccessMessage('')
          }, 3000)
        } else {
          setErrors({ general: result.error })
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    }
  }

  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div className="modern-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modern-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="modern-auth-header">
          <div className="modern-auth-logo">
            <div className="logo-icon">🚗</div>
            <span>PaperCar</span>
          </div>
          
          <h2 className="modern-auth-title">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          
          <p className="modern-auth-subtitle">
            {mode === 'login' && 'Sign in to access your account'}
            {mode === 'register' && 'Join thousands of satisfied customers'}
            {mode === 'forgot' && 'Enter your email to receive reset instructions'}
          </p>
        </div>

        {successMessage && (
          <div className="modern-success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="modern-error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modern-auth-form">
          {mode === 'register' && (
            <div className="modern-form-group">
              <label htmlFor="name" className="modern-form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`modern-form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="modern-field-error">{errors.name}</span>}
            </div>
          )}

          <div className="modern-form-group">
            <label htmlFor="email" className="modern-form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`modern-form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="modern-field-error">{errors.email}</span>}
          </div>

          {mode === 'register' && (
            <div className="modern-form-group">
              <label htmlFor="phone" className="modern-form-label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`modern-form-input ${errors.phone ? 'error' : ''}`}
                placeholder="+254 7XX XXX XXX or 07XX XXX XXX"
              />
              {errors.phone && <span className="modern-field-error">{errors.phone}</span>}
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="modern-form-group">
              <label htmlFor="password" className="modern-form-label">Password</label>
              <div className="modern-password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`modern-form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="modern-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="modern-field-error">{errors.password}</span>}
            </div>
          )}

          {mode === 'register' && (
            <div className="modern-form-group">
              <label htmlFor="confirmPassword" className="modern-form-label">Confirm Password</label>
              <div className="modern-password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`modern-form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="modern-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="modern-field-error">{errors.confirmPassword}</span>}
            </div>
          )}

          {mode === 'login' && (
            <div className="modern-form-actions">
              <button
                type="button"
                className="modern-forgot-link"
                onClick={() => handleModeSwitch('forgot')}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" className="modern-auth-button" disabled={isLoading}>
            {isLoading ? (
              <div className="modern-loading-spinner"></div>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Email'}
              </>
            )}
          </button>
        </form>

        <div className="modern-auth-footer">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="modern-link-button"
                onClick={() => handleModeSwitch('register')}
              >
                Sign up
              </button>
            </p>
          )}
          
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="modern-link-button"
                onClick={() => handleModeSwitch('login')}
              >
                Sign in
              </button>
            </p>
          )}
          
          {mode === 'forgot' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                className="modern-link-button"
                onClick={() => handleModeSwitch('login')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {mode === 'register' && (
          <div className="modern-terms">
            <p>
              By creating an account, you agree to our{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModernAuthModal
