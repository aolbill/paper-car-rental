import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/FirebaseAuthContext'
import { rbacService } from '../services/rbacService'

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRole = null,
  fallbackPath = '/',
  showAccessDenied = true 
}) => {
  const { user, userProfile, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking access permissions...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  // Create user object for RBAC service
  const userForRBAC = {
    id: user.uid,
    email: user.email,
    role: userProfile?.role || (rbacService.isAdminEmail(user.email) ? 'admin' : 'user'),
    permissions: userProfile?.permissions || [],
    status: userProfile?.status || 'active'
  }

  // Check if account is suspended
  if (userForRBAC.status === 'suspended') {
    if (showAccessDenied) {
      return <AccountSuspended />
    }
    return <Navigate to={fallbackPath} replace />
  }

  // Check role requirement
  if (requiredRole && !rbacService.hasRoleLevel(userForRBAC, requiredRole)) {
    if (showAccessDenied) {
      return <AccessDenied requiredRole={requiredRole} userRole={userForRBAC.role} />
    }
    return <Navigate to={fallbackPath} replace />
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && !rbacService.hasAnyPermission(userForRBAC, requiredPermissions)) {
    if (showAccessDenied) {
      return <AccessDenied requiredPermissions={requiredPermissions} />
    }
    return <Navigate to={fallbackPath} replace />
  }

  // Check route-specific access
  const routeGuard = rbacService.createRouteGuard(requiredPermissions)
  const accessResult = routeGuard(userForRBAC)

  if (!accessResult.allowed) {
    if (showAccessDenied) {
      return <AccessDenied reason={accessResult.reason} />
    }
    return <Navigate to={accessResult.redirectTo || fallbackPath} replace />
  }

  // Create audit log for protected route access
  rbacService.createAuditLog(userForRBAC, 'route_access', location.pathname, {
    requiredPermissions,
    requiredRole
  })

  // Render the protected content
  return children
}

// Access Denied Component
const AccessDenied = ({ requiredRole, userRole, requiredPermissions, reason }) => {
  const { user } = useAuth()

  return (
    <div className="access-denied">
      <div className="access-denied-container">
        <div className="access-denied-icon">🚫</div>
        <h1>Access Denied</h1>
        
        {reason && (
          <p className="access-denied-reason">{reason}</p>
        )}
        
        {requiredRole && (
          <div className="access-details">
            <p>This page requires <strong>{requiredRole}</strong> role or higher.</p>
            <p>Your current role: <strong>{userRole}</strong></p>
          </div>
        )}
        
        {requiredPermissions && requiredPermissions.length > 0 && (
          <div className="access-details">
            <p>This page requires one of the following permissions:</p>
            <ul className="permissions-list">
              {requiredPermissions.map(permission => (
                <li key={permission}>{permission.replace('_', ' ').toUpperCase()}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="access-denied-actions">
          <button 
            className="btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </button>
          
          {user?.email && (
            <button 
              className="btn-secondary"
              onClick={() => window.location.href = '/contact'}
            >
              Request Access
            </button>
          )}
        </div>

        <div className="access-denied-help">
          <p>If you believe this is an error, please contact your administrator.</p>
          <small>User: {user?.email}</small>
        </div>
      </div>
    </div>
  )
}

// Account Suspended Component
const AccountSuspended = () => {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <div className="account-suspended">
      <div className="suspended-container">
        <div className="suspended-icon">⛔</div>
        <h1>Account Suspended</h1>
        
        <div className="suspended-message">
          <p>Your account has been temporarily suspended.</p>
          <p>Please contact support for more information.</p>
        </div>

        <div className="suspended-actions">
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/contact'}
          >
            Contact Support
          </button>
          
          <button 
            className="btn-secondary"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>

        <div className="suspended-help">
          <p>Support Email: support@papercarrental.com</p>
          <p>Phone: +254 700 000 000</p>
        </div>
      </div>
    </div>
  )
}

// Higher-Order Component for easier usage
export const withRoleProtection = (Component, requiredPermissions = [], requiredRole = null) => {
  return (props) => (
    <ProtectedRoute 
      requiredPermissions={requiredPermissions} 
      requiredRole={requiredRole}
    >
      <Component {...props} />
    </ProtectedRoute>
  )
}

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user, userProfile } = useAuth()

  const userForRBAC = user ? {
    id: user.uid,
    email: user.email,
    role: userProfile?.role || (rbacService.isAdminEmail(user.email) ? 'admin' : 'user'),
    permissions: userProfile?.permissions || [],
    status: userProfile?.status || 'active'
  } : null

  return {
    user: userForRBAC,
    hasPermission: (permission) => rbacService.hasPermission(userForRBAC, permission),
    hasAnyPermission: (permissions) => rbacService.hasAnyPermission(userForRBAC, permissions),
    hasAllPermissions: (permissions) => rbacService.hasAllPermissions(userForRBAC, permissions),
    hasRoleLevel: (role) => rbacService.hasRoleLevel(userForRBAC, role),
    canAccessRoute: (route) => rbacService.canAccessRoute(userForRBAC, route),
    canPerformAction: (action, resource, resourceOwner) => 
      rbacService.canPerformAction(userForRBAC, action, resource, resourceOwner),
    getUserPermissions: () => rbacService.getUserPermissions(userForRBAC),
    getAccessibleMenuItems: () => rbacService.getAccessibleMenuItems(userForRBAC),
    getDashboardSections: () => rbacService.getDashboardSections(userForRBAC),
    getAdminDashboardSections: () => rbacService.getAdminDashboardSections(userForRBAC)
  }
}

export default ProtectedRoute
