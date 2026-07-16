import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { menuConfig } from './navigationConfig';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../context/ResponsiveContext';
import blueSoap from '../blue_soap_transparent.png';

const emojiMap = {
  Soap: '🧼',
  Factory: '🏭',
  HourglassEmpty: '⏳',
  History: '📜'
};

const Sidebar = ({ isOpenMobile, onCloseMobile }) => {
  const { role, logout } = useAuth();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [hoveredFooter, setHoveredFooter] = useState(null); // 'config' or 'logout'

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Estilos del contenedor principal
  const sidebarStyle = {
    width: isMobile ? '260px' : (isOpen ? '260px' : '75px'),
    backgroundColor: '#0B1931', // Azul marino profundo premium
    color: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    zIndex: isMobile ? 1000 : 1,
    transform: isMobile ? (isOpenMobile ? 'translateX(0)' : 'translateX(-100%)') : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '4px 0 15px rgba(0, 0, 0, 0.15)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflowX: 'hidden',
    flexShrink: 0
  };

  const headerStyle = {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isMobile ? 'space-between' : (isOpen ? 'space-between' : 'center'),
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    minHeight: '75px',
    boxSizing: 'border-box'
  };

  const toggleBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#a3b3cc',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, background-color 0.2s',
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
    color: isActive ? '#ffffff' : (isHovered ? '#ffffff' : '#a3b3cc'),
    backgroundColor: isActive ? '#1E3A8A' : (isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent'),
    fontWeight: isActive ? '600' : '500',
    fontSize: '15px',
    transition: 'all 0.2s ease-in-out',
    boxShadow: isActive ? '0 4px 12px rgba(30, 58, 138, 0.3)' : 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    width: '100%',
    boxSizing: 'border-box'
  });

  const footerStyle = {
    padding: '15px 10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
    color: isDanger ? '#f87171' : (isHovered ? '#ffffff' : '#a3b3cc'),
    backgroundColor: isHovered ? (isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.08)') : 'transparent',
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
      <div style={headerStyle}>
        {(isOpen || isMobile) && (
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px', marginLeft: '10px' }}>SoapManager</span>
        )}
        {isMobile ? (
          <button 
            onClick={onCloseMobile} 
            style={{ ...toggleBtnStyle, fontSize: '20px', padding: '5px 10px' }}
          >
            ✕
          </button>
        ) : (
          <button 
            onClick={toggleSidebar} 
            style={toggleBtnStyle}
            onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#a3b3cc'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            ☰
          </button>
        )}
      </div>

      {/* 2. Lista Vertical de Enlaces */}
      <nav style={navContainerStyle}>
        {menuConfig
          .filter(item => {
            if (item.path === '/produccion' && role === 'OPERADOR') return false;
            return true;
          })
          .map((item) => {
            const iconEmoji = emojiMap[item.icon] || '⚙️';
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => getLinkStyle(isActive, hoveredPath === item.path)}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span style={{ fontSize: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', height: '24px' }}>
                  {item.icon === 'Soap' ? (
                    <img src={blueSoap} alt="Soap Icon" style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }} />
                  ) : (
                    iconEmoji
                  )}
                </span>
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
      </nav>

      {/* 3. Footer del Sistema */}
      <div style={footerStyle}>
        <button 
          style={getFooterBtnStyle(hoveredFooter === 'logout', true)}
          onMouseEnter={() => setHoveredFooter('logout')}
          onMouseLeave={() => setHoveredFooter(null)}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <span style={{ fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>🚪</span>
          {isOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;