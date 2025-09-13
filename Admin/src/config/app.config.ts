export interface RouteConfig {
  path: string;
  isPublic: boolean;
  requiresAuth: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const appConfig = {
  // Entry paths configuration

  initialRoute: "/login",
  routes: {
    authenticatedEntryPath: "/dashboard",
    unauthenticatedEntryPath: "/login",
    defaultRedirect: "/dashboard",
    fallbackRoute: "/404",
  },

  // Route definitions
  publicRoutes: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/404",
    "/500",
  ],

  privateRoutes: [
    "/dashboard",
    "/profile",
    "/settings",
    "/users",
    "/analytics",
    "/reports",
    "/settings/master-data",
    "/settings/master-data/new",
    "/settings/master-data/[typeId]",
    "/settings/master-data/[typeId]/edit",
    "/settings/master-data/[typeId]/items",
    "/settings/master-data/[typeId]/items/new",
    "/settings/master-data/[typeId]/items/[itemId]",
    "/settings/master-data/[typeId]/items/[itemId]/edit",
    "/settings/master-data/[typeId]/items/[parentId]/items",
    "/settings/master-data/[typeId]/items/[parentId]/items/new",
    "/settings/master-data/[typeId]/items/[parentId]/items/[itemId]",
    "/settings/master-data/[typeId]/items/[parentId]/items/[itemId]/edit",
    "/settings/roles",
    "/settings/users",
  ],

  // Role-based route access
  roleBasedRoutes: {
    admin: [
      "/users",
      "/settings",
      "/analytics",
      "/reports",
      "/jobs",
      "/inventory",
      "/inventory/raw-materials",
      "/inventory/semi-finished-goods",
      "/inventory/finished-goods",
      "/production",
      "/production/wastage",
      "/production/rejections",
      "/production/tracker",
      "/quality",
      "/settings/users",
      "/settings/roles",
      "/settings/master-data",
      "/settings/master-data/*", // Wildcard for all master data sub-routes
    ],
    editor: ["/analytics", "/reports"],
    viewer: ["/analytics"],
  },

  // Location management
  location: {
    enableLocationTracking: true,
    rememberLastRoute: true,
    redirectAfterLogin: true,
    locationStorageKey: "lastVisitedRoute",
  },

  // Authentication settings
  auth: {
    tokenKey: "authToken",
    userKey: "userData",
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenKey: "refreshToken",
  },

  // Theme configuration
  theme: {
    // primaryColor: "#155dfc",
    primaryColor: "#0C323C",
    secondaryColor: "#ff4d4f",
  },

  // Navigation configuration
  navigation: [
    {
      key: "quality",
      label: "Quality Control",
      icon: "SafetyCertificateOutlined",
      path: "/quality",
      roles: ["admin", "quality_inspector", "supervisor"],
    },
    {
      key: "reports",
      label: "Reports",
      icon: "BarChartOutlined",
      path: "/reports",
      roles: ["admin", "manager", "supervisor"],
    },
  ],

  // User roles
  roles: ["admin", "editor", "viewer", "manager", "supervisor"],

  // API endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    endpoints: {
      login: "/auth/login",
      logout: "/auth/logout",
      refresh: "/auth/refresh",
      profile: "/user/profile",
    },
  },
};
