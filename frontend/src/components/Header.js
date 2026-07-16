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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
            onMouseOver={(e) => { 
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.borderColor = '#bfdbfe';
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.querySelector('svg').style.transform = 'rotate(45deg)';
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.querySelector('svg').style.transform = 'rotate(0deg)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px', transition: 'transform 0.3s ease' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
