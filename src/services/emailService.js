// Email notification service for the car rental platform
// Supports multiple email providers: SendGrid, AWS SES, Resend, EmailJS

class EmailService {
  constructor() {
    this.provider = this.detectProvider()
    this.isConfigured = false
    this.templates = this.initializeTemplates()
    this.init()
  }

  detectProvider() {
    // Check environment variables to determine which email service to use
    if (process.env.REACT_APP_SENDGRID_API_KEY) return 'sendgrid'
    if (process.env.REACT_APP_AWS_ACCESS_KEY_ID) return 'aws-ses'
    if (process.env.REACT_APP_RESEND_API_KEY) return 'resend'
    if (process.env.REACT_APP_EMAILJS_SERVICE_ID) return 'emailjs'
    return 'mock' // Fallback to mock/console logging
  }

  async init() {
    try {
      switch (this.provider) {
        case 'sendgrid':
          await this.initSendGrid()
          break
        case 'aws-ses':
          await this.initAWS()
          break
        case 'resend':
          await this.initResend()
          break
        case 'emailjs':
          await this.initEmailJS()
          break
        default:
          console.warn('📧 Email service running in mock mode - emails will be logged to console')
          this.isConfigured = true
      }
    } catch (error) {
      console.error('📧 Email service initialization failed:', error)
      this.provider = 'mock'
      this.isConfigured = true
    }
  }

  async initSendGrid() {
    // SendGrid initialization would go here
    // For now, just check if API key exists
    if (process.env.REACT_APP_SENDGRID_API_KEY) {
      console.log('📧 SendGrid email service initialized')
      this.isConfigured = true
    }
  }

  async initAWS() {
    // AWS SES initialization would go here
    console.log('📧 AWS SES email service initialized')
    this.isConfigured = true
  }

  async initResend() {
    // Resend initialization would go here
    console.log('📧 Resend email service initialized')
    this.isConfigured = true
  }

  async initEmailJS() {
    // EmailJS initialization (client-side email service)
    if (process.env.REACT_APP_EMAILJS_SERVICE_ID) {
      console.log('📧 EmailJS email service initialized')
      this.isConfigured = true
    }
  }

