import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { menuConfig } from './navigationConfig';

const emojiMap = {
  Soap: '🧼',
  Factory: '🏭',
  HourglassEmpty: '⏳',
  History: '📜'
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [hoveredFooter, setHoveredFooter] = useState(null); // 'config' or 'logout'

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Estilos del contenedor principal
  const sidebarStyle = {
    width: isOpen ? '260px' : '75px',
    backgroundColor: '#111827', // Gris muy oscuro premium
    color: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    left: 0,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflowX: 'hidden',
    flexShrink: 0
  };

  const headerStyle = {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'space-between' : 'center',
    borderBottom: '1px solid #1f2937',
    minHeight: '75px',
    boxSizing: 'border-box'
  };

  const toggleBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, background-color 0.2s',
  };

  const profileStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginLeft: '10px',
    flexGrow: 1
  };

  const navContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '20px 10px',
    flexGrow: 1
  };

  const getLinkStyle = (isActive, isHovered) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'flex-start' : 'center',
    gap: isOpen ? '15px' : '0px',
    padding: isOpen ? '12px 15px' : '12px 0',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#ffffff' : (isHovered ? '#ffffff' : '#9ca3af'),
    backgroundColor: isActive ? '#007bff' : (isHovered ? '#1f2937' : 'transparent'),
    fontWeight: isActive ? '600' : '500',
    fontSize: '15px',
    transition: 'all 0.2s ease-in-out',
    boxShadow: isActive ? '0 4px 12px rgba(0, 123, 255, 0.3)' : 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    width: '100%',
    boxSizing: 'border-box'
  });

  const footerStyle = {
    padding: '15px 10px',
    borderTop: '1px solid #1f2937',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const getFooterBtnStyle = (isHovered, isDanger) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'flex-start' : 'center',
    gap: isOpen ? '12px' : '0px',
    width: '100%',
    padding: isOpen ? '10px 15px' : '10px 0',
    background: 'transparent',
    border: 'none',
    color: isDanger ? '#f87171' : (isHovered ? '#ffffff' : '#9ca3af'),
    backgroundColor: isHovered ? (isDanger ? 'rgba(239, 68, 68, 0.1)' : '#1f2937') : 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box'
  });

  return (
    <aside style={sidebarStyle}>
      {/* 1. Header con Toggle y Perfil */}
      <div style={headerStyle}>
        {isOpen && (
          <div style={profileStyle}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#ffffff' }}>SoapManager</p>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Calidad y Eficiencia</span>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          style={toggleBtnStyle}
          onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = '#1f2937'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          ☰
        </button>
      </div>

      {/* 2. Lista Vertical de Enlaces */}
      <nav style={navContainerStyle}>
        {menuConfig.map((item) => {
          const iconEmoji = emojiMap[item.icon] || '⚙️';
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => getLinkStyle(isActive, hoveredPath === item.path)}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <span style={{ fontSize: '18px', display: 'inline-block', minWidth: '24px', textAlign: 'center' }}>
                {iconEmoji}
              </span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* 3. Footer del Sistema */}
      <div style={footerStyle}>
        <NavLink 
          to="/configuracion"
          style={({ isActive }) => ({ ...getFooterBtnStyle(hoveredFooter === 'config' || isActive, false), textDecoration: 'none' })}
          onMouseEnter={() => setHoveredFooter('config')}
          onMouseLeave={() => setHoveredFooter(null)}
        >
          <span style={{ fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>⚙️</span>
          {isOpen && <span>Configuración</span>}
        </NavLink>
        <button 
          style={getFooterBtnStyle(hoveredFooter === 'logout', true)}
          onMouseEnter={() => setHoveredFooter('logout')}
          onMouseLeave={() => setHoveredFooter(null)}
        >
          <span style={{ fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>🚪</span>
          {isOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;