// src/components/PrivateRoute.jsx
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // si no hay usuario, redirige a /auth (o /login)
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // si hay usuario, renderiza la ruta hija
  return <Outlet />;
}
