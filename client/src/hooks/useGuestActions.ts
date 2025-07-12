import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useGuestActions = () => {
  const { isAuthenticated } = useAuth();

  const handleGuestAction = useCallback((action: string, showToast: boolean = true) => {
    if (showToast) {
      toast.error(`Please ${isAuthenticated ? 'log in' : 'sign up'} to ${action}`, {
        duration: 4000,
        icon: '🔒', // Using emoji instead of JSX component
      });
    }
    return false;
  }, [isAuthenticated]);

  const requireAuth = useCallback((action: string, callback?: () => void) => {
    if (!isAuthenticated) {
      handleGuestAction(action);
      return false;
    }
    
    if (callback) {
      callback();
    }
    return true;
  }, [isAuthenticated, handleGuestAction]);

  const canPerformAction = useCallback((action: string) => {
    if (!isAuthenticated) {
      return {
        can: false,
        message: `Please ${isAuthenticated ? 'log in' : 'sign up'} to ${action}`,
        action: () => handleGuestAction(action)
      };
    }
    
    return {
      can: true,
      message: '',
      action: () => {}
    };
  }, [isAuthenticated, handleGuestAction]);

  return {
    isAuthenticated,
    handleGuestAction,
    requireAuth,
    canPerformAction
  };
}; 