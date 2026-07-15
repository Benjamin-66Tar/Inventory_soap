import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Eje de navegación persistente */}
      <Sidebar />

      {/* Contenedor derecho (Cabecera + Contenido) */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header />

        {/* Área de visualización de contenido dinámico */}
        <main style={{ flexGrow: 1, padding: '30px', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;