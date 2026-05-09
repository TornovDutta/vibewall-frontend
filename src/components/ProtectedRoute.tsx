import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  role?: 'USER' | 'ADMIN';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/login'} replace />;
  if (role && user.role !== role) return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/'} replace />;

  return <>{children}</>;
}
