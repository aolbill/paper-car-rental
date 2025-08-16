import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/FirebaseAuthContext'
import firebaseUserService from '../../services/firebaseUserService'
import './AdminUsers.css'

const AdminUsers = ({ onRefresh }) => {
  const { user, userProfile } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [userStats, setUserStats] = useState({})
  const [processing, setProcessing] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [newPermissions, setNewPermissions] = useState([])

  const availableRoles = [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Limited admin access' },
    { value: 'user', label: 'Regular User', description: 'Standard user access' },
    { value: 'suspended', label: 'Suspended', description: 'Account suspended' }
  ]

  const availablePermissions = [
    'manage_cars',
    'manage_bookings',
    'manage_users',
    'view_analytics',
    'manage_requests',
    'manage_payments',
    'create_booking',
    'view_own_bookings',
    'manage_profile',
    'contact_support'
  ]

  useEffect(() => {
    loadUsers()
    loadUserStats()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, filter, searchTerm])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from Firebase/Firestore
      // For now, we'll simulate with some mock data and real user data
      const mockUsers = [
        {
          id: 'admin-1',
          email: 'admin@papercarrental.com',
          name: 'System Administrator',
          role: 'admin',
          permissions: ['manage_cars', 'manage_bookings', 'manage_users', 'view_analytics', 'manage_requests', 'manage_payments'],
          status: 'active',
          lastLogin: new Date().toISOString(),
          createdAt: '2024-01-01T00:00:00.000Z',
          bookingsCount: 0,
          totalSpent: 0
        },
        {
          id: 'manager-1',
          email: 'manager@papercarrental.com',
          name: 'Fleet Manager',
          role: 'manager',
          permissions: ['manage_cars', 'manage_bookings', 'view_analytics'],
          status: 'active',
          lastLogin: new Date(Date.now() - 86400000).toISOString(),
          createdAt: '2024-01-15T00:00:00.000Z',
          bookingsCount: 0,
          totalSpent: 0
        }
      ]

      // Add current user if they exist
      if (user && userProfile) {
        const currentUserData = {
          id: user.uid,
          email: user.email,
          name: userProfile.name || user.displayName || 'Current User',
          role: userProfile.role || (user.email === 'admin@papercarrental.com' ? 'admin' : 'user'),
          permissions: userProfile.permissions || ['create_booking', 'view_own_bookings'],
          status: 'active',
          lastLogin: new Date().toISOString(),
          createdAt: userProfile.createdAt || new Date().toISOString(),
          bookingsCount: userProfile.bookingsCount || 0,
          totalSpent: userProfile.totalSpent || 0
        }

        // Only add if not already in mock users
        if (!mockUsers.find(u => u.email === currentUserData.email)) {
          mockUsers.push(currentUserData)
        }
      }

      setUsers(mockUsers)
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setLoading(false)
    }
  }

  const loadUserStats = () => {
    // Calculate user statistics
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.status === 'active').length
    const suspendedUsers = users.filter(u => u.status === 'suspended').length
    const adminUsers = users.filter(u => u.role === 'admin').length
    const regularUsers = users.filter(u => u.role === 'user').length

    setUserStats({
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      admins: adminUsers,
      regular: regularUsers
    })
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Filter by role/status
    if (filter !== 'all') {
      if (filter === 'active' || filter === 'suspended') {
        filtered = filtered.filter(user => user.status === filter)
      } else {
        filtered = filtered.filter(user => user.role === filter)
      }
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleUpdateUserRole = async () => {
    if (!selectedUser || !newRole) {
      alert('Please select a role')
      return
    }

    if (!user || userProfile?.role !== 'admin') {
      alert('Admin access required')
      return
    }

    setProcessing(true)
    try {
      // In a real app, this would update Firebase/Firestore
      const updatedUser = {
        ...selectedUser,
        role: newRole,
        permissions: newPermissions,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? updatedUser : u
      ))

      setShowRoleModal(false)
      setSelectedUser(null)
      setNewRole('')
      setNewPermissions([])
      alert('User role updated successfully')
      loadUserStats()
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating user role: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleSuspendUser = async (userId, suspend) => {
    if (!user || userProfile?.role !== 'admin') {
      alert('Admin access required')
      return
    }

    if (userId === user.uid) {
      alert('You cannot suspend your own account')
      return
    }

    setProcessing(true)
    try {
      const updatedUser = users.find(u => u.id === userId)
      if (updatedUser) {
        updatedUser.status = suspend ? 'suspended' : 'active'
        updatedUser.updatedAt = new Date().toISOString()
        updatedUser.updatedBy = user.uid

        setUsers(prev => prev.map(u => 
          u.id === userId ? updatedUser : u
        ))

        alert(`User ${suspend ? 'suspended' : 'activated'} successfully`)
        loadUserStats()
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Error updating user status: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Bookings', 'Total Spent', 'Last Login', 'Created'].join(','),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.bookingsCount || 0,
        user.totalSpent || 0,
        new Date(user.lastLogin).toLocaleDateString(),
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc2626'
      case 'manager': return '#ea580c'
      case 'user': return '#059669'
      case 'suspended': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'suspended': return '#ef4444'
      case 'pending': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const handlePermissionToggle = (permission) => {
    setNewPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <div className="header-main">
          <h2>👥 User Management</h2>
          <div className="header-actions">
            <button className="btn-secondary" onClick={loadUsers}>
              🔄 Refresh
            </button>
            <button className="btn-primary" onClick={exportUsers}>
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* User Statistics */}
        <div className="user-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <h3>{userStats.total || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <h3>{userStats.active || 0}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">��️</div>
            <div className="stat-details">
              <h3>{userStats.admins || 0}</h3>
              <p>Administrators</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧑‍💼</div>
            <div className="stat-details">
              <h3>{userStats.regular || 0}</h3>
              <p>Regular Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⛔</div>
            <div className="stat-details">
              <h3>{userStats.suspended || 0}</h3>
              <p>Suspended</p>
            </div>
          </div>
        </div>
      </div>

      <div className="users-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
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
            <option value="all">All Users</option>
            <option value="admin">Administrators</option>
            <option value="manager">Managers</option>
            <option value="user">Regular Users</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button 
            className="btn-secondary"
            onClick={() => {
              setFilter('all')
              setSearchTerm('')
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <div className="no-data-icon">👥</div>
            <h3>No users found</h3>
            <p>No users match your current filters.</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="header-cell">User</div>
              <div className="header-cell">Role</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Activity</div>
              <div className="header-cell">Bookings</div>
              <div className="header-cell">Last Login</div>
              <div className="header-cell">Actions</div>
            </div>

            {filteredUsers.map(user => (
              <div key={user.id} className="table-row">
                <div className="table-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                </div>

                <div className="table-cell">
                  <span 
                    className="user-role"
                    style={{ 
                      backgroundColor: getRoleColor(user.role),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="table-cell">
                  <span 
                    className="user-status"
                    style={{ 
                      backgroundColor: getStatusColor(user.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="table-cell">
                  <div className="activity-info">
                    <div className="activity-indicator">
                      <div 
                        className={`activity-dot ${
                          new Date(user.lastLogin) > new Date(Date.now() - 86400000) ? 'active' : 'inactive'
                        }`}
                      ></div>
                      <span>
                        {new Date(user.lastLogin) > new Date(Date.now() - 86400000) ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="booking-stats">
                    <strong>{user.bookingsCount || 0}</strong>
                    <small>KSH {(user.totalSpent || 0).toLocaleString()}</small>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="login-info">
                    <strong>{new Date(user.lastLogin).toLocaleDateString()}</strong>
                    <small>{new Date(user.lastLogin).toLocaleTimeString()}</small>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="user-actions">
                    <button 
                      className="btn-info-small"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUserModal(true)
                      }}
                    >
                      👁️ View
                    </button>

                    {userProfile?.role === 'admin' && user.id !== user?.uid && (
                      <>
                        <button 
                          className="btn-warning-small"
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                            setNewPermissions([...user.permissions])
                            setShowRoleModal(true)
                          }}
                          disabled={processing}
                        >
                          ⚙️ Edit Role
                        </button>

                        <button 
                          className={user.status === 'active' ? 'btn-danger-small' : 'btn-success-small'}
                          onClick={() => handleSuspendUser(user.id, user.status === 'active')}
                          disabled={processing}
                        >
                          {user.status === 'active' ? '⛔ Suspend' : '✅ Activate'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>

            <div className="modal-content">
              <div className="user-profile">
                <div className="profile-avatar">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h2>{selectedUser.name}</h2>
                  <p>{selectedUser.email}</p>
                  <div className="profile-badges">
                    <span 
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                    >
                      {selectedUser.role.toUpperCase()}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                    >
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Account Information</h4>
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span>{selectedUser.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Login:</label>
                    <span>{new Date(selectedUser.lastLogin).toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Activity Summary</h4>
                  <div className="detail-item">
                    <label>Total Bookings:</label>
                    <span>{selectedUser.bookingsCount || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Spent:</label>
                    <span>KSH {(selectedUser.totalSpent || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Permissions</h4>
                  <div className="permissions-list">
                    {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                      selectedUser.permissions.map(permission => (
                        <span key={permission} className="permission-tag">
                          {permission.replace('_', ' ').toUpperCase()}
                        </span>
                      ))
                    ) : (
                      <p>No specific permissions assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {selectedUser && showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="role-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User Role & Permissions</h3>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>

            <div className="modal-content">
              <div className="user-info-mini">
                <strong>{selectedUser.name}</strong>
                <small>{selectedUser.email}</small>
              </div>

              <div className="role-form">
                <div className="form-group">
                  <label>User Role:</label>
                  <select 
                    value={newRole} 
                    onChange={(e) => {
                      setNewRole(e.target.value)
                      // Set default permissions based on role
                      const rolePerms = {
                        admin: ['manage_cars', 'manage_bookings', 'manage_users', 'view_analytics', 'manage_requests', 'manage_payments'],
                        manager: ['manage_cars', 'manage_bookings', 'view_analytics'],
                        user: ['create_booking', 'view_own_bookings', 'manage_profile'],
                        suspended: []
                      }
                      setNewPermissions(rolePerms[e.target.value] || [])
                    }}
                    className="role-select"
                  >
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Permissions:</label>
                  <div className="permissions-grid">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={newPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          disabled={newRole === 'suspended'}
                        />
                        <span>{permission.replace('_', ' ').toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowRoleModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleUpdateUserRole}
                  disabled={processing || !newRole}
                >
                  {processing ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