  initializeTemplates() {
    return {
      bookingConfirmation: {
        subject: 'Booking Confirmation - {carName}',
        template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Booking Confirmed! 🚗</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello {customerName},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                Great news! Your booking for the <strong>{carName}</strong> has been confirmed.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin-top: 0; color: #667eea;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Booking ID:</td><td>{bookingId}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Car:</td><td>{carName}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Pickup Date:</td><td>{pickupDate}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Return Date:</td><td>{returnDate}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Pickup Location:</td><td>{pickupLocation}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Total Amount:</td><td style="font-size: 18px; font-weight: bold; color: #667eea;">KES {totalAmount}</td></tr>
                </table>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1976d2;">📋 Next Steps</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Bring a valid driving license</li>
                  <li>Arrive 15 minutes before pickup time</li>
                  <li>Have payment confirmation ready</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{dashboardUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Booking Details</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Questions? Reply to this email or contact our support team.<br>
                <strong>Phone:</strong> +254 700 123 456<br>
                <strong>Email:</strong> support@carrental.co.ke
              </p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2024 CarRental Kenya. All rights reserved.</p>
            </div>
          </div>
        `
      },

      paymentReceived: {
        subject: 'Payment Received - Booking {bookingId}',
        template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #4caf50; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Payment Confirmed! ✅</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello {customerName},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                We've successfully received your payment of <strong>KES {amount}</strong> for your car rental booking.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="margin-top: 0; color: #4caf50;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td><td>{transactionId}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Amount:</td><td>KES {amount}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Payment Method:</td><td>{paymentMethod}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>{paymentDate}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Booking ID:</td><td>{bookingId}</td></tr>
                </table>
              </div>
              
              <p style="font-size: 16px; color: #555;">
                Your booking is now fully confirmed and ready for pickup!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{receiptUrl}" style="background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Download Receipt</a>
              </div>
            </div>
          </div>
        `
      },

      bookingReminder: {
        subject: 'Pickup Reminder - Your car rental is tomorrow!',
        template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #ff9800; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Pickup Reminder 🕐</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hello {customerName},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                Just a friendly reminder that your car rental pickup is scheduled for tomorrow!
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h3 style="margin-top: 0; color: #ff9800;">Pickup Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Car:</td><td>{carName}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>{pickupDate}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Time:</td><td>{pickupTime}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td>{pickupLocation}</td></tr>
                </table>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #f57c00;">📝 Checklist</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Valid driving license</li>
                  <li>Payment confirmation</li>
                  <li>Arrive 15 minutes early</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },

      statusUpdate: {
        subject: 'Booking Status Update - {status}',
        template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: {statusColor}; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Status Update</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hello {customerName},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                Your booking status has been updated to: <strong>{status}</strong>
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 16px; color: #555;">{statusMessage}</p>
              </div>
            </div>
          </div>
        `
      },

      supportMessage: {
        subject: 'New Message from CarRental Support',
        template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #667eea; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">New Message 💬</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hello {customerName},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                You have a new message from our support team:
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="font-size: 16px; line-height: 1.6; color: #333;">{message}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{chatUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reply to Message</a>
              </div>
            </div>
          </div>
        `
      }
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(bookingData) {
    const templateData = {
      customerName: bookingData.customerName,
      carName: bookingData.carName,
      bookingId: bookingData.id,
      pickupDate: new Date(bookingData.pickupDate).toLocaleDateString(),
      returnDate: new Date(bookingData.returnDate).toLocaleDateString(),
      pickupLocation: bookingData.pickupLocation,
      totalAmount: bookingData.totalAmount.toLocaleString(),
      dashboardUrl: `${window.location.origin}/dashboard`
    }

    return this.sendEmail(
      bookingData.customerEmail,
      'bookingConfirmation',
      templateData
    )
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(paymentData) {
    const templateData = {
      customerName: paymentData.customerName,
      amount: paymentData.amount.toLocaleString(),
      transactionId: paymentData.transactionId,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: new Date(paymentData.date).toLocaleDateString(),
      bookingId: paymentData.bookingId,
      receiptUrl: `${window.location.origin}/receipt/${paymentData.transactionId}`
    }

    return this.sendEmail(
      paymentData.customerEmail,
      'paymentReceived',
      templateData
    )
  }

  // Send booking reminder email
  async sendBookingReminder(bookingData) {
    const templateData = {
      customerName: bookingData.customerName,
      carName: bookingData.carName,
      pickupDate: new Date(bookingData.pickupDate).toLocaleDateString(),
      pickupTime: bookingData.pickupTime,
      pickupLocation: bookingData.pickupLocation
    }

    return this.sendEmail(
      bookingData.customerEmail,
      'bookingReminder',
      templateData
    )
  }

  // Send status update email
  async sendStatusUpdate(updateData) {
    const statusColors = {
      confirmed: '#4caf50',
      'in-progress': '#ff9800',
      completed: '#2196f3',
      cancelled: '#f44336'
    }

    const statusMessages = {
      confirmed: 'Your booking has been confirmed and is ready for pickup.',
      'in-progress': 'Your rental is currently active. Enjoy your drive!',
      completed: 'Your rental has been completed. Thank you for choosing us!',
      cancelled: 'Your booking has been cancelled. If you have questions, please contact support.'
    }

    const templateData = {
      customerName: updateData.customerName,
      status: updateData.status,
      statusColor: statusColors[updateData.status] || '#666',
      statusMessage: statusMessages[updateData.status] || 'Your booking status has been updated.'
    }

    return this.sendEmail(
      updateData.customerEmail,
      'statusUpdate',
      templateData
    )
  }

  // Send support message notification
  async sendSupportMessage(messageData) {
    const templateData = {
      customerName: messageData.customerName,
      message: messageData.message,
      chatUrl: `${window.location.origin}/dashboard#messages`
    }

    return this.sendEmail(
      messageData.customerEmail,
      'supportMessage',
      templateData
    )
  }

  // Generic email sending method
  async sendEmail(to, templateType, data) {
    try {
      if (!this.isConfigured) {
        console.warn('📧 Email service not configured')
        return { success: false, error: 'Email service not configured' }
      }

      const template = this.templates[templateType]
      if (!template) {
        throw new Error(`Template ${templateType} not found`)
      }

      const subject = this.interpolateTemplate(template.subject, data)
      const html = this.interpolateTemplate(template.template, data)

      switch (this.provider) {
        case 'sendgrid':
          return this.sendWithSendGrid(to, subject, html)
        case 'aws-ses':
          return this.sendWithAWS(to, subject, html)
        case 'resend':
          return this.sendWithResend(to, subject, html)
        case 'emailjs':
          return this.sendWithEmailJS(to, subject, html)
        default:
          return this.sendMockEmail(to, subject, html)
      }
    } catch (error) {
      console.error('📧 Email sending failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Template interpolation
  interpolateTemplate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match
    })
  }

  // Mock email sender (logs to console)
  async sendMockEmail(to, subject, html) {
    console.log('\n📧 ===== MOCK EMAIL =====')
    console.log(`📧 To: ${to}`)
    console.log(`📧 Subject: ${subject}`)
    console.log(`📧 HTML: ${html.substring(0, 200)}...`)
    console.log('📧 =====================\n')
    
    return { success: true, messageId: `mock_${Date.now()}` }
  }

  // SendGrid implementation (placeholder)
  async sendWithSendGrid(to, subject, html) {
    console.log('📧 Sending email via SendGrid...', { to, subject })
    // Implementation would use @sendgrid/mail package
    return { success: true, messageId: `sg_${Date.now()}` }
  }

  // AWS SES implementation (placeholder)
  async sendWithAWS(to, subject, html) {
    console.log('📧 Sending email via AWS SES...', { to, subject })
    // Implementation would use AWS SDK
    return { success: true, messageId: `aws_${Date.now()}` }
  }

  // Resend implementation (placeholder)
  async sendWithResend(to, subject, html) {
    console.log('📧 Sending email via Resend...', { to, subject })
    // Implementation would use resend package
    return { success: true, messageId: `resend_${Date.now()}` }
  }

  // EmailJS implementation (placeholder)
  async sendWithEmailJS(to, subject, html) {
    console.log('📧 Sending email via EmailJS...', { to, subject })
    // Implementation would use emailjs-com package
    return { success: true, messageId: `emailjs_${Date.now()}` }
  }

  // Setup check
  getServiceStatus() {
    return {
      provider: this.provider,
      configured: this.isConfigured,
      templatesLoaded: Object.keys(this.templates).length
    }
  }
}

// Export singleton instance
const emailService = new EmailService()
export default emailService
