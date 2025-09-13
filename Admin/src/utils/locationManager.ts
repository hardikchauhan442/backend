import { appConfig } from "@/config/app.config";

export class LocationManager {
  private static instance: LocationManager;
  private currentLocation: string = "";
  private locationHistory: string[] = [];

  private constructor() {
    if (typeof window !== "undefined") {
      this.initializeLocation();
    }
  }

  public static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  private initializeLocation(): void {
    // Initialize from stored location if available
    const savedLocation = this.getSavedLocation();
    if (savedLocation) {
      this.currentLocation = savedLocation;
    }

    // Listen to route changes
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.handleLocationChange.bind(this));
    }
  }

  public setCurrentLocation(path: string): void {
    this.currentLocation = path;

    if (appConfig.location.enableLocationTracking) {
      this.addToHistory(path);

      // Save to localStorage if it's a private route
      if (appConfig.privateRoutes.includes(path)) {
        this.saveLocation(path);
      }
    }
  }

  public getCurrentLocation(): string {
    return this.currentLocation;
  }

  public getLocationHistory(): string[] {
    return [...this.locationHistory];
  }

  public getPreviousLocation(): string | null {
    return this.locationHistory.length > 1
      ? this.locationHistory[this.locationHistory.length - 2]
      : null;
  }

  public saveLocation(path: string): void {
    if (typeof window !== "undefined" && appConfig.location.rememberLastRoute) {
      localStorage.setItem(appConfig.location.locationStorageKey, path);
    }
  }

  public getSavedLocation(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(appConfig.location.locationStorageKey);
    }
    return null;
  }

  public clearSavedLocation(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(appConfig.location.locationStorageKey);
    }
  }

  public isPublicRoute(path: string): boolean {
    return appConfig.publicRoutes.includes(path);
  }

  public isPrivateRoute(path: string): boolean {
    return appConfig.privateRoutes.includes(path);
  }

  public canAccessRoute(path: string, userRole?: string): boolean {
    // Public routes are accessible to everyone
    if (this.isPublicRoute(path)) {
      return true;
    }

    // Private routes require authentication
    if (this.isPrivateRoute(path)) {
      if (!userRole) {
        return false;
      }

      // Check role-based access
      const roleBasedRoutes =
        appConfig.roleBasedRoutes[
          userRole as keyof typeof appConfig.roleBasedRoutes
        ];

      if (roleBasedRoutes) {
        return roleBasedRoutes.includes(path);
      }

      // If not in role-based routes, check if it's a general private route
      const restrictedRoutes = Object.values(appConfig.roleBasedRoutes).flat();
      return !restrictedRoutes.includes(path);
    }

    return false;
  }

  public getRedirectPath(isAuthenticated: boolean, userRole?: string): string {
    if (isAuthenticated) {
      const savedLocation = this.getSavedLocation();

      if (savedLocation && this.canAccessRoute(savedLocation, userRole)) {
        this.clearSavedLocation();
        return savedLocation;
      }

      return appConfig.routes.authenticatedEntryPath;
    }

    return appConfig.routes.unauthenticatedEntryPath;
  }

  public navigateToRoute(path: string, replace: boolean = false): void {
    if (typeof window !== "undefined") {
      if (replace) {
        window.history.replaceState(null, "", path);
      } else {
        window.history.pushState(null, "", path);
      }
      this.setCurrentLocation(path);
    }
  }

  private addToHistory(path: string): void {
    // Avoid duplicate consecutive entries
    if (this.locationHistory[this.locationHistory.length - 1] !== path) {
      this.locationHistory.push(path);

      // Keep history size manageable
      if (this.locationHistory.length > 50) {
        this.locationHistory = this.locationHistory.slice(-25);
      }
    }
  }

  private handleLocationChange(): void {
    const currentPath = window.location.pathname;
    this.setCurrentLocation(currentPath);
  }

  public goBack(): void {
    const previousLocation = this.getPreviousLocation();
    if (previousLocation && typeof window !== "undefined") {
      window.history.back();
    }
  }

  public goForward(): void {
    if (typeof window !== "undefined") {
      window.history.forward();
    }
  }

  public clearHistory(): void {
    this.locationHistory = [];
  }
}

// Export singleton instance
export const locationManager = LocationManager.getInstance();

// Hook for React components
export function useLocationManager() {
  return locationManager;
}
