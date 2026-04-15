import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { menuConfig } from './navigationConfig';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <aside style={{ width: isOpen ? '250px' : '80px', transition: 'width 0.3s' }}>
      {/* 1. User Header */}
      <div className="sidebar-header">
        <button onClick={toggleSidebar}>☰</button>
        {isOpen && (
          <div className="user-profile">
            <p><strong>Admin</strong></p>
            <span>Arquitecto de Stock</span>
          </div>
        )}
      </div>

      {/* 2. Nav Links - Generación dinámica basada en config */}
      <nav className="sidebar-nav">
        {menuConfig.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'active-link' : 'link')}
          >
            <span className="icon">{/* Icon Placeholder: {item.icon} */}</span>
            {isOpen && <span className="label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* 3. Footer de Sistema */}
      <div className="sidebar-footer">
        <button>{isOpen ? 'Configuración' : '⚙️'}</button>
        <button>{isOpen ? 'Cerrar Sesión' : 'Logout'}</button>
      </div>
    </aside>
  );
};

export default Sidebar;