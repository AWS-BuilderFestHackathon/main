import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
