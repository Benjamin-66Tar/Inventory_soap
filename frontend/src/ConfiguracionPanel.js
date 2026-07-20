import React, { useState, useEffect } from 'react';
import api from './api/api';
import { useResponsive } from './context/ResponsiveContext';

const ConfiguracionPanel = () => {
    const { isMobile } = useResponsive();
    const [activeTab, setActiveTab] = useState('general'); // Pestañas: 'general', 'admin_usuarios', 'admin_bitacora', 'admin_reglas', 'admin_datos'
    const [config, setConfig] = useState({
        unidad_peso: 'g',
        dias_curado_defecto: 28,
        umbral_critico_stock: 5
    });

    // Estado de Usuarios
    const [usuarios, setUsuarios] = useState([]);
    const [invitaciones, setInvitaciones] = useState([]);
    const [invitarEmail, setInvitarEmail] = useState('');
    const [invitarRol, setInvitarRol] = useState('OPERADOR');
    const [invitationLink, setInvitationLink] = useState('');

    // Estado de Bitácora
    const [bitacora, setBitacora] = useState([]);
    const [searchBitacora, setSearchBitacora] = useState('');

    // Archivo de Respaldo
    const [backupFile, setBackupFile] = useState(null);

    // Modal Cambio Contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    // Estados de carga y mensajes
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Carga inicial de configuración
    useEffect(() => {
        cargarConfiguracion();
    }, []);

    // Cargar datos según la pestaña activa
    useEffect(() => {
        if (activeTab === 'admin_usuarios') {
            cargarUsuarios();
            cargarInvitaciones();
        } else if (activeTab === 'admin_bitacora') {
            cargarBitacora();
        }
        setMessage('');
        setError('');
    }, [activeTab]);

    const cargarConfiguracion = () => {
        api.get('/configuracion/')
            .then(res => setConfig(res.data))
            .catch(err => console.error("Error al cargar configuración:", err));
    };

    const cargarUsuarios = () => {
        api.get('/admin/usuarios/')
            .then(res => setUsuarios(res.data))
            .catch(err => console.error("Error al cargar usuarios:", err));
    };

    const cargarInvitaciones = () => {
        api.get('/admin/usuarios/invitaciones_pendientes/')
            .then(res => setInvitaciones(res.data))
            .catch(err => console.error("Error al cargar invitaciones:", err));
    };

    const cargarBitacora = () => {
        const query = searchBitacora ? `?search=${encodeURIComponent(searchBitacora)}` : '';
        api.get(`/admin/bitacora/${query}`)
            .then(res => setBitacora(res.data))
            .catch(err => console.error("Error al cargar bitácora:", err));
    };

    const guardarPreferencias = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.put('/configuracion/', config);
            setMessage("Preferencias del sistema guardadas con éxito.");
        } catch (err) {
            console.error("Error al guardar configuración:", err);
            setError("Error al guardar preferencias.");
        }
    };

    // Invitar Usuario
    const handleInvitar = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setInvitationLink('');
        if (!invitarEmail.trim()) return;

        try {
            const res = await api.post('/admin/invitar/', {
                email: invitarEmail,
                rol: invitarRol
            });
            setMessage(`Invitación enviada a ${invitarEmail}.`);
            // Guardar link devuelto para mostrarlo en pantalla (desarrollo local)
            if (res.data.link) {
                setInvitationLink(res.data.link);
            }
            setInvitarEmail('');
            cargarInvitaciones();
        } catch (err) {
            setError(err.response?.data?.error || "Error al enviar la invitación.");
        }
    };

    // Eliminar Invitación
    const handleEliminarInvitacion = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta invitación pendiente?")) return;
        try {
            await api.post('/admin/usuarios/eliminar_invitacion/', { id });
            cargarInvitaciones();
        } catch (err) {
            console.error(err);
            alert("Error al eliminar invitación.");
        }
    };

    // Cambiar estado de usuario (Activar/Suspender)
    const handleCambiarEstado = async (id, currentStatus) => {
        const actionText = currentStatus ? "suspender" : "activar";
        if (!window.confirm(`¿Seguro que deseas ${actionText} a este usuario?`)) return;

        try {
            await api.patch(`/admin/usuarios/${id}/cambiar_estado/`, { is_active: !currentStatus });
            cargarUsuarios();
        } catch (err) {
            console.error(err);
            alert("Error al cambiar estado de usuario.");
        }
    };

    // Cambiar rol de usuario
    const handleCambiarRol = async (id, newRol) => {
        try {
            await api.patch(`/admin/usuarios/${id}/cambiar_rol/`, { rol: newRol });
            cargarUsuarios();
            alert("Rol actualizado correctamente.");
        } catch (err) {
            console.error(err);
            alert("Error al actualizar rol.");
        }
    };

    // Abrir modal de contraseña
    const abrirModalPassword = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setNuevaPassword('');
        setErrorPassword('');
        setShowPasswordModal(true);
    };

    // Cambiar contraseña
    const handleCambiarPassword = async (e) => {
        e.preventDefault();
        setErrorPassword('');

        if (nuevaPassword.trim().length < 6) {
            setErrorPassword('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            await api.post(`/admin/usuarios/${usuarioSeleccionado.id}/cambiar-password/`, {
                password: nuevaPassword.trim()
            });
            alert(`Contraseña de ${usuarioSeleccionado.username} cambiada con éxito.`);
            setShowPasswordModal(false);
        } catch (err) {
            console.error("Error al cambiar contraseña:", err);
            const msg = err.response?.data?.error || "Error al actualizar la contraseña.";
            setErrorPassword(msg);
        }
    };

    // Exportar Datos
    const handleExportar = async () => {
        try {
            const response = await api.get('/admin/respaldo/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'respaldo_inventario_benys.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert("Error al exportar datos de respaldo.");
        }
    };

    // Importar Datos
    const handleImportar = async (e) => {
        e.preventDefault();
        if (!backupFile) return;

        if (!window.confirm("⚠️ ADVERTENCIA CRÍTICA: Esta acción borrará TODO el inventario actual, producciones, consumos, recetas e historiales para reemplazarlos con los datos del archivo. ¿Deseas continuar?")) {
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('file', backupFile);

        try {
            await api.post('/admin/respaldo/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage("Base de datos restaurada con éxito.");
            setBackupFile(null);
            cargarConfiguracion();
        } catch (err) {
            setError(err.response?.data?.error || "Error al importar el archivo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={panelContainerStyle}>
            {/* Cabecera del Panel */}
            <div style={headerStyle}>
                <h2>⚙️ Configuración del Sistema</h2>
                <p style={{ margin: 0, color: '#9ca3af' }}>Personaliza los parámetros globales de la aplicación y gestiona el Panel de Administración.</p>
            </div>

            {/* Mensajes de feedback */}
            {message && (
                <div style={{ ...alertStyle, backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
                    <span>✅</span>
                    <span>{message}</span>
                </div>
            )}
            {error && (
                <div style={{ ...alertStyle, backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Cuerpo del Panel con Menú de Navegación Lateral */}
            <div style={{
                ...bodyLayoutStyle,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '15px' : '30px',
                alignItems: 'stretch'
            }}>
                {/* Menú de Pestañas Izquierdo */}
                {isMobile ? (
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        WebkitOverflowScrolling: 'touch',
                        borderBottom: '1px solid #1f2937',
                        paddingBottom: '10px',
                        marginBottom: '15px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        <button
                            onClick={() => setActiveTab('general')}
                            style={mobileChipStyle(activeTab === 'general')}
                        >
                            ⚙️ General
                        </button>
                        <button
                            onClick={() => setActiveTab('admin_usuarios')}
                            style={mobileChipStyle(activeTab === 'admin_usuarios')}
                        >
                            👥 Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('admin_bitacora')}
                            style={mobileChipStyle(activeTab === 'admin_bitacora')}
                        >
                            📋 Bitácora
                        </button>
                        <button
                            onClick={() => setActiveTab('admin_reglas')}
                            style={mobileChipStyle(activeTab === 'admin_reglas')}
                        >
                            🚨 Reglas
                        </button>
                        <button
                            onClick={() => setActiveTab('admin_datos')}
                            style={mobileChipStyle(activeTab === 'admin_datos')}
                        >
                            💾 Respaldo
                        </button>
                    </div>
                ) : (
                    <div style={sidebarStyle}>
                        <button
                            onClick={() => setActiveTab('general')}
                            style={sidebarButtonStyle(activeTab === 'general')}
                        >
                            ⚙️ Preferencias Generales
                        </button>
                        
                        <div style={adminHeaderStyle}>
                            🛡️ Panel de Administración
                        </div>
                        
                        <div style={subTabContainerStyle}>
                            <button
                                onClick={() => setActiveTab('admin_usuarios')}
                                style={subSidebarButtonStyle(activeTab === 'admin_usuarios')}
                            >
                                👥 Usuarios y Roles
                            </button>
                            <button
                                onClick={() => setActiveTab('admin_bitacora')}
                                style={subSidebarButtonStyle(activeTab === 'admin_bitacora')}
                            >
                                📋 Bitácora de Sistema
                            </button>
                            <button
                                onClick={() => setActiveTab('admin_reglas')}
                                style={subSidebarButtonStyle(activeTab === 'admin_reglas')}
                            >
                                🚨 Reglas de Inventario
                            </button>
                            <button
                                onClick={() => setActiveTab('admin_datos')}
                                style={subSidebarButtonStyle(activeTab === 'admin_datos')}
                            >
                                💾 Datos y Respaldo
                            </button>
                        </div>
                    </div>
                )}

                {/* Área de Contenido Derecho */}
                <div style={{
                    ...contentAreaStyle,
                    padding: isMobile ? '15px' : '30px',
                    minHeight: isMobile ? 'auto' : '500px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    
                    {/* pestaña: GENERAL */}
                    {activeTab === 'general' && (
                        <form onSubmit={guardarPreferencias} style={formStyle}>
                            <h3 style={sectionTitleStyle}>Preferencias Generales</h3>
                            
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Unidad Global de Peso y Medida:</label>
                                <p style={descriptionStyle}>Define la unidad que se usará para el peso unitario de los jabones y cantidad de materia prima.</p>
                                <div style={radioContainerStyle}>
                                    <label style={radioLabelStyle}>
                                        <input
                                            type="radio"
                                            name="unidad_peso"
                                            value="g"
                                            checked={config.unidad_peso === 'g'}
                                            onChange={e => setConfig({ ...config, unidad_peso: e.target.value })}
                                            style={radioInputStyle}
                                        />
                                        Gramos (g)
                                    </label>
                                    <label style={radioLabelStyle}>
                                        <input
                                            type="radio"
                                            name="unidad_peso"
                                            value="oz"
                                            checked={config.unidad_peso === 'oz'}
                                            onChange={e => setConfig({ ...config, unidad_peso: e.target.value })}
                                            style={radioInputStyle}
                                        />
                                        Onzas (oz)
                                    </label>
                                    <label style={radioLabelStyle}>
                                        <input
                                            type="radio"
                                            name="unidad_peso"
                                            value="pzs"
                                            checked={config.unidad_peso === 'pzs'}
                                            onChange={e => setConfig({ ...config, unidad_peso: e.target.value })}
                                            style={radioInputStyle}
                                        />
                                        Piezas Estándar (pzs)
                                    </label>
                                </div>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Umbral Crítico de Stock:</label>
                                <p style={descriptionStyle}>Cantidad mínima de piezas a partir de la cual el sistema arrojará alertas de reabastecimiento.</p>
                                <input
                                    type="number"
                                    min="0"
                                    value={config.umbral_critico_stock}
                                    onChange={e => setConfig({ ...config, umbral_critico_stock: parseInt(e.target.value) || 0 })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Días de Curado por Defecto:</label>
                                <p style={descriptionStyle}>Periodo estándar de reposo requerido para que un jabón salga de la etapa de curado.</p>
                                <input
                                    type="number"
                                    min="1"
                                    value={config.dias_curado_defecto}
                                    onChange={e => setConfig({ ...config, dias_curado_defecto: parseInt(e.target.value) || 0 })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <button type="submit" style={saveButtonStyle}>
                                Guardar Preferencias
                            </button>
                        </form>
                    )}

                    {/* pestaña: USUARIOS Y ROLES */}
                    {activeTab === 'admin_usuarios' && (
                        <div>
                            <h3 style={sectionTitleStyle}>👥 Usuarios y Roles (Accesos y Permisos)</h3>
                            
                            {/* Formulario de Invitación */}
                            <div style={cardStyle}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>Invitar Nuevo Usuario</h4>
                                <p style={descriptionStyle}>Introduce el correo electrónico y asigna un rol inicial. El sistema generará un enlace único para que complete su registro.</p>
                                
                                <form onSubmit={handleInvitar} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '15px' }}>
                                    <div style={{ ...formGroupStyle, flex: 1, minWidth: '200px' }}>
                                        <label style={labelStyle}>Correo Electrónico</label>
                                        <input
                                            type="email"
                                            value={invitarEmail}
                                            onChange={e => setInvitarEmail(e.target.value)}
                                            placeholder="empleado@prueba.com"
                                            style={inputStyle2}
                                            required
                                        />
                                    </div>
                                    <div style={{ ...formGroupStyle, width: '160px' }}>
                                        <label style={labelStyle}>Rol del Colaborador</label>
                                        <select
                                            value={invitarRol}
                                            onChange={e => setInvitarRol(e.target.value)}
                                            style={inputStyle2}
                                        >
                                            <option value="OPERADOR">Operador</option>
                                            <option value="SUPERVISOR">Supervisor</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </div>
                                    <button type="submit" style={saveButtonStyle}>
                                        Enviar Invitación
                                    </button>
                                </form>

                                {invitationLink && (
                                    <div style={linkContainerStyle}>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#60a5fa', fontSize: '13px' }}>Enlace de Registro Único Generado (SMTP Simulado):</p>
                                        <code style={codeStyle}>{window.location.origin + invitationLink}</code>
                                        <button 
                                            style={copyButtonStyle} 
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.origin + invitationLink);
                                                alert("¡Enlace copiado al portapapeles!");
                                            }}
                                        >
                                            Copiar Enlace
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Invitaciones Pendientes */}
                            {invitaciones.length > 0 && (
                                <div style={{ marginTop: '25px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>Invitaciones Pendientes</h4>
                                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                                        <table style={tableStyle}>
                                            <thead>
                                                <tr style={tableHeaderRowStyle}>
                                                    <th style={tableHeaderStyle}>Email</th>
                                                    <th style={tableHeaderStyle}>Rol Asignado</th>
                                                    <th style={tableHeaderStyle}>Expiración</th>
                                                    <th style={tableHeaderStyle}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invitaciones.map(inv => (
                                                    <tr key={inv.id} style={tableRowStyle}>
                                                        <td style={tableCellStyle}>{inv.email}</td>
                                                        <td style={tableCellStyle}>
                                                            <span style={badgeStyle('#60a5fa', 'rgba(96,165,250,0.15)')}>
                                                                {inv.rol === 'ADMIN' ? 'Administrador' : inv.rol === 'SUPERVISOR' ? 'Supervisor' : 'Operador'}
                                                            </span>
                                                        </td>
                                                        <td style={tableCellStyle}>{new Date(inv.expires_at).toLocaleString()}</td>
                                                        <td style={tableCellStyle}>
                                                            <button 
                                                                style={actionButtonStyle(true)}
                                                                onClick={() => handleEliminarInvitacion(inv.id)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Usuarios Activos */}
                            <div style={{ marginTop: '25px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>Colaboradores del Sistema</h4>
                                <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr style={tableHeaderRowStyle}>
                                                <th style={tableHeaderStyle}>Usuario</th>
                                                <th style={tableHeaderStyle}>Email</th>
                                                <th style={tableHeaderStyle}>Nombre Completo</th>
                                                <th style={tableHeaderStyle}>Rol</th>
                                                <th style={tableHeaderStyle}>Estado</th>
                                                <th style={tableHeaderStyle}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.map(u => {
                                                const uRol = u.rol || 'OPERADOR';
                                                return (
                                                    <tr key={u.id} style={tableRowStyle}>
                                                        <td style={tableCellStyle}>{u.username}</td>
                                                        <td style={tableCellStyle}>{u.email}</td>
                                                        <td style={tableCellStyle}>{u.first_name} {u.last_name}</td>
                                                        <td style={tableCellStyle}>
                                                            <select
                                                                value={uRol}
                                                                onChange={e => handleCambiarRol(u.id, e.target.value)}
                                                                style={selectInlineStyle}
                                                            >
                                                                <option value="OPERADOR">Operador</option>
                                                                <option value="SUPERVISOR">Supervisor</option>
                                                                <option value="ADMIN">Administrador</option>
                                                            </select>
                                                        </td>
                                                        <td style={tableCellStyle}>
                                                            <span style={badgeStyle(u.is_active ? '#34d399' : '#f87171', u.is_active ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)')}>
                                                                {u.is_active ? 'Activo' : 'Suspendido'}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...tableCellStyle, display: 'flex', gap: '8px' }}>
                                                            <button 
                                                                style={changePasswordBtnStyle}
                                                                onClick={() => abrirModalPassword(u)}
                                                            >
                                                                🔑 Clave
                                                            </button>
                                                            <button 
                                                                style={actionButtonStyle(false, u.is_active)}
                                                                onClick={() => handleCambiarEstado(u.id, u.is_active)}
                                                            >
                                                                {u.is_active ? 'Suspender' : 'Activar'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* pestaña: BITÁCORA */}
                    {activeTab === 'admin_bitacora' && (
                        <div>
                            <h3 style={sectionTitleStyle}>📋 Bitácora de Actividades (Auditoría)</h3>
                            <p style={descriptionStyle}>Historial completo de auditoría del sistema para revisar las acciones realizadas por cada colaborador.</p>
                            
                            {/* Barra de Búsqueda */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', marginTop: '15px' }}>
                                <input
                                    type="text"
                                    value={searchBitacora}
                                    onChange={e => setSearchBitacora(e.target.value)}
                                    placeholder="Buscar por usuario o acción..."
                                    style={{ ...inputStyle2, flex: 1 }}
                                    onKeyDown={e => { if (e.key === 'Enter') cargarBitacora(); }}
                                />
                                <button onClick={cargarBitacora} style={saveButtonStyle}>
                                    Buscar
                                </button>
                            </div>

                            {/* Tabla de bitácora */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr style={tableHeaderRowStyle}>
                                            <th style={{ ...tableHeaderStyle, width: '180px' }}>Fecha y Hora</th>
                                            <th style={{ ...tableHeaderStyle, width: '130px' }}>Usuario</th>
                                            <th style={{ ...tableHeaderStyle, width: '180px' }}>Acción</th>
                                            <th style={tableHeaderStyle}>Detalles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bitacora.length > 0 ? (
                                            bitacora.map(log => (
                                                <tr key={log.id} style={tableRowStyle}>
                                                    <td style={{ ...tableCellStyle, fontSize: '13px', color: '#9ca3af' }}>{new Date(log.fecha_hora).toLocaleString()}</td>
                                                    <td style={{ ...tableCellStyle, fontWeight: '600' }}>{log.usuario_nombre || 'Sistema'}</td>
                                                    <td style={tableCellStyle}>
                                                        <span style={badgeStyle('#a78bfa', 'rgba(167,139,250,0.15)')}>
                                                            {log.accion}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...tableCellStyle, fontSize: '13px', color: '#d1d5db' }}>{log.detalles || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ ...tableCellStyle, textAlign: 'center', padding: '40px 10px', color: '#6b7280' }}>
                                                    No se encontraron registros en la bitácora.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* pestaña: REGLAS DE INVENTARIO */}
                    {activeTab === 'admin_reglas' && (
                        <div>
                            <h3 style={sectionTitleStyle}>🚨 Reglas de Inventario y Alertas</h3>
                            
                            <div style={cardStyle}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>Alertas de Reabastecimiento Crítico</h4>
                                <p style={descriptionStyle}>Cuando las existencias de un insumo o jabón curado caigan por debajo del <strong>umbral crítico</strong> de stock (actualmente establecido en: <strong>{config.umbral_critico_stock}</strong>), el sistema mostrará alertas visuales rojas destacadas en las tablas de inventario.</p>
                            </div>

                            <div style={{ ...cardStyle, marginTop: '20px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>Período Obligatorio de Curado</h4>
                                <p style={descriptionStyle}>Los jabones fabricados pasan automáticamente a curado por un tiempo mínimo de <strong>{config.dias_curado_defecto} días</strong>. Durante este período, el stock está restringido para uso o venta, a menos que un administrador autorice su salida manual de curado en la sección correspondiente.</p>
                            </div>

                            <div style={{ ...cardStyle, marginTop: '20px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>Catálogo de Razones para Salidas de Inventario</h4>
                                <p style={descriptionStyle}>Se restringen los motivos de salidas del inventario a las razones estandarizadas:</p>
                                <ul style={{ color: '#d1d5db', paddingLeft: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                                    <li>🛒 <strong>Venta</strong>: Jabones despachados para pedidos comerciales.</li>
                                    <li>🎁 <strong>Regalo</strong>: Muestras gratuitas, obsequios o degustación.</li>
                                    <li>🧼 <strong>Uso Personal</strong>: Productos retirados para consumo del personal o pruebas internas.</li>
                                    <li>⚠️ <strong>Merma/Daño</strong>: Desperdicios, jabones estropeados durante el curado, o lotes rechazados por calidad.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* pestaña: DATOS Y RESPALDO */}
                    {activeTab === 'admin_datos' && (
                        <div>
                            <h3 style={sectionTitleStyle}>💾 Datos y Respaldo</h3>
                            <p style={descriptionStyle}>Gestiona copias de seguridad de la base de datos de SoapManager en formato JSON para prevenir pérdidas o migrar de equipo.</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '25px' }}>
                                
                                {/* Exportar */}
                                <div style={cardStyle}>
                                    <span style={{ fontSize: '32px' }}>📤</span>
                                    <h4 style={{ margin: '10px 0', color: '#ffffff' }}>Exportar Base de Datos</h4>
                                    <p style={{ ...descriptionStyle, marginBottom: '20px' }}>Descarga un archivo con toda la información de materias primas, jabones, recetas, lotes, salidas e historiales.</p>
                                    <button onClick={handleExportar} style={{ ...saveButtonStyle, alignSelf: 'stretch', width: '100%', textAlign: 'center' }}>
                                        Descargar Respaldo JSON
                                    </button>
                                </div>

                                {/* Importar */}
                                <div style={cardStyle}>
                                    <span style={{ fontSize: '32px' }}>📥</span>
                                    <h4 style={{ margin: '10px 0', color: '#ffffff' }}>Restaurar Base de Datos</h4>
                                    <p style={{ ...descriptionStyle, marginBottom: '20px' }}>Selecciona un archivo JSON de respaldo de SoapManager para restablecer el estado del inventario completo.</p>
                                    
                                    <form onSubmit={handleImportar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={e => setBackupFile(e.target.files[0])}
                                            style={fileInputStyle}
                                            required
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            style={{ ...saveButtonStyle, backgroundColor: '#f87171', alignSelf: 'stretch', width: '100%', textAlign: 'center' }}
                                        >
                                            {loading ? 'Restaurando...' : 'Subir e Importar JSON'}
                                        </button>
                                    </form>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Modal de Cambio de Contraseña */}
            {showPasswordModal && usuarioSeleccionado && (
                <div style={modalBackdropStyle}>
                    <div style={{ ...modalContentStyle, width: '400px' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#ffffff' }}>Cambiar Contraseña</h3>
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '15px' }}>
                            Establecer nueva contraseña para el usuario <strong>{usuarioSeleccionado.username}</strong>.
                        </p>
                        <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>Nueva Contraseña:</label>
                                <input
                                    type="password"
                                    placeholder="Al menos 6 caracteres"
                                    value={nuevaPassword}
                                    onChange={e => setNuevaPassword(e.target.value)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #374151',
                                        backgroundColor: '#111827',
                                        color: '#ffffff',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                    required
                                    autoFocus
                                    minLength={6}
                                />
                            </div>
                            {errorPassword && (
                                <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>
                                    ⚠️ {errorPassword}
                                </p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowPasswordModal(false)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid #374151',
                                        backgroundColor: 'transparent',
                                        color: '#d1d5db',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '13px'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: '#3b82f6',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '13px'
                                    }}
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

// Estilos del panel de configuración
const panelContainerStyle = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '20px',
    color: '#f3f4f6'
};

const headerStyle = {
    marginBottom: '25px',
    borderBottom: '1px solid #1f2937',
    paddingBottom: '15px'
};

const bodyLayoutStyle = {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start'
};

const sidebarStyle = {
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#111827',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #1f2937'
};

const adminHeaderStyle = {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#9ca3af',
    padding: '12px 10px 4px 10px',
    borderTop: '1px solid #1f2937',
    marginTop: '10px'
};

const subTabContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '5px'
};

const sidebarButtonStyle = (isActive) => ({
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#ffffff' : '#9ca3af',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px'
});

const subSidebarButtonStyle = (isActive) => ({
    padding: '10px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: isActive ? '#1f2937' : 'transparent',
    color: isActive ? '#3b82f6' : '#9ca3af',
    fontWeight: isActive ? '600' : '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '13.5px'
});

const mobileChipStyle = (isActive) => ({
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid ' + (isActive ? '#3b82f6' : '#1f2937'),
    backgroundColor: isActive ? '#3b82f6' : '#111827',
    color: isActive ? '#ffffff' : '#9ca3af',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
});

const contentAreaStyle = {
    flex: 1,
    backgroundColor: '#111827',
    padding: '30px',
    borderRadius: '12px',
    border: '1px solid #1f2937',
    minHeight: '500px'
};

const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: '20px',
    color: '#ffffff',
    borderBottom: '1px solid #1f2937',
    paddingBottom: '12px',
    fontSize: '20px',
    fontWeight: '700'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px'
};

const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb'
};

const descriptionStyle = {
    margin: '0 0 4px 0',
    fontSize: '13px',
    color: '#9ca3af',
    lineHeight: '1.4'
};

const inputStyle = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '240px'
};

const inputStyle2 = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
};

const fileInputStyle = {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer'
};

const radioContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px'
};

const radioLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#d1d5db'
};

const radioInputStyle = {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#3b82f6'
};

const saveButtonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '11px 22px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)',
    transition: 'background-color 0.2s'
};

const cardStyle = {
    backgroundColor: '#1f2937',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #374151',
};

const linkContainerStyle = {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#111827',
    borderRadius: '8px',
    border: '1px solid #374151',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const codeStyle = {
    padding: '8px',
    backgroundColor: '#1f2937',
    borderRadius: '4px',
    fontSize: '13px',
    wordBreak: 'break-all',
    color: '#e5e7eb',
    fontFamily: 'monospace',
    border: '1px solid #374151'
};

const copyButtonStyle = {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    color: '#60a5fa',
    border: '1px solid #60a5fa',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s'
};

const alertStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    fontSize: '14px',
    textAlign: 'left'
};

const tableHeaderRowStyle = {
    borderBottom: '2px solid #374151',
};

const tableHeaderStyle = {
    padding: '12px 10px',
    fontWeight: '600',
    color: '#9ca3af'
};

const tableRowStyle = {
    borderBottom: '1px solid #1f2937',
    transition: 'background-color 0.2s',
    '&:hover': {
        backgroundColor: '#1f2937'
    }
};

const tableCellStyle = {
    padding: '12px 10px',
    color: '#e5e7eb'
};

const badgeStyle = (color, bgColor) => ({
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: color,
    backgroundColor: bgColor,
    display: 'inline-block'
});

const selectInlineStyle = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer'
};

const actionButtonStyle = (isDanger, isActive) => ({
    backgroundColor: isDanger ? '#ef4444' : (isActive ? '#f59e0b' : '#10b981'),
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    transition: 'background-color 0.2s'
});

const changePasswordBtnStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    marginRight: '8px',
    transition: 'background-color 0.2s'
};

const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    backgroundColor: '#1f2937',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #374151',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)'
};

export default ConfiguracionPanel;
