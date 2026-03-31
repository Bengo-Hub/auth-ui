'use client';

import { Button } from '@/components/ui/button';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface PermissionActionButtonProps {
  /** Permission code(s) required (e.g., 'auth.users.delete', 'auth.preferences.change') */
  permission?: string | string[];
  /** Check role instead of permission (e.g., 'admin', 'superuser') */
  role?: string;
  /** Custom permission check function for complex logic */
  check?: () => boolean;
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Button label text (optional for icon-only buttons) */
  label?: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  /** Button size: 'default' | 'sm' | 'lg' | 'icon' */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Hide completely when unauthorized (default: true). If false, shows disabled button. */
  hideWhenUnauthorized?: boolean;
  /** Additional condition to show/enable the button */
  condition?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Tooltip title when hovering */
  title?: string;
}

/**
 * Reusable permission-gated button component.
 * 
 * Examples:
 * ```tsx
 * // Permission-based
 * <PermissionActionButton 
 *   permission="auth.users.delete"
 *   icon={Trash2} 
 *   onClick={handleDelete}
 *   variant="destructive"
 * />
 * 
 * // Role-based
 * <PermissionActionButton 
 *   role="admin" 
 *   label="Admin Settings" 
 *   onClick={handleSettings}
 * />
 * 
 * // Complex condition
 * <PermissionActionButton 
 *   check={() => user.isOwner && hasQuotaRemaining}
 *   label="Add" 
 *   disabled={isLoading}
 *   onClick={handleAdd}
 * />
 * ```
 */
export function PermissionActionButton({
  permission,
  role,
  check,
  icon: Icon,
  label,
  onClick,
  variant = 'ghost',
  size,
  hideWhenUnauthorized = true,
  condition = true,
  disabled = false,
  className,
  title,
}: PermissionActionButtonProps) {
  const { can, hasRole } = usePermissionCheck();

  // Determine if user is authorized
  let isAuthorized = true;
  if (check) {
    isAuthorized = check();
  } else if (permission) {
    isAuthorized = can(permission as string);
  } else if (role) {
    isAuthorized = hasRole(role);
  }

  // If main condition is false, don't render
  if (!condition) return null;

  // If no permission and should hide, don't render
  if (!isAuthorized && hideWhenUnauthorized) return null;

  // Default to icon size when no label, otherwise sm
  const resolvedSize = size ?? (label ? 'sm' : 'icon');

  return (
    <Button
      variant={variant}
      size={resolvedSize}
      onClick={onClick}
      disabled={disabled || !isAuthorized}
      className={className}
      title={title || label}
    >
      {Icon && <Icon className={cn(
        'h-4 w-4',
        label && 'mr-1' // Add margin-right when there's a label
      )} />}
      {label && resolvedSize !== 'icon' && <span>{label}</span>}
    </Button>
  );
}
