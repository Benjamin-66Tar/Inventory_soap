import React, { useState, useEffect } from 'react';
import api from './api/api';

const ConfiguracionPanel = () => {
    const [activeTab, setActiveTab] = useState('general'); // Pestañas: 'general', 'admin_usuarios', 'admin_bitacora', 'admin_reglas', 'admin_datos'
    const [config, setConfig] = useState({
        unidad_peso: 'g',
        dias_curado_defecto: 28,
        umbral_critico_stock: 5
    });

    // Carga inicial de configuración
    useEffect(() => {
        api.get('/configuracion/')
            .then(res => setConfig(res.data))
            .catch(err => console.error("Error al cargar configuración:", err));
    }, []);

    // Guardar Preferencias Generales
    const guardarPreferencias = async (e) => {
        e.preventDefault();
        try {
            await api.put('/configuracion/', config);
            alert("Ajustes guardados con éxito.");
        } catch (err) {
            console.error("Error al guardar configuración:", err);
            alert("Error al guardar preferencias.");
        }
    };

    return (
        <div style={panelContainerStyle}>
            {/* Cabecera del Panel */}
            <div style={headerStyle}>
                <h2>Configuración del Sistema</h2>
                <p style={{ margin: 0, color: '#666' }}>Personaliza los parámetros globales de la aplicación y gestiona el Panel de Administración.</p>
            </div>

            {/* Cuerpo del Panel con Menú de Navegación Lateral */}
            <div style={bodyLayoutStyle}>
                {/* Menú de Pestañas Izquierdo */}
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

                {/* Área de Contenido Derecho */}
                <div style={contentAreaStyle}>
                    {activeTab === 'general' && (
                        <form onSubmit={guardarPreferencias} style={formStyle}>
                            <h3 style={sectionTitleStyle}>Preferencias Generales</h3>
                            
                            {/* Selector Radial de Unidad Global */}
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

                            {/* Umbral crítico de stock */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Umbral Crítico de Stock:</label>
                                <p style={descriptionStyle}>Cantidad mínima de piezas a partir de la cual el sistema arrojará alertas de reabastecimiento.</p>
                                <input
                                    type="number"
                                    min="0"
                                    value={config.umbral_critico_stock}
                                    onChange={e => setConfig({ ...config, umbral_critico_stock: parseInt(e.target.value) || 5 })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <button type="submit" style={saveButtonStyle}>
                                Guardar Preferencias
                            </button>
                        </form>
                    )}

                    {activeTab === 'admin_usuarios' && (
                        <div>
                            <h3 style={sectionTitleStyle}>👥 Usuarios y Roles</h3>
                            <div style={placeholderCardStyle}>
                                <span style={{ fontSize: '48px', marginBottom: '15px' }}>👥</span>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Gestión de Accesos y Permisos</h4>
                                <p style={{ margin: 0, color: '#777', fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
                                    Aquí se listarán los usuarios del sistema y se podrán asignar roles y niveles de acceso (lectura, escritura, administración).
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin_bitacora' && (
                        <div>
                            <h3 style={sectionTitleStyle}>📋 Bitácora de Sistema</h3>
                            <div style={placeholderCardStyle}>
                                <span style={{ fontSize: '48px', marginBottom: '15px' }}>📋</span>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Historial y Auditoría de Actividades</h4>
                                <p style={{ margin: 0, color: '#777', fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
                                    Sección para auditar las acciones realizadas en la aplicación, como la creación de lotes, edición de recetas y registro de salidas.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin_reglas' && (
                        <div>
                            <h3 style={sectionTitleStyle}>🚨 Reglas de Inventario</h3>
                            <div style={placeholderCardStyle}>
                                <span style={{ fontSize: '48px', marginBottom: '15px' }}>🚨</span>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Alertas y Razones de Salida</h4>
                                <p style={{ margin: 0, color: '#777', fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
                                    Configura las reglas del inventario, alertas automáticas de insumos y define el catálogo de motivos personalizados para mermas o pérdidas.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin_datos' && (
                        <div>
                            <h3 style={sectionTitleStyle}>💾 Datos y Respaldo</h3>
                            <div style={placeholderCardStyle}>
                                <span style={{ fontSize: '48px', marginBottom: '15px' }}>💾</span>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Importar y Exportar Datos</h4>
                                <p style={{ margin: 0, color: '#777', fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
                                    Genera respaldos completos de tu inventario en formatos CSV o Excel, e importa datos históricos de materias primas o recetas.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Estilos del panel de configuración
const panelContainerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    color: '#333'
};

const headerStyle = {
    marginBottom: '30px',
    borderBottom: '2px solid #eee',
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
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #eef2f6'
};

const adminHeaderStyle = {
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6c757d',
    padding: '10px 10px 5px 10px',
    borderTop: '1px solid #e9ecef',
    marginTop: '10px'
};

const subTabContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '10px'
};

const sidebarButtonStyle = (isActive) => ({
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : '#495057',
    fontWeight: 'bold',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px'
});

const subSidebarButtonStyle = (isActive) => ({
    padding: '10px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: isActive ? '#e8f0fe' : 'transparent',
    color: isActive ? '#1a73e8' : '#6c757d',
    fontWeight: isActive ? 'bold' : 'normal',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '13.5px'
});

const contentAreaStyle = {
    flex: 1,
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid #eef2f6',
    minHeight: '400px'
};

const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#444'
};

const descriptionStyle = {
    margin: '0 0 5px 0',
    fontSize: '12.5px',
    color: '#777'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '300px'
};

const radioContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '5px'
};

const radioLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer'
};

const radioInputStyle = {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
};

const saveButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 10px rgba(0, 123, 255, 0.2)',
    transition: 'background-color 0.2s'
};

const placeholderCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 20px',
    borderRadius: '10px',
    border: '2px dashed #ddd',
    backgroundColor: '#fafafa',
    marginTop: '20px'
};

export default ConfiguracionPanel;
