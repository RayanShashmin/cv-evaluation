// client/src/app/hooks/useRoleProtection.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

/**
 * Hook to protect routes based on user role
 * @param {string|string[]} allowedRoles - Role(s) allowed to access the page
 * @param {string} redirectTo - Where to redirect if access denied (optional)
 */
export const useRoleProtection = (allowedRoles, redirectTo = "/") => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    // Check if user has required role
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(user?.role)) {
      console.log(`Access denied. Required: ${roles.join(', ')}, User: ${user?.role}`);
      
      // Redirect based on user's actual role
      if (user?.role === 'candidate') {
        router.push("/candidate/dashboard");
      } else if (user?.role === 'recruiter') {
        router.push("/dashboard");
      } else {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router]);

  return {
    isAllowed: !isLoading && isAuthenticated && 
               (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).includes(user?.role),
    isLoading,
    user
  };
};