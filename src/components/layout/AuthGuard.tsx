import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';

export const AuthGuard = ({ children, requireAuth = true }: { children: React.ReactNode, requireAuth?: boolean }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Initializing APIS Secure Core...</p>
        </div>
      </div>
    );
  }

  // If the route requires authentication and the user is NOT logged in, kick them out.
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // NOTE: We intentionally DO NOT instantly redirect authenticated users away from public routes (like /login).
  // This allows the Login.tsx component to play its cinematic success transition overlay before it manually navigates.

  return <>{children}</>;
};
