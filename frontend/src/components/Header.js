import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const roleLabels = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  OPERADOR: 'Operador'
};

const Header = () => {
  const { user, role } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const headerStyle = {
    height: '75px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  const searchContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: '24px',
    padding: '8px 16px',
    width: '320px',
    transition: 'all 0.2s ease',
    border: '1px solid transparent'
  };

  const searchInputStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    marginLeft: '8px',
    fontSize: '14px',
    color: '#374151',
    width: '100%',
    fontFamily: 'inherit'
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  };

  const profileStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f9fafb',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #f3f4f6'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#4b5563'
  };

  const userTextContainer = {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  };

  const userNameStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  };

  const userRoleStyle = {
    fontSize: '10.5px',
    color: '#6b7280',
    margin: 0
  };

  const actionIconStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '50%',
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <header style={headerStyle}>
      {/* Buscador alineado a la izquierda */}
      <div 
        style={searchContainerStyle}
        onFocus={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)'; }}
        onBlur={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <span style={{ fontSize: '16px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={searchTerm}
          onChange={handleSearchChange}
          style={searchInputStyle}
        />
      </div>

      {/* Perfil del usuario y configuración a la derecha (SIN notificaciones) */}
      <div style={rightSectionStyle}>
        <div style={profileStyle}>
          <div style={avatarStyle}>👤</div>
          <div style={userTextContainer}>
            <p style={userNameStyle}>{user?.username || 'Admin'}</p>
            <p style={userRoleStyle}>{roleLabels[role] || 'Administrador'}</p>
          </div>
        </div>

        {role === 'ADMIN' && (
          <button 
            onClick={() => navigate('/configuracion')}
            style={actionIconStyle}
            title="Configuración"
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            ⚙️
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
