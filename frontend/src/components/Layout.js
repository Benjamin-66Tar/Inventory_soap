import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useResponsive } from '../context/ResponsiveContext';

const Layout = () => {
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', position: 'relative' }}>
      {/* Eje de navegación persistente */}
      <Sidebar isOpenMobile={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {/* Contenedor derecho (Cabecera + Contenido) */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header onToggleSidebar={toggleSidebar} />

        {/* Área de visualización de contenido dinámico */}
        <main style={{ flexGrow: 1, padding: isMobile ? '15px' : '30px', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      {/* Backdrop para cerrar el menú en móviles */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}
    </div>
  );
};

export default Layout;