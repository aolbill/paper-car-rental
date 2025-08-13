import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import './AdminRequests.css'

const AdminRequests = ({ onRefresh }) => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, statusFilter, subjectFilter, searchTerm])

  const loadRequests = () => {
    const allRequests = bookingService.getAllRequests()
    setRequests(allRequests)
  }

  const filterRequests = () => {
    let filtered = [...requests]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(request => request.subject === subjectFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await bookingService.updateRequestStatus(requestId, newStatus, user)
      loadRequests()
      onRefresh()
      alert(`Request status updated to ${newStatus}`)
    } catch (error) {
      alert(`Failed to update request: ${error.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'in_progress': return '#3b82f6'
      case 'resolved': return '#10b981'
      case 'closed': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getPriorityFromSubject = (subject) => {
    switch (subject) {
      case 'complaint': return 'High'
      case 'booking': return 'Medium'
      case 'support': return 'Medium'
      case 'modification': return 'Low'
      case 'partnership': return 'Low'
      default: return 'Low'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const viewRequestDetails = (request) => {
    setSelectedRequest(request)
    setReplyMessage('')
    setShowDetails(true)
  }

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message')
      return
    }

    // In a real application, this would send an email
    alert(`Reply sent to ${selectedRequest.email}:\n\n${replyMessage}`)
    
    // Update request status to resolved
    handleStatusChange(selectedRequest.id, 'resolved')
    setShowDetails(false)
    setReplyMessage('')
  }

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'booking': return '📅'
      case 'support': return '🛠️'
      case 'modification': return '✏️'
      case 'complaint': return '⚠️'
      case 'partnership': return '🤝'
      default: return '📧'
    }
  }

  return (
    <div className="admin-requests">
      <div className="requests-header">
        <h2>📨 Customer Requests</h2>
        <div className="requests-actions">
          <button className="btn-secondary" onClick={loadRequests}>
            🔄 Refresh
          </button>
          <button className="btn-primary">
            📧 Send Newsletter
          </button>
        </div>
      </div>

      <div className="requests-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="subjectFilter">Subject:</label>
          <select
            id="subjectFilter"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="booking">Booking Inquiry</option>
            <option value="support">Customer Support</option>
            <option value="modification">Booking Modification</option>
            <option value="complaint">Complaint/Feedback</option>
            <option value="partnership">Business Partnership</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchTerm">Search:</label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or message..."
          />
        </div>
      </div>

      <div className="requests-stats">
        <div className="stat-summary">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
        <div className="priority-stats">
          <span className="priority high">High: {filteredRequests.filter(r => getPriorityFromSubject(r.subject) === 'High').length}</span>
          <span className="priority medium">Medium: {filteredRequests.filter(r => getPriorityFromSubject(r.subject) === 'Medium').length}</span>
          <span className="priority low">Low: {filteredRequests.filter(r => getPriorityFromSubject(r.subject) === 'Low').length}</span>
        </div>
      </div>

      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Location</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>
                  <div className="request-id">#{request.id}</div>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{request.name}</div>
                    <div className="customer-email">{request.email}</div>
                    {request.phone && (
                      <div className="customer-phone">{request.phone}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="subject-info">
                    <span className="subject-icon">{getSubjectIcon(request.subject)}</span>
                    <span className="subject-text">
                      {request.subject.charAt(0).toUpperCase() + request.subject.slice(1)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityFromSubject(request.subject).toLowerCase()}`}>
                    {getPriorityFromSubject(request.subject)}
                  </span>
                </td>
                <td>
                  <div className="location">{request.location || 'Not specified'}</div>
                </td>
                <td>
                  <div className="request-date">{formatDate(request.createdAt)}</div>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="request-actions">
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => viewRequestDetails(request)}
                    >
                      View
                    </button>
                    
                    {request.status === 'pending' && (
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => handleStatusChange(request.id, 'in_progress')}
                      >
                        Start
                      </button>
                    )}
                    
                    {request.status === 'in_progress' && (
                      <button 
                        className="btn-small btn-success"
                        onClick={() => handleStatusChange(request.id, 'resolved')}
                      >
                        Resolve
                      </button>
                    )}
                    
                    {(request.status === 'resolved' || request.status === 'pending') && (
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => handleStatusChange(request.id, 'closed')}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="no-requests">
            <h3>No requests found</h3>
            <p>No requests match your current filters.</p>
          </div>
        )}
      </div>

      {showDetails && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="request-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
            
            <h3>Request Details #{selectedRequest.id}</h3>
            
            <div className="details-grid">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedRequest.name}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                {selectedRequest.phone && (
                  <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                )}
                <p><strong>Location:</strong> {selectedRequest.location || 'Not specified'}</p>
              </div>
              
              <div className="detail-section">
                <h4>Request Details</h4>
                <p><strong>Subject:</strong> {selectedRequest.subject.charAt(0).toUpperCase() + selectedRequest.subject.slice(1)}</p>
                <p><strong>Priority:</strong> 
                  <span className={`priority-badge ${getPriorityFromSubject(selectedRequest.subject).toLowerCase()}`}>
                    {getPriorityFromSubject(selectedRequest.subject)}
                  </span>
                </p>
                <p><strong>Status:</strong> 
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                  >
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                </p>
                <p><strong>Created:</strong> {formatDate(selectedRequest.createdAt)}</p>
                {selectedRequest.updatedAt && (
                  <p><strong>Last Updated:</strong> {formatDate(selectedRequest.updatedAt)}</p>
                )}
              </div>
            </div>
            
            <div className="message-section">
              <h4>Customer Message</h4>
              <div className="message-content">
                {selectedRequest.message}
              </div>
            </div>
            
            <div className="reply-section">
              <h4>Send Reply</h4>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply to the customer..."
                rows="4"
              />
              <div className="reply-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setReplyMessage('')}
                >
                  Clear
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSendReply}
                >
                  Send Reply
                </button>
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedRequest.status === 'pending' && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    handleStatusChange(selectedRequest.id, 'in_progress')
                    setShowDetails(false)
                  }}
                >
                  Start Working
                </button>
              )}
              
              {selectedRequest.status === 'in_progress' && (
                <button 
                  className="btn-success"
                  onClick={() => {
                    handleStatusChange(selectedRequest.id, 'resolved')
                    setShowDetails(false)
                  }}
                >
                  Mark as Resolved
                </button>
              )}
              
              <button 
                className="btn-secondary"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRequests
