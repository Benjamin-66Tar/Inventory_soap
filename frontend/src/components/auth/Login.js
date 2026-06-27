import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);

    const result = await login(usernameOrEmail, password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'ADMIN') {
        navigate('/configuracion');
      } else {
        navigate('/inventario');
      }
    } else {
      setError(result.error);
    }
  };

  // Estilos inline de diseño premium y moderno
  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(circle at 10% 20%, #1e293b 0%, #0f172a 100%)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    color: '#f3f4f6'
  };

  const logoContainerStyle = {
    fontSize: '48px',
    marginBottom: '15px',
    display: 'inline-block'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 10px 0',
    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const subtitleStyle = {
    color: '#9ca3af',
    fontSize: '14px',
    marginBottom: '30px'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left'
  };

  const groupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#d1d5db'
  };

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const buttonStyle = {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    marginTop: '10px'
  };

  const errorStyle = {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const linkStyle = {
    color: '#60a5fa',
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={logoContainerStyle}>🧼</div>
        <h1 style={titleStyle}>SoapManager</h1>
        <p style={subtitleStyle}>Ingresa tus credenciales para acceder al inventario</p>

        {error && (
          <div style={errorStyle}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={groupStyle}>
            <label style={labelStyle}>Usuario o Correo Electrónico</label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="admin o admin@benys.com"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={groupStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Contraseña</label>
              <Link to="/recuperar-password" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#3b82f6'} onMouseLeave={(e) => e.target.style.color = '#60a5fa'}>
                ¿La olvidaste?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
            onMouseEnter={(e) => { if(!loading) e.target.style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { if(!loading) e.target.style.backgroundColor = '#3b82f6'; }}
            onMouseDown={(e) => { if(!loading) e.target.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { if(!loading) e.target.style.transform = 'scale(1)'; }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
