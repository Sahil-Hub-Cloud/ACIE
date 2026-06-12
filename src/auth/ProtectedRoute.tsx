import React, { useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { PROTECTED_ROUTES } from '../config/routes';
import { SkeletonCard } from '../shared/ui/SkeletonCard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  currentPath,
  onNavigate,
}) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('ProtectedRoute must be used within an AuthProvider');
  }

  const { authenticated, loading } = auth;
  const isProtected = PROTECTED_ROUTES.includes(currentPath);

  useEffect(() => {
    if (!loading && !authenticated && isProtected) {
      onNavigate('/login');
    }
  }, [loading, authenticated, isProtected, currentPath, onNavigate]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto p-6">
        <SkeletonCard variant="metric" className="w-full" />
        <SkeletonCard variant="graph" className="w-full" />
      </div>
    );
  }

  if (!authenticated && isProtected) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
