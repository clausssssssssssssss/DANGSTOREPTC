const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Uso en las rutas:
<Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />