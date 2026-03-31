'use client';

import React from 'react';
import { useAuth } from './useAuth';

export interface PermissionCheck {
  permission?: string;
  role?: string;
  tenantSlug?: string;
}

/**
 * Hook to check if user can perform an action based on permissions and roles.
 * Use this for conditional rendering of UI elements.
 * 
 * Example:
 * ```tsx
 * const { canDelete, canEdit, canInvite } = usePermissionCheck();
 *
 * {canDelete('auth.users.delete') && <DeleteButton />}
 * {canEdit('auth.users.change') && <EditButton />}
 * ```
 */
export function usePermissionCheck() {
  const { hasPermission, hasRole } = useAuth();

  return {
    /**
     * Check if user has a specific permission (e.g., 'auth.users.delete')
     */
    can: (permission: string) => hasPermission(permission),
    
    /**
     * Check if user has a specific role
     */
    hasRole: (role: string, tenantSlug?: string) => hasRole(role, tenantSlug),
    
    /**
     * Check if user is a superuser/admin (bypasses all checks)
     */
    isAdmin: () => hasRole('superuser') || hasRole('admin') || hasRole('super_admin'),

    /**
     * Check if user can manage users (invite, delete, change roles)
     */
    canManageUsers: () => hasPermission('auth.users.manage') || hasPermission('auth.users.add'),
    
    /**
     * Check if user can view users
     */
    canViewUsers: () => hasPermission('auth.users.view'),
    
    /**
     * Check if user can manage roles/permissions
     */
    canManageRoles: () => hasPermission('auth.users.manage') || hasRole('superuser') || hasRole('admin') || hasRole('super_admin'),
    
    /**
     * Check if user can configure payment gateways
     */
    canManageGateways: () => hasPermission('auth.preferences.change') || hasRole('superuser') || hasRole('admin') || hasRole('super_admin'),
    
    /**
     * Check if user can view settings
     */
    canViewSettings: () => hasPermission('auth.preferences.view'),
  };
}

/**
 * Higher-order component to gate components based on permissions.
 * 
 * Example:
 * ```tsx
 * const AdminOnlyButton = withPermission(DeleteButton, (checks) => checks.isAdmin());
 * ```
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissionCheck: (checks: ReturnType<typeof usePermissionCheck>) => boolean,
  fallback?: React.ReactElement | null
) {
  const WrappedComponent = (props: P) => {
    const checks = usePermissionCheck();
    
    if (!permissionCheck(checks)) {
      return fallback ?? null;
    }
    
    return React.createElement(Component as any, props);
  };

  WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent as React.FC<P>;
}
