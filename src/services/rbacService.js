// Role-Based Access Control (RBAC) Service
// Handles permission checking, role validation, and access control

class RBACService {
  constructor() {
    // Define role hierarchy (higher number = more permissions)
    this.roleHierarchy = {
      'suspended': 0,
      'user': 1,
      'manager': 2,
      'admin': 3
    }

    // Define permissions for each role
    this.rolePermissions = {
      suspended: [],
      user: [
        'create_booking',
        'view_own_bookings',
        'manage_profile',
        'contact_support',
        'view_cars',
        'add_reviews'
      ],
      manager: [
        'create_booking',
        'view_own_bookings',
        'manage_profile',
        'contact_support',
        'view_cars',
        'add_reviews',
        'manage_cars',
        'manage_bookings',
        'view_analytics',
        'respond_to_requests'
      ],
      admin: [
        'create_booking',
        'view_own_bookings',
        'manage_profile',
        'contact_support',
        'view_cars',
        'add_reviews',
        'manage_cars',
        'manage_bookings',
        'view_analytics',
        'respond_to_requests',
        'manage_users',
        'manage_payments',
        'manage_requests',
        'view_system_logs',
        'manage_settings',
        'export_data',
        'manage_roles'
      ]
    }

    // Define protected routes and their required permissions
    this.protectedRoutes = {
      '/admin': ['view_analytics'],
      '/admin/users': ['manage_users'],
      '/admin/payments': ['manage_payments'],
      '/admin/cars': ['manage_cars'],
      '/admin/bookings': ['manage_bookings'],
      '/admin/requests': ['manage_requests'],
      '/admin/settings': ['manage_settings'],
      '/dashboard': ['view_own_bookings'],
      '/profile': ['manage_profile']
    }

    // Admin-only email patterns
    this.adminEmailPatterns = [
      /^admin@papercarrental\.com$/,
      /^manager@papercarrental\.com$/,
      /^support@papercarrental\.com$/
    ]
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(user, permission) {
    if (!user || !user.role) {
      return false
    }

    // Suspended users have no permissions
    if (user.role === 'suspended') {
      return false
    }

    // Check explicit permissions first
    if (user.permissions && user.permissions.includes(permission)) {
      return true
    }

    // Check role-based permissions
    const rolePermissions = this.rolePermissions[user.role] || []
    return rolePermissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(user, permissions) {
    return permissions.some(permission => this.hasPermission(user, permission))
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(user, permissions) {
    return permissions.every(permission => this.hasPermission(user, permission))
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(user, route) {
    const requiredPermissions = this.protectedRoutes[route]
    
    if (!requiredPermissions) {
      // Route is not protected
      return true
    }

    return this.hasAnyPermission(user, requiredPermissions)
  }

  /**
   * Get user's role level
   */
  getRoleLevel(role) {
    return this.roleHierarchy[role] || 0
  }

  /**
   * Check if user's role is higher than or equal to required role
   */
  hasRoleLevel(user, requiredRole) {
    if (!user || !user.role) {
      return false
    }

    const userLevel = this.getRoleLevel(user.role)
    const requiredLevel = this.getRoleLevel(requiredRole)
    
    return userLevel >= requiredLevel
  }

  /**
   * Check if user is admin based on email patterns
   */
  isAdminEmail(email) {
    if (!email) return false
    
    return this.adminEmailPatterns.some(pattern => pattern.test(email.toLowerCase()))
  }

  /**
   * Determine user role based on email and other factors
   */
  determineUserRole(email, providedRole = null) {
    // Check if email matches admin patterns
    if (this.isAdminEmail(email)) {
      return 'admin'
    }

    // Use provided role if valid
    if (providedRole && this.roleHierarchy.hasOwnProperty(providedRole)) {
      return providedRole
    }

    // Default to user role
    return 'user'
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(user) {
    if (!user || !user.role) {
      return []
    }

    const rolePermissions = this.rolePermissions[user.role] || []
    const explicitPermissions = user.permissions || []

    // Combine and deduplicate permissions
    return [...new Set([...rolePermissions, ...explicitPermissions])]
  }

  /**
   * Validate if user can perform an action on a resource
   */
  canPerformAction(user, action, resource = null, resourceOwner = null) {
    const actionPermissionMap = {
      'create': ['create_booking', 'manage_cars', 'manage_users'],
      'read': ['view_own_bookings', 'view_analytics', 'manage_bookings'],
      'update': ['manage_profile', 'manage_cars', 'manage_bookings', 'manage_users'],
      'delete': ['manage_cars', 'manage_bookings', 'manage_users']
    }

    const requiredPermissions = actionPermissionMap[action] || []
    
    // Check if user has any of the required permissions
    if (this.hasAnyPermission(user, requiredPermissions)) {
      return true
    }

    // Special case: users can always read/update their own resources
    if (resourceOwner && user && user.id === resourceOwner) {
      const ownResourceActions = ['read', 'update']
      if (ownResourceActions.includes(action)) {
        return true
      }
    }

    return false
  }

  /**
   * Get accessible menu items for user
   */
  getAccessibleMenuItems(user) {
    const allMenuItems = [
      { id: 'home', label: 'Home', path: '/', permission: null },
      { id: 'cars', label: 'Cars', path: '/cars', permission: 'view_cars' },
      { id: 'about', label: 'About', path: '/about', permission: null },
      { id: 'contact', label: 'Contact', path: '/contact', permission: null },
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', permission: 'view_own_bookings' },
      { id: 'profile', label: 'Profile', path: '/profile', permission: 'manage_profile' },
      { id: 'admin', label: 'Admin Panel', path: '/admin', permission: 'view_analytics' }
    ]

    return allMenuItems.filter(item => 
      !item.permission || this.hasPermission(user, item.permission)
    )
  }

  /**
   * Validate user registration data and assign appropriate role
   */
  validateRegistration(userData) {
    const { email, name, phone } = userData

    // Basic validation
    if (!email || !name) {
      return {
        success: false,
        error: 'Email and name are required'
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Invalid email format'
      }
    }

    // Phone validation (optional but if provided, should be valid)
    if (phone) {
      const phoneRegex = /^(\+254|0)[1-9]\d{8}$/
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return {
          success: false,
          error: 'Invalid phone number format. Use +254XXXXXXXXX or 0XXXXXXXXX format'
        }
      }
    }

    // Determine role
    const role = this.determineUserRole(email)
    const permissions = this.rolePermissions[role] || []

    return {
      success: true,
      userData: {
        ...userData,
        role,
        permissions,
        status: 'active'
      }
    }
  }

  /**
   * Check if user can modify another user's data
   */
  canModifyUser(currentUser, targetUser) {
    // Users can always modify their own data
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Only admins can modify other users
    if (!this.hasPermission(currentUser, 'manage_users')) {
      return false
    }

    // Admins cannot demote other admins (except themselves)
    if (targetUser.role === 'admin' && currentUser.role === 'admin' && currentUser.id !== targetUser.id) {
      return false
    }

    return true
  }

  /**
   * Get user's accessible dashboard sections
   */
  getDashboardSections(user) {
    const allSections = [
      { id: 'overview', label: 'Overview', permission: 'view_own_bookings' },
      { id: 'bookings', label: 'My Bookings', permission: 'view_own_bookings' },
      { id: 'profile', label: 'Profile', permission: 'manage_profile' },
      { id: 'favorites', label: 'Favorites', permission: 'view_cars' },
      { id: 'history', label: 'History', permission: 'view_own_bookings' },
      { id: 'support', label: 'Support', permission: 'contact_support' }
    ]

    return allSections.filter(section => 
      this.hasPermission(user, section.permission)
    )
  }

  /**
   * Get admin dashboard sections
   */
  getAdminDashboardSections(user) {
    const allSections = [
      { id: 'analytics', label: 'Analytics', permission: 'view_analytics' },
      { id: 'bookings', label: 'Bookings', permission: 'manage_bookings' },
      { id: 'cars', label: 'Cars', permission: 'manage_cars' },
      { id: 'payments', label: 'Payments', permission: 'manage_payments' },
      { id: 'users', label: 'Users', permission: 'manage_users' },
      { id: 'requests', label: 'Requests', permission: 'manage_requests' },
      { id: 'messaging', label: 'Messages', permission: 'respond_to_requests' },
      { id: 'settings', label: 'Settings', permission: 'manage_settings' }
    ]

    return allSections.filter(section => 
      this.hasPermission(user, section.permission)
    )
  }

  /**
   * Create audit log entry for permission-based actions
   */
  createAuditLog(user, action, resource, details = {}) {
    const logEntry = {
      id: Date.now(),
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'unknown',
      userRole: user?.role || 'unknown',
      action,
      resource,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: 'N/A', // Would be filled by backend
      userAgent: navigator.userAgent
    }

    // In a real application, this would be sent to a logging service
    console.log('RBAC Audit Log:', logEntry)
    
    return logEntry
  }

  /**
   * Middleware function for route protection
   */
  createRouteGuard(requiredPermissions = []) {
    return (user) => {
      if (!user) {
        return {
          allowed: false,
          reason: 'Authentication required',
          redirectTo: '/login'
        }
      }

      if (user.status === 'suspended') {
        return {
          allowed: false,
          reason: 'Account suspended',
          redirectTo: '/'
        }
      }

      if (requiredPermissions.length === 0) {
        return { allowed: true }
      }

      if (!this.hasAnyPermission(user, requiredPermissions)) {
        return {
          allowed: false,
          reason: 'Insufficient permissions',
          redirectTo: '/'
        }
      }

      return { allowed: true }
    }
  }
}

// Create singleton instance
export const rbacService = new RBACService()

// Export for testing and advanced usage
export default RBACService
