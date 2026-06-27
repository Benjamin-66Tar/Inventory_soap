import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    // Redirigir al inicio de sesión si no hay token
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si el rol no está permitido, redirigir al inventario (o config si es admin)
    if (role === 'ADMIN') {
      return <Navigate to="/configuracion" replace />;
    }
    return <Navigate to="/inventario" replace />;
  }

  return children;
};

export default ProtectedRoute;
