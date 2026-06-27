import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('soap_token') || null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('soap_role') || null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil del usuario actual cuando se inicia la app si hay token
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('soap_token');
      const savedRole = localStorage.getItem('soap_role');
      if (savedToken) {
        try {
          // Intentar verificar el token o pedir información del usuario
          // Usamos la API de login o una rápida llamada para verificar
          // Por simplicidad, guardamos los datos del usuario en localStorage y los inicializamos.
          const username = localStorage.getItem('soap_username');
          const email = localStorage.getItem('soap_email');
          if (username) {
            setUser({ username, email });
          }
          setToken(savedToken);
          setRole(savedRole);
        } catch (error) {
          console.error("Token no válido o expirado", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/auth/login/', {
        username_or_email: usernameOrEmail,
        password: password
      });

      const { token, username, email, role: userRole } = response.data;
      
      localStorage.setItem('soap_token', token);
      localStorage.setItem('soap_role', userRole);
      localStorage.setItem('soap_username', username);
      localStorage.setItem('soap_email', email);

      setToken(token);
      setRole(userRole);
      setUser({ username, email });
      return { success: true, role: userRole };
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      const errorMsg = error.response?.data?.error || 'Error al conectar con el servidor';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('soap_token');
    localStorage.removeItem('soap_role');
    localStorage.removeItem('soap_username');
    localStorage.removeItem('soap_email');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
