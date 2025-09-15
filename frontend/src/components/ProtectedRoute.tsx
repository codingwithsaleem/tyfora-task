import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingWrapper from '../components/LoadingWrapper';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingWrapper isLoading={loading} error={null}><div></div></LoadingWrapper>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}