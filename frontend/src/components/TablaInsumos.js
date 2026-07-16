import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const TablaInsumos = ({ datos = [], onAbrirFormulario, onReabastecer, config }) => {
    const { role } = useAuth();
    const { searchTerm } = useSearch();
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
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '24px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)',
                border: '1px solid #f3f4f6'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Materia Prima (Insumos)</h2>
                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        style={{ 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            border: '1px solid #e5e7eb', 
                            fontSize: '13px', 
                            outline: 'none', 
                            backgroundColor: 'white',
                            color: '#4b5563',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Todos los proveedores</option>
                        {proveedoresUnicos.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
                {role !== 'OPERADOR' && (
                    <button
                        onClick={onAbrirFormulario}
                        style={{ 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            padding: '8px 20px', 
                            borderRadius: '20px', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontWeight: '600', 
                            fontSize: '13px', 
                            transition: 'background-color 0.2s',
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)' 
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
                    >
                        + Nuevo Insumo
                    </button>
                )}
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Nombre</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Cantidad ({unitSuffix})</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Proveedor</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Fecha de Ingreso</th>
                        {role !== 'OPERADOR' && <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px', textAlign: 'center', width: '150px' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredInsumos.length > 0 ? (
                        filteredInsumos.map(i => {
                            const esCritico = i.cantidad_gramos <= (config ? config.umbral_critico_stock : 5);
                            return (
                                <tr key={i.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '16px 12px', fontWeight: '500', color: '#1f2937' }}>{i.nombre}</td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <span style={{ 
                                            fontWeight: '600', 
                                            color: esCritico ? '#dc2626' : '#1f2937' 
                                        }}>
                                            {i.cantidad_gramos} {unitSuffix}
                                        </span>
                                        {esCritico && (
                                            <span style={{ 
                                                marginLeft: '8px', 
                                                padding: '4px 10px', 
                                                backgroundColor: '#fee2e2', 
                                                color: '#b91c1c', 
                                                borderRadius: '12px', 
                                                fontSize: '11px', 
                                                fontWeight: '600' 
                                            }}>
                                                ⚠️ Stock Crítico
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 12px', color: '#4b5563' }}>{i.proveedor}</td>
                                    <td style={{ padding: '16px 12px', color: '#4b5563' }}>{i.fecha_ingreso}</td>
                                    {role !== 'OPERADOR' && (
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => abrirModalReabastecer(i)}
                                                style={{ 
                                                    backgroundColor: '#0B1931', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '6px 14px', 
                                                    borderRadius: '20px', 
                                                    cursor: 'pointer', 
                                                    fontWeight: '600', 
                                                    fontSize: '12px', 
                                                    transition: 'background-color 0.2s',
                                                    boxShadow: '0 2px 4px rgba(11, 25, 49, 0.1)' 
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1E3A8A'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0B1931'; }}
                                            >
                                                Reabastecer
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No se encontraron insumos.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>

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