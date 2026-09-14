'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';

export interface Permission {
  id: number;
  name: string;
  slug: string;
  group: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'staff' | string;
  status: 'active' | 'inactive';
  roles?: Array<{
    id: number;
    name: string;
    permissions?: Permission[];
  }>;
  permissions?: string[]; // Array of permission slugs, e.g., ['orders.view', 'products.create']
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasPermission: (permissionSlug: string) => boolean;
  hasAnyPermission: (permissionSlugs: string[]) => boolean;
  hasAllPermissions: (permissionSlugs: string[]) => boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/profile');
      setUser(response.data.data || response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Super admin bypass + permission slug checking
  const hasPermission = (permissionSlug: string): boolean => {
    if (!user) return false;
    if (user.type === 'admin') return true; // Super Admin Bypass

    if (user.type === 'staff') {
      if (user.status !== 'active') return false;

      // Extract direct slugs or slugs flattened from roles
      const userPermissions = user.permissions || [];
      const rolePermissions = user.roles?.flatMap((r) => r.permissions?.map((p) => p.slug) || []) || [];
      
      const allSlugs = new Set([...userPermissions, ...rolePermissions]);
      return allSlugs.has(permissionSlug);
    }

    return false;
  };

  const hasAnyPermission = (permissionSlugs: string[]): boolean => {
    return permissionSlugs.some((slug) => hasPermission(slug));
  };

  const hasAllPermissions = (permissionSlugs: string[]): boolean => {
    return permissionSlugs.every((slug) => hasPermission(slug));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};