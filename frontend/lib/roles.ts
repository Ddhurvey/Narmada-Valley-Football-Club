// Role constants
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// User status
export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// HARDCODED SUPER ADMINS (Faster & More Reliable)
export const SUPER_ADMIN_EMAILS = [
  "devendradhur85@gmail.com", 
  "devendhurvey78@gmail.com",
  "admin@nvfc.com"
];

// Permission definitions
export const PERMISSIONS = {
  // Super Admin only
  CREATE_ADMIN: "create_admin",
  REMOVE_ADMIN: "remove_admin",
  VIEW_ALL_USERS: "view_all_users",
  BLOCK_USER: "block_user",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  
  // Admin and above
  MANAGE_CONTENT: "manage_content",
  MANAGE_LAYOUTS: "manage_layouts",
  MANAGE_THEMES: "manage_themes",
  MANAGE_EVENTS: "manage_events",
  PUBLISH_NEWS: "publish_news",
  MANAGE_FIXTURES: "manage_fixtures",
  MANAGE_PLAYERS: "manage_players",
  
  // User (authenticated)
  VIEW_PROFILE: "view_profile",
  EDIT_PROFILE: "edit_profile",
  VIEW_TICKETS: "view_tickets",
  VIEW_ORDERS: "view_orders",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role hierarchy - higher number = more permissions
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.USER]: 1,
};

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.CREATE_ADMIN,
    PERMISSIONS.REMOVE_ADMIN,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.BLOCK_USER,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_LAYOUTS,
    PERMISSIONS.MANAGE_THEMES,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.PUBLISH_NEWS,
    PERMISSIONS.MANAGE_FIXTURES,
    PERMISSIONS.MANAGE_PLAYERS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.VIEW_ORDERS,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_LAYOUTS,
    PERMISSIONS.MANAGE_THEMES,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.PUBLISH_NEWS,
    PERMISSIONS.MANAGE_FIXTURES,
    PERMISSIONS.MANAGE_PLAYERS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.VIEW_ORDERS,
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.VIEW_ORDERS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can perform an action on another role
 * Super Admin can modify anyone except themselves
 * Admin can modify users but not other admins or super admin
 */
export function canModifyRole(actorRole: Role, targetRole: Role): boolean {
  // Super Admin can modify anyone (except we'll handle Super Admin lock separately)
  if (actorRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // Admin can only modify users
  if (actorRole === ROLES.ADMIN) {
    return targetRole === ROLES.USER;
  }
  
  // Users cannot modify anyone
  return false;
}

/**
 * Check if a role is higher than another in the hierarchy
 */
export function isHigherRole(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has multiple permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if user has at least one of the permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}
