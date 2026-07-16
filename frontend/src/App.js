import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResponsiveProvider } from './context/ResponsiveContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Login from './components/auth/Login';
import RecuperarPassword from './components/auth/RecuperarPassword';
import RegistroInvitacion from './components/auth/RegistroInvitacion';

import Inventario from './Inventario';
import Layout from './components/Layout';
import Produccion from './Produccion';
import HistorialProduccion from './Historial/HistorialProduccion';
import Curado from './Curado';
import ConfiguracionPanel from './ConfiguracionPanel';

function App() {
  return (
    <AuthProvider>
      <ResponsiveProvider>
        <SearchProvider>
          <BrowserRouter>
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-password" element={<RecuperarPassword />} />
              <Route path="/registro" element={<RegistroInvitacion />} />

              {/* Rutas Protegidas bajo Layout */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Redirección automática al inventario al entrar a la app */}
                <Route index element={<Navigate to="/inventario" replace />} />

                <Route 
                  path="inventario" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'OPERADOR']}>
                      <Inventario />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="produccion" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
                      <Produccion />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="curado" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'OPERADOR']}>
                      <Curado />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="historial" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'OPERADOR']}>
                      <HistorialProduccion />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="configuracion" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ConfiguracionPanel />
                    </ProtectedRoute>
                  } 
                />
              </Route>

              {/* Redirección a login para cualquier otra ruta */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </SearchProvider>
      </ResponsiveProvider>
    </AuthProvider>
  );
}

export default App;