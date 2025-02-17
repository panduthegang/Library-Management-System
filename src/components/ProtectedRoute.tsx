import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};