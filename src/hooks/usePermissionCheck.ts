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
 * {canDelete('users:delete') && <DeleteButton />}
 * {canEdit('users:update') && <EditButton />}
 * ```
 */
export function usePermissionCheck() {
  const { hasPermission, hasRole } = useAuth();

  return {
    /**
     * Check if user has a specific permission (e.g., 'users:delete')
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
    canManageUsers: () => hasPermission('users:write') || hasPermission('users:invite'),
    
    /**
     * Check if user can view users
     */
    canViewUsers: () => hasPermission('users:read'),
    
    /**
     * Check if user can manage roles/permissions
     */
    canManageRoles: () => hasPermission('roles:write') || hasRole('superuser') || hasRole('admin') || hasRole('super_admin'),
    
    /**
     * Check if user can configure payment gateways
     */
    canManageGateways: () => hasPermission('integrations:write') || hasRole('superuser') || hasRole('admin') || hasRole('super_admin'),
    
    /**
     * Check if user can view settings
     */
    canViewSettings: () => hasPermission('settings:read'),
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
