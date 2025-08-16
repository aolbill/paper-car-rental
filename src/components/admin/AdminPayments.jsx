import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/FirebaseAuthContext'
import { paymentService } from '../../services/paymentService'
import './AdminPayments.css'

const AdminPayments = ({ onRefresh }) => {
  const { user, userProfile } = useAuth()
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStats, setPaymentStats] = useState({})

  useEffect(() => {
    loadPayments()
    loadPaymentStats()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, filter, dateRange, searchTerm])

  const loadPayments = () => {
    try {
      const allPayments = paymentService.getAllPayments()
      setPayments(allPayments)
      setLoading(false)
    } catch (error) {
      console.error('Error loading payments:', error)
      setLoading(false)
    }
  }

  const loadPaymentStats = () => {
    try {
      const stats = paymentService.getPaymentStats()
      setPaymentStats(stats)
    } catch (error) {
      console.error('Error loading payment stats:', error)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(payment => payment.status === filter)
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) >= new Date(dateRange.start)
      )
    }
    if (dateRange.end) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) <= new Date(dateRange.end)
      )
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(payment => 
        payment.transactionId.toLowerCase().includes(search) ||
        payment.customerInfo.name.toLowerCase().includes(search) ||
        payment.customerInfo.email.toLowerCase().includes(search) ||
        payment.paymentMethod.toLowerCase().includes(search)
      )
    }

    setFilteredPayments(filtered)
  }

  const handleVerifyPayment = async (paymentId, verified) => {
    if (!user || userProfile?.role !== 'admin') {
      alert('Admin access required')
      return
    }

    setProcessing(true)
    try {
      const result = paymentService.verifyBankPayment(paymentId, verified, user)
      
      // Update local state
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: verified ? 'completed' : 'failed', verifiedBy: user.uid, verifiedAt: new Date().toISOString() }
          : payment
      ))

      alert(`Payment ${verified ? 'verified' : 'rejected'} successfully`)
      loadPaymentStats()
    } catch (error) {
      console.error('Error verifying payment:', error)
      alert('Error verifying payment: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleRefundPayment = async () => {
    if (!selectedPayment || !refundReason.trim()) {
      alert('Please provide a refund reason')
      return
    }

    setProcessing(true)
    try {
      const refund = await paymentService.refundPayment(
        selectedPayment.id, 
        refundReason.trim(), 
        user
      )

      // Update local state
      setPayments(prev => prev.map(payment => 
        payment.id === selectedPayment.id 
          ? { ...payment, refunded: true, refundId: refund.id }
          : payment
      ))

      setShowRefundModal(false)
      setSelectedPayment(null)
      setRefundReason('')
      alert('Refund processed successfully')
      loadPaymentStats()
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('Error processing refund: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const exportPayments = () => {
    const csvContent = [
      ['Transaction ID', 'Date', 'Customer', 'Amount', 'Method', 'Status', 'Booking ID'].join(','),
      ...filteredPayments.map(payment => [
        payment.transactionId,
        new Date(payment.createdAt).toLocaleDateString(),
        payment.customerInfo.name,
        payment.amount,
        payment.paymentMethod,
        payment.status,
        payment.bookingId
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'failed': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'mpesa': return '📱'
      case 'card': return '💳'
      case 'bank': return '🏦'
      default: return '💰'
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="admin-payments">
      <div className="payments-header">
        <div className="header-main">
          <h2>��� Payment Management</h2>
          <div className="header-actions">
            <button className="btn-secondary" onClick={loadPayments}>
              🔄 Refresh
            </button>
            <button className="btn-primary" onClick={exportPayments}>
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="payment-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-details">
              <h3>KSH {paymentStats.totalRevenue?.toLocaleString() || 0}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <h3>{paymentStats.completedPayments || 0}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-details">
              <h3>{paymentStats.pendingPayments || 0}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-details">
              <h3>{paymentStats.failedPayments || 0}</h3>
              <p>Failed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-details">
              <h3>KSH {paymentStats.thisMonthRevenue?.toLocaleString() || 0}</h3>
              <p>This Month</p>
            </div>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="payment-methods-stats">
          <h4>Payment Methods</h4>
          <div className="method-distribution">
            <div className="method-stat">
              <span className="method-icon">📱</span>
              <span className="method-name">M-Pesa</span>
              <span className="method-count">{paymentStats.paymentMethods?.mpesa || 0}</span>
            </div>
            <div className="method-stat">
              <span className="method-icon">💳</span>
              <span className="method-name">Card</span>
              <span className="method-count">{paymentStats.paymentMethods?.card || 0}</span>
            </div>
            <div className="method-stat">
              <span className="method-icon">🏦</span>
              <span className="method-name">Bank</span>
              <span className="method-count">{paymentStats.paymentMethods?.bank || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="payments-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by transaction ID, customer, or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="date-input"
            placeholder="Start date"
          />

          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="date-input"
            placeholder="End date"
          />

          <button 
            className="btn-secondary"
            onClick={() => {
              setFilter('all')
              setDateRange({ start: '', end: '' })
              setSearchTerm('')
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="payments-list">
        {filteredPayments.length === 0 ? (
          <div className="no-payments">
            <div className="no-data-icon">💳</div>
            <h3>No payments found</h3>
            <p>No payments match your current filters.</p>
          </div>
        ) : (
          <div className="payments-table">
            <div className="table-header">
              <div className="header-cell">Transaction</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Customer</div>
              <div className="header-cell">Amount</div>
              <div className="header-cell">Method</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>

            {filteredPayments.map(payment => (
              <div key={payment.id} className="table-row">
                <div className="table-cell">
                  <div className="transaction-info">
                    <strong>{payment.transactionId}</strong>
                    <small>Booking #{payment.bookingId}</small>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="date-info">
                    <strong>{new Date(payment.createdAt).toLocaleDateString()}</strong>
                    <small>{new Date(payment.createdAt).toLocaleTimeString()}</small>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="customer-info">
                    <strong>{payment.customerInfo.name}</strong>
                    <small>{payment.customerInfo.email}</small>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="amount-info">
                    <strong>KSH {payment.amount.toLocaleString()}</strong>
                    <small>{payment.currency}</small>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="method-info">
                    <span className="method-icon">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                    <span className="method-name">{payment.paymentMethod.toUpperCase()}</span>
                  </div>
                </div>

                <div className="table-cell">
                  <span 
                    className="payment-status"
                    style={{ 
                      backgroundColor: getStatusColor(payment.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {payment.status.toUpperCase()}
                  </span>
                  {payment.refunded && (
                    <span className="refund-badge">REFUNDED</span>
                  )}
                </div>

                <div className="table-cell">
                  <div className="payment-actions">
                    {payment.status === 'pending' && payment.paymentMethod === 'bank' && (
                      <div className="verify-actions">
                        <button 
                          className="btn-success-small"
                          onClick={() => handleVerifyPayment(payment.id, true)}
                          disabled={processing}
                        >
                          ✅ Verify
                        </button>
                        <button 
                          className="btn-danger-small"
                          onClick={() => handleVerifyPayment(payment.id, false)}
                          disabled={processing}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {payment.status === 'completed' && !payment.refunded && (
                      <button 
                        className="btn-warning-small"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setShowRefundModal(true)
                        }}
                        disabled={processing}
                      >
                        🔄 Refund
                      </button>
                    )}

                    <button 
                      className="btn-info-small"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      👁️ View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && !showRefundModal && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="payment-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button className="modal-close" onClick={() => setSelectedPayment(null)}>×</button>
            </div>

            <div className="modal-content">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Transaction Information</h4>
                  <div className="detail-item">
                    <label>Transaction ID:</label>
                    <span>{selectedPayment.transactionId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Amount:</label>
                    <span>KSH {selectedPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Method:</label>
                    <span>{selectedPayment.paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span style={{ color: getStatusColor(selectedPayment.status) }}>
                      {selectedPayment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedPayment.customerInfo.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedPayment.customerInfo.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Customer ID:</label>
                    <span>{selectedPayment.customerInfo.id}</span>
                  </div>
                </div>

                {selectedPayment.verifiedBy && (
                  <div className="detail-section">
                    <h4>Verification Information</h4>
                    <div className="detail-item">
                      <label>Verified By:</label>
                      <span>{selectedPayment.verifiedBy}</span>
                    </div>
                    <div className="detail-item">
                      <label>Verified At:</label>
                      <span>{new Date(selectedPayment.verifiedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {selectedPayment.refunded && (
                  <div className="detail-section">
                    <h4>Refund Information</h4>
                    <div className="detail-item">
                      <label>Refund ID:</label>
                      <span>{selectedPayment.refundId}</span>
                    </div>
                    <div className="detail-item">
                      <label>Refunded:</label>
                      <span className="refund-badge">YES</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Process Refund</h3>
              <button className="modal-close" onClick={() => setShowRefundModal(false)}>×</button>
            </div>

            <div className="modal-content">
              <div className="refund-info">
                <p><strong>Transaction:</strong> {selectedPayment.transactionId}</p>
                <p><strong>Amount:</strong> KSH {selectedPayment.amount.toLocaleString()}</p>
                <p><strong>Customer:</strong> {selectedPayment.customerInfo.name}</p>
              </div>

              <div className="refund-form">
                <label htmlFor="refundReason">Refund Reason:</label>
                <textarea
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please provide a reason for this refund..."
                  rows={4}
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowRefundModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger" 
                  onClick={handleRefundPayment}
                  disabled={processing || !refundReason.trim()}
                >
                  {processing ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPayments
