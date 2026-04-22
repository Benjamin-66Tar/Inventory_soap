import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Inventario from './Inventario'; // Importamos tu nuevo componente
import Layout from './components/Layout';
import Produccion from './Produccion';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal que contiene el Sidebar y el Outlet */}
        <Route path="/" element={<Layout />}>
        <Route path="produccion" element={<Produccion />} />
          {/* Redirección automática al inventario al entrar a la app */}
          <Route index element={<Navigate to="/inventario" replace />} />

          {/* Secciones de navegación */}
          <Route path="inventario" element={<Inventario />} />

          {/* Escala aquí: nuevas rutas como 'ventas' o 'reportes' */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;