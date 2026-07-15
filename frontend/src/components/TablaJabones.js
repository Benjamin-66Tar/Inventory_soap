import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ModalDesgloseStock from './ModalDesgloseStock';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const TablaJabones = ({ datos = [], onRegistrarSalida, config }) => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { searchTerm } = useSearch();
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedJabon, setSelectedJabon] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [lotes, setLotes] = useState([]);
    const UMBRAL_CRITICO = config ? config.umbral_critico_stock : 5;

    // Estados para el modal de Dar Salida
    const [showSalidaModal, setShowSalidaModal] = useState(false);
    const [jabonSeleccionadoParaSalida, setJabonSeleccionadoParaSalida] = useState(null);
    const [cantidadSalida, setCantidadSalida] = useState('');
    const [motivoSalida, setMotivoSalida] = useState('VENTA');
    const [notasSalida, setNotasSalida] = useState('');

    useEffect(() => {
        api.get('/categorias/')
            .then(res => setCategorias(res.data))
            .catch(err => console.error('Error al cargar categorías:', err));
    }, []);

    useEffect(() => {
        if (selectedJabon) {
            api.get('/produccion/')
                .then(res => {
                    const filtered = res.data.filter(p => p.jabon_producido === selectedJabon.id);
                    const mapped = filtered.map(p => ({
                        id: p.id,
                        codigo: `Lote P-${p.id}`,
                        tipo: p.tipo.toLowerCase() === 'estandar' ? 'estandar' : 'experimento',
                        cantidad: p.unidades_resultantes,
                        nota: p.notas,
                        enCurado: p.en_curado
                    }));
                    setLotes(mapped);
                })
                .catch(err => console.error("Error al cargar lotes:", err));
        } else {
            setLotes([]);
        }
    }, [selectedJabon]);

    // Lógica de filtrado memorizada para optimizar el rendimiento
    const filteredJabones = useMemo(() => {
        return datos.filter(j => {
            const coincideNombre = j.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const coincideCategoria = categoryFilter === '' || String(j.categoria) === categoryFilter;
            return coincideNombre && coincideCategoria;
        });
    }, [datos, searchTerm, categoryFilter]);

    const abrirModalSalida = (jabon) => {
        const disponibles = jabon.cantidad_lista !== undefined ? jabon.cantidad_lista : jabon.cantidad;
        if (disponibles <= 0) {
            alert("No hay jabones disponibles para usar para dar salida.");
            return;
        }
        setJabonSeleccionadoParaSalida(jabon);
        setCantidadSalida('');
        setMotivoSalida('VENTA');
        setNotasSalida('');
        setShowSalidaModal(true);
    };

    const manejarSalidaSubmit = async (e) => {
        e.preventDefault();
        const cant = parseInt(cantidadSalida);
        const disponibles = jabonSeleccionadoParaSalida.cantidad_lista !== undefined 
            ? jabonSeleccionadoParaSalida.cantidad_lista 
            : jabonSeleccionadoParaSalida.cantidad;

        if (isNaN(cant) || cant <= 0) {
            alert("Por favor ingresa una cantidad válida mayor a 0.");
            return;
        }
        if (cant > disponibles) {
            alert(`No puedes dar salida a más piezas de las que están disponibles para usar (Máximo ${disponibles} pzs).`);
            return;
        }

        try {
            await onRegistrarSalida(jabonSeleccionadoParaSalida.id, cant, motivoSalida, notasSalida);
            setShowSalidaModal(false);
            alert("Movimiento de salida registrado con éxito.");
        } catch (err) {
            // El error ya es manejado por el callback
        }
    };

    return (
        <section style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)',
            border: '1px solid #f3f4f6'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Productos Terminados</h2>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
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
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
                    ))}
                </select>
            </div>

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px', width: '80px' }}>ID</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Producto</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Categoría</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Peso Unitario</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Stock</th>
                        <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px' }}>Estado</th>
                        {role !== 'OPERADOR' && <th style={{ padding: '16px 12px', color: '#4b5563', fontWeight: '600', backgroundColor: '#f9fafb', fontSize: '13px', textAlign: 'center', width: '220px' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredJabones.length > 0 ? (
                        filteredJabones.map(j => {
                            const esCritico = j.cantidad < UMBRAL_CRITICO;
                            return (
                                <tr key={j.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '16px 12px', color: '#6b7280', fontSize: '13px' }}>
                                        {j.id}
                                    </td>
                                    <td style={{ padding: '16px 12px', fontWeight: '500', color: '#1f2937' }}>
                                        {j.nombre}
                                    </td>
                                    <td style={{ padding: '16px 12px', color: '#4b5563' }}>{j.categoria_nombre || 'Sin Categoría'}</td>
                                    <td style={{ padding: '16px 12px', color: '#4b5563' }}>{j.peso_gramos}{config ? config.unidad_peso : 'g'}</td>
                                    <td 
                                        onClick={() => setSelectedJabon(j)}
                                        style={{ 
                                            padding: '16px 12px',
                                            color: esCritico ? '#dc2626' : '#1e40af', 
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            textDecoration: 'underline dotted',
                                            textDecorationColor: esCritico ? '#dc2626' : '#1e40af'
                                        }}
                                        title="Toca para ver desglose de stock"
                                    >
                                        {j.cantidad} piezas
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                        {esCritico ? (
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                padding: '4px 10px', 
                                                backgroundColor: '#fee2e2', 
                                                color: '#b91c1c', 
                                                borderRadius: '12px', 
                                                fontSize: '11.5px', 
                                                fontWeight: '600' 
                                            }}>
                                                ⚠️ Reabastecer
                                            </span>
                                        ) : (
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                padding: '4px 10px', 
                                                backgroundColor: '#dcfce7', 
                                                color: '#15803d', 
                                                borderRadius: '12px', 
                                                fontSize: '11.5px', 
                                                fontWeight: '600' 
                                            }}>
                                                ✓ OK
                                            </span>
                                        )}
                                    </td>
                                    {role !== 'OPERADOR' && (
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => navigate('/produccion', { state: { preselectedJabonId: j.id } })}
                                                    style={{
                                                        backgroundColor: '#0B1931',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        transition: 'background-color 0.2s',
                                                        boxShadow: '0 2px 4px rgba(11, 25, 49, 0.1)'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1E3A8A'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0B1931'; }}
                                                >
                                                    Fabricar
                                                </button>
                                                <button
                                                    onClick={() => abrirModalSalida(j)}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        color: '#0B1931',
                                                        border: '1.5px solid #0B1931',
                                                        padding: '4.5px 12px',
                                                        borderRadius: '20px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(11, 25, 49, 0.05)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                >
                                                    Dar Salida
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No se encontraron jabones.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

            {/* Modal de Desglose de Stock */}
            <ModalDesgloseStock
                isOpen={!!selectedJabon}
                onClose={() => setSelectedJabon(null)}
                jabonNombre={selectedJabon ? selectedJabon.nombre : ''}
                lotes={lotes}
                cantidadLista={selectedJabon ? (selectedJabon.cantidad_lista !== undefined ? selectedJabon.cantidad_lista : selectedJabon.cantidad) : 0}
            />

            {/* Modal para Registrar Salida */}
            {showSalidaModal && jabonSeleccionadoParaSalida && (
                <div style={modalBackdropStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#e67e22' }}>Dar Salida de Inventario</h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#666' }}>
                            Retirar piezas de: <strong>{jabonSeleccionadoParaSalida.nombre}</strong> (Disponibles para usar: {jabonSeleccionadoParaSalida.cantidad_lista !== undefined ? jabonSeleccionadoParaSalida.cantidad_lista : jabonSeleccionadoParaSalida.cantidad} pzs)
                        </p>
                        <form onSubmit={manejarSalidaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={labelStyle}>Cantidad a retirar (piezas):</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={jabonSeleccionadoParaSalida.cantidad_lista !== undefined ? jabonSeleccionadoParaSalida.cantidad_lista : jabonSeleccionadoParaSalida.cantidad}
                                    placeholder={`Máx: ${jabonSeleccionadoParaSalida.cantidad_lista !== undefined ? jabonSeleccionadoParaSalida.cantidad_lista : jabonSeleccionadoParaSalida.cantidad}`}
                                    value={cantidadSalida}
                                    onChange={e => setCantidadSalida(e.target.value)}
                                    style={inputStyle}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={labelStyle}>Motivo de la Salida:</label>
                                <select
                                    value={motivoSalida}
                                    onChange={e => setMotivoSalida(e.target.value)}
                                    style={inputStyle}
                                    required
                                >
                                    <option value="VENTA">Venta 🛒</option>
                                    <option value="REGALO">Regalo / Muestra 🎁</option>
                                    <option value="USO">Uso Personal 🧖</option>
                                    <option value="MERMA">Merma / Pérdida / Daño ⚠️</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={labelStyle}>Notas / Justificación:</label>
                                <textarea
                                    placeholder="Ejem: Venta a cliente Juan, merma por caída, etc."
                                    value={notasSalida}
                                    onChange={e => setNotasSalida(e.target.value)}
                                    style={{ ...inputStyle, height: '60px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={modalButtonsStyle}>
                                <button type="button" onClick={() => setShowSalidaModal(false)} style={cancelModalBtnStyle}>
                                    Cancelar
                                </button>
                                <button type="submit" style={saveModalBtnStyle}>
                                    Registrar Salida
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
    borderLeft: '6px solid #e67e22',
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
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(230,126,34,0.2)'
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

export default TablaJabones;