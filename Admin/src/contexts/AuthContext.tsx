"use client";

import { appConfig } from "@/config/app.config";
import { apiAdminLogin } from "@/services/ProjectService";
import { useAppSelector } from "@/store/hooks";
import { useAppDispatch } from "@/store/store";

import {
  initializeAuth,
  login as loginAction,
  logout as logoutAction,
  MasterData,
} from "@/store/userSlice";
import { redirect, usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  token?: string;
  key?: string;
  is_subscribed?: boolean;
  masters?: MasterData[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Initialize auth state from Redux
  useEffect(() => {
    dispatch(initializeAuth());
    setIsLoading(false);
  }, [dispatch]);

  // Handle route protection and redirects
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = appConfig.publicRoutes.includes(pathname);
    const isPrivateRoute = appConfig.privateRoutes.includes(pathname);

    // Save current location for redirect after login
    if (appConfig.location.enableLocationTracking && !isPublicRoute) {
      localStorage.setItem(appConfig.location.locationStorageKey, pathname);
    }

    // Root path "/" logic
    if (pathname === "/") {
      if (isAuthenticated) {
        redirect(appConfig.routes.authenticatedEntryPath);
      } else {
        redirect(appConfig.routes.unauthenticatedEntryPath);
      }
    }

    // Private route logic
    if (!isAuthenticated && isPrivateRoute) {
      // User not authenticated but trying to access private route
      redirect(appConfig.routes.unauthenticatedEntryPath);
    } else if (
      isAuthenticated &&
      pathname === appConfig.routes.unauthenticatedEntryPath
    ) {
      // User authenticated but on login page
      const savedRoute = localStorage.getItem(
        appConfig.location.locationStorageKey
      );
      const redirectTo =
        savedRoute && appConfig.privateRoutes.includes(savedRoute)
          ? savedRoute
          : appConfig.routes.authenticatedEntryPath;
      redirect(redirectTo);
    }
  }, [isAuthenticated, pathname, isLoading]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiAdminLogin<
        any,
        { email: string; password: string }
      >({
        email,
        password,
      });

      if (response.data.status === 200) {
        const userData = response.data.data;

        // Map the API response to match our User interface
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.roleData.code, // You might want to update this based on your actual role system
          token: userData.token,
          key: userData.key,
          masters: userData.master,
        };

        // Dispatch the login action with the user data
        dispatch(loginAction(userData));

        // Store additional data in localStorage if needed by other parts of the app
        localStorage.setItem(appConfig.auth.tokenKey, userData.token);
        localStorage.setItem(appConfig.auth.userKey, JSON.stringify(user));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    // Dispatch the logout action
    dispatch(logoutAction());

    // Clear any app-specific localStorage items
    localStorage.removeItem(appConfig.auth.tokenKey);
    localStorage.removeItem(appConfig.auth.userKey);

    // Redirect to login page
    redirect(appConfig.routes.unauthenticatedEntryPath);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    // For this simple implementation, we'll just update the local state
    // In a real app, you might want to update the Redux store as well
    const updatedUser = { ...user, ...userData };
    localStorage.setItem(appConfig.auth.userKey, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
