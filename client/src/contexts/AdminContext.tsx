import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: 'admin';
  profile: {
    firstName: string;
    lastName: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
  };
  createdAt: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if admin is authenticated on app load
  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminUserData = localStorage.getItem('adminUser');
      
      if (adminToken && adminUserData) {
        try {
          // Set the admin token for API calls
          axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
          
          // Verify the token is still valid
          const response = await axios.get('/api/auth/me');
          if (response.data.success && response.data.data.user.role === 'admin') {
            setAdminUser(response.data.data.user);
          } else {
            // Token is invalid or user is not admin
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Check if user is admin
        if (user.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          return false;
        }

        // Store admin token and user data
        setAdminUser(user);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Admin login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const adminLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      setAdminUser(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      delete axios.defaults.headers.common['Authorization'];
      toast.success('Admin logged out successfully');
    }
  };

  const value: AdminContextType = {
    adminUser,
    isAdminAuthenticated: !!adminUser,
    loading,
    adminLogin,
    adminLogout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 