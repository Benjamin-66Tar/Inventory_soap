import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const TablaInsumos = ({ datos = [], onAbrirFormulario, onReabastecer, config }) => {
    const { role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [providerFilter, setProviderFilter] = useState('');

    // Estados para el modal de reabastecimiento
    const [showReabastecerModal, setShowReabastecerModal] = useState(false);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
    const [cantidadAdicional, setCantidadAdicional] = useState('');
    const [nuevoProveedor, setNuevoProveedor] = useState('');
    const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split('T')[0]);

    // Lógica de filtrado memorizada
    const filteredInsumos = useMemo(() => {
        return datos.filter(i => {
            const coincideNombre = i.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const coincideProveedor = providerFilter === '' || i.proveedor === providerFilter;
            return coincideNombre && coincideProveedor;
        });
    }, [datos, searchTerm, providerFilter]);

    // Obtener lista única de proveedores para el selector
    const proveedoresUnicos = [...new Set(datos.map(i => i.proveedor))];

    const abrirModalReabastecer = (insumo) => {
        setInsumoSeleccionado(insumo);
        setCantidadAdicional('');
        setNuevoProveedor(insumo.proveedor || '');
        setNuevaFecha(new Date().toISOString().split('T')[0]);
        setShowReabastecerModal(true);
    };

    const manejarReabastecerSubmit = async (e) => {
        e.preventDefault();
        const cant = parseFloat(cantidadAdicional);
        if (isNaN(cant) || cant <= 0) {
            alert("Por favor ingresa una cantidad válida mayor a 0.");
            return;
        }

        try {
            await onReabastecer(insumoSeleccionado.id, cant, nuevoProveedor, nuevaFecha);
            setShowReabastecerModal(false);
        } catch (err) {
            // El error ya lo maneja el callback
        }
    };

    const unitSuffix = config ? config.unidad_peso : 'g';

    return (
        <section style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#333' }}>Materia Prima (Insumos)</h2>
                {role !== 'OPERADOR' && (
                    <button
                        onClick={onAbrirFormulario}
                        style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(40, 167, 69, 0.2)' }}
                    >
                        + Nuevo Insumo
                    </button>
                )}
            </div>

            {/* Controles de búsqueda y filtrado */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Buscar insumo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', flex: 1, borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' }}
                />
                <select
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', backgroundColor: 'white' }}
                >
                    <option value="">Todos los proveedores</option>
                    {proveedoresUnicos.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #eee', fontSize: '14px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', color: '#555', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px' }}>Nombre</th>
                        <th style={{ padding: '12px' }}>Cantidad ({unitSuffix})</th>
                        <th style={{ padding: '12px' }}>Proveedor</th>
                        <th style={{ padding: '12px' }}>Fecha de Ingreso</th>
                        {role !== 'OPERADOR' && <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredInsumos.length > 0 ? (
                        filteredInsumos.map(i => (
                            <tr key={i.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{i.nombre}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ 
                                        fontWeight: 'bold', 
                                        color: i.cantidad_gramos <= (config ? config.umbral_critico_stock : 5) ? '#dc3545' : '#333' 
                                    }}>
                                        {i.cantidad_gramos} {unitSuffix}
                                    </span>
                                    {i.cantidad_gramos <= (config ? config.umbral_critico_stock : 5) && (
                                        <span style={{ marginLeft: '8px', padding: '2px 6px', backgroundColor: '#fdf2f2', color: '#dc3545', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                            Stock Crítico ⚠️
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '12px' }}>{i.proveedor}</td>
                                <td style={{ padding: '12px' }}>{i.fecha_ingreso}</td>
                                {role !== 'OPERADOR' && (
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => abrirModalReabastecer(i)}
                                            style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,123,255,0.1)' }}
                                        >
                                            Reabastecer 📥
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No se encontraron insumos.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal para Reabastecimiento */}
            {showReabastecerModal && insumoSeleccionado && (
                <div style={modalBackdropStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Reabastecer Insumo</h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#666' }}>
                            Agrega stock a: <strong>{insumoSeleccionado.nombre}</strong> (Actualmente: {insumoSeleccionado.cantidad_gramos} {unitSuffix})
                        </p>
                        <form onSubmit={manejarReabastecerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={labelStyle}>Cantidad a agregar ({unitSuffix}):</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Ejem: 500"
                                    value={cantidadAdicional}
                                    onChange={e => setCantidadAdicional(e.target.value)}
                                    style={inputStyle}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={labelStyle}>Proveedor:</label>
                                <input
                                    type="text"
                                    placeholder="Ejem: Mercado Libre"
                                    value={nuevoProveedor}
                                    onChange={e => setNuevoProveedor(e.target.value)}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={labelStyle}>Fecha de Reabastecimiento:</label>
                                <input
                                    type="date"
                                    value={nuevaFecha}
                                    onChange={e => setNuevaFecha(e.target.value)}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={modalButtonsStyle}>
                                <button type="button" onClick={() => setShowReabastecerModal(false)} style={cancelModalBtnStyle}>
                                    Cancelar
                                </button>
                                <button type="submit" style={saveModalBtnStyle}>
                                    Actualizar Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

// Estilos de modales y botones
const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    backdropFilter: 'blur(3px)'
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '350px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    borderLeft: '6px solid #007bff',
    fontFamily: 'sans-serif'
};

const labelStyle = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#444'
};

const inputStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
};

const modalButtonsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '15px'
};

const saveModalBtnStyle = {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
};

const cancelModalBtnStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
};

export default TablaInsumos;