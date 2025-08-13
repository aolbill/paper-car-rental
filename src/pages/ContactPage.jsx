import React, { useState } from 'react'
import { kenyanLocations } from '../data/cars'
import { bookingService } from '../services/bookingService'
import './ContactPage.css'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    location: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Submit to admin system
      await bookingService.createContactRequest(formData)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        location: ''
      })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <h1>Get In Touch</h1>
            <p>We're here to help with all your car rental needs across Kenya</p>
          </div>
        </div>
      </section>

      <section className="contact-content section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Contact Information</h2>
              <p>
                Whether you need assistance with booking, have questions about our 
                vehicles, or need roadside support, our team is here to help.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📞</div>
                  <div className="method-details">
                    <h3>Phone Support</h3>
                    <p>+254 700 000 000</p>
                    <p>Available 24/7</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-details">
                    <h3>Email Support</h3>
                    <p>info@rentkenya.com</p>
                    <p>Response within 2 hours</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">💬</div>
                  <div className="method-details">
                    <h3>WhatsApp</h3>
                    <p>+254 700 000 001</p>
                    <p>Quick replies & support</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">🕒</div>
                  <div className="method-details">
                    <h3>Business Hours</h3>
                    <p>Monday - Sunday</p>
                    <p>6:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="emergency-support">
                <h3>🚨 Emergency Roadside Assistance</h3>
                <p>
                  <strong>24/7 Emergency Line: +254 700 000 911</strong><br />
                  Available throughout Kenya for breakdowns, accidents, or any emergency situation.
                </p>
              </div>
            </div>

            <div className="contact-form-section">
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                {submitStatus === 'success' && (
                  <div className="status-message success">
                    Thank you for your message! Your request has been submitted and will be reviewed by our team within 2 hours. You'll receive a response via email.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="status-message error">
                    Sorry, there was an error sending your message. Please try again or contact us directly.
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+254700000000"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Your Location</label>
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    >
                      <option value="">Select your location</option>
                      {Object.entries(kenyanLocations).map(([key, region]) => (
                        <optgroup key={key} label={region.name}>
                          {region.locations.map((location, index) => (
                            <option key={index} value={location}>{location}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="booking">New Booking Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="modification">Booking Modification</option>
                    <option value="complaint">Complaint/Feedback</option>
                    <option value="partnership">Business Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="office-locations section">
        <div className="container">
          <h2>Our Office Locations</h2>
          <div className="offices-grid">
            <div className="office-card">
              <h3>🏢 Nairobi Head Office</h3>
              <p>
                <strong>Address:</strong> Westlands Square, Westlands Road<br />
                <strong>Phone:</strong> +254 700 000 100<br />
                <strong>Hours:</strong> Mon-Sat 8AM-6PM, Sun 9AM-5PM
              </p>
            </div>

            <div className="office-card">
              <h3>✈️ JKIA Airport Office</h3>
              <p>
                <strong>Location:</strong> Arrivals Terminal 1A<br />
                <strong>Phone:</strong> +254 700 000 200<br />
                <strong>Hours:</strong> 24/7 Operations
              </p>
            </div>

            <div className="office-card">
              <h3>🏖️ Mombasa Office</h3>
              <p>
                <strong>Address:</strong> Moi Avenue, Mombasa CBD<br />
                <strong>Phone:</strong> +254 700 000 300<br />
                <strong>Hours:</strong> Mon-Sat 8AM-6PM, Sun 9AM-5PM
              </p>
            </div>

            <div className="office-card">
              <h3>🌄 Kisumu Office</h3>
              <p>
                <strong>Address:</strong> Oginga Odinga Street<br />
                <strong>Phone:</strong> +254 700 000 400<br />
                <strong>Hours:</strong> Mon-Sat 8AM-6PM, Sun 9AM-5PM
              </p>
            </div>

            <div className="office-card">
              <h3>🏔️ Eldoret Office</h3>
              <p>
                <strong>Address:</strong> Uganda Road, Eldoret<br />
                <strong>Phone:</strong> +254 700 000 500<br />
                <strong>Hours:</strong> Mon-Sat 8AM-6PM, Sun Closed
              </p>
            </div>

            <div className="office-card">
              <h3>🦁 Nakuru Office</h3>
              <p>
                <strong>Address:</strong> Kenyatta Avenue, Nakuru<br />
                <strong>Phone:</strong> +254 700 000 600<br />
                <strong>Hours:</strong> Mon-Sat 8AM-6PM, Sun 9AM-5PM
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
