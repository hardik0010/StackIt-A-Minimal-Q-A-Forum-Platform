import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, AlertCircle, UserPlus, LogIn } from 'lucide-react';

interface GuestRestrictionProps {
  action: string;
  message?: string;
  showCTA?: boolean;
  className?: string;
}

const GuestRestriction: React.FC<GuestRestrictionProps> = ({
  action,
  message,
  showCTA = true,
  className = ''
}) => {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Lock className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Sign in required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {message || `You need to be signed in to ${action}.`}
            </p>
          </div>
          {showCTA && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Create Account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestRestriction; 