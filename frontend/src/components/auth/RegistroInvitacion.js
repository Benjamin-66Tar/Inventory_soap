import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';

const RegistroInvitacion = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loadingToken, setLoadingToken] = useState(true);
  const [invitationData, setInvitationData] = useState(null);
  const [tokenError, setTokenError] = useState('');

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('Falta el token de registro.');
      setLoadingToken(false);
      return;
    }

    const checkToken = async () => {
      try {
        const response = await api.get(`/auth/registro-invitacion/?token=${token}`);
        setInvitationData(response.data);
      } catch (err) {
        setTokenError(err.response?.data?.error || 'Enlace de invitación inválido o expirado.');
      } finally {
        setLoadingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/registro-invitacion/', {
        token,
        username,
        password,
        first_name: firstName,
        last_name: lastName
      });
      setSuccess('Usuario creado correctamente. Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  // Estilos inline de diseño premium y moderno (mismos de Login/Recuperacion)
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
    maxWidth: '480px',
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
    gap: '15px',
    textAlign: 'left'
  };

  const groupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
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
    transition: 'border-color 0.2s',
  };

  const readOnlyBoxStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#9ca3af',
    fontSize: '15px'
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
    marginTop: '15px'
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
    gap: '8px',
    marginBottom: '15px'
  };

  const successStyle = {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px'
  };

  const linkStyle = {
    color: '#60a5fa',
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  };

  if (loadingToken) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', marginBottom: '20px', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p>Verificando invitación...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>❌</div>
          <h1 style={titleStyle}>Enlace inválido</h1>
          <p style={subtitleStyle}>{tokenError}</p>
          <Link to="/login" style={{ ...buttonStyle, display: 'block', textDecoration: 'none', textAlign: 'center' }}>
            Ir al Inicio de Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={logoContainerStyle}>👥</div>
        <h1 style={titleStyle}>Crear Cuenta</h1>
        <p style={subtitleStyle}>Completa tu registro como nuevo colaborador de SoapManager</p>

        {error && (
          <div style={errorStyle}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={successStyle}>
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={rowStyle}>
            <div style={groupStyle}>
              <label style={labelStyle}>Correo Electrónico</label>
              <div style={readOnlyBoxStyle}>{invitationData?.email}</div>
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Rol Asignado</label>
              <div style={readOnlyBoxStyle}>{invitationData?.rol_display}</div>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={groupStyle}>
              <label style={labelStyle}>Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Juan"
                style={inputStyle}
                required
              />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Pérez"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jperez"
              style={inputStyle}
              required
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              required
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
            onMouseEnter={(e) => { if(!loading) e.target.style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { if(!loading) e.target.style.backgroundColor = '#3b82f6'; }}
          >
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroInvitacion;
