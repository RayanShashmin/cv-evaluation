// client/src/app/hooks/useAuth.js
"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check`,
        { withCredentials: true }
      );
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`,
        { email, password },
        { withCredentials: true }
      );
      
      // Get user data from login response
      const userData = response.data.user;
      
      setIsAuthenticated(true);
      setUser(userData);
      
      return userData; // Return user data including role
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return { 
    isAuthenticated, 
    isLoading, 
    user, 
    login, 
    logout, 
    checkAuth 
  };
};