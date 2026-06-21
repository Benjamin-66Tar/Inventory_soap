import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ModalDesgloseStock from './ModalDesgloseStock';

const TablaJabones = ({ datos = [], onAbrirFormulario, onRegistrarSalida, config }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
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
        if (jabon.cantidad <= 0) {
            alert("No hay piezas en stock disponibles para retirar.");
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
        if (isNaN(cant) || cant <= 0) {
            alert("Por favor ingresa una cantidad válida mayor a 0.");
            return;
        }
        if (cant > jabonSeleccionadoParaSalida.cantidad) {
            alert(`No puedes dar salida a más piezas de las que hay en stock (Máximo ${jabonSeleccionadoParaSalida.cantidad} pzs).`);
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#333' }}>Productos Terminados</h2>
                <button
                    onClick={onAbrirFormulario}
                    style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0, 123, 255, 0.2)' }}
                >
                    + Nuevo Jabón
                </button>
            </div>

            {/* Controles de búsqueda y filtrado */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Buscar jabón..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', flex: 1, borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' }}
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', backgroundColor: 'white' }}
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
                    ))}
                </select>
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #eee', fontSize: '14px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e6f7ff', color: '#333', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px' }}>Jabón</th>
                        <th style={{ padding: '12px' }}>Stock</th>
                        <th style={{ padding: '12px' }}>Categoría</th>
                        <th style={{ padding: '12px' }}>Peso Unitario</th>
                        <th style={{ padding: '12px' }}>Estado</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredJabones.length > 0 ? (
                        filteredJabones.map(j => {
                            const esCritico = j.cantidad < UMBRAL_CRITICO;
                            return (
                                <tr key={j.id} style={{ borderBottom: '1px solid #eee', backgroundColor: esCritico ? '#fdf2f2' : 'transparent' }}>
                                    <td style={{ padding: '12px', fontWeight: esCritico ? 'bold' : '500', color: esCritico ? '#dc3545' : '#333' }}>
                                        {j.nombre}
                                    </td>
                                    <td 
                                        onClick={() => setSelectedJabon(j)}
                                        style={{ 
                                            padding: '12px',
                                            color: esCritico ? '#dc3545' : '#007bff', 
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            textDecoration: 'underline dotted',
                                            backgroundColor: 'rgba(0,123,255,0.02)'
                                        }}
                                        title="Toca para ver desglose de stock"
                                    >
                                        {j.cantidad} piezas
                                    </td>
                                    <td style={{ padding: '12px' }}>{j.categoria_nombre || 'Sin Categoría'}</td>
                                    <td style={{ padding: '12px' }}>{j.peso_gramos}{config ? config.unidad_peso : 'g'}</td>
                                    <td style={{ padding: '12px' }}>
                                        {esCritico ? (
                                            <span style={{ padding: '2px 6px', backgroundColor: '#fdf2f2', color: '#dc3545', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                ⚠️ REABASTECER
                                            </span>
                                        ) : (
                                            <span style={{ padding: '2px 6px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                ✅ OK
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => navigate('/produccion', { state: { preselectedJabonId: j.id } })}
                                                style={{
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(40,167,69,0.15)',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                Fabricar 🛠️
                                            </button>
                                            <button
                                                onClick={() => abrirModalSalida(j)}
                                                style={{
                                                    backgroundColor: '#e67e22',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(230,126,34,0.15)',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                Dar Salida 📤
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No se encontraron jabones.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal de Desglose de Stock */}
            <ModalDesgloseStock
                isOpen={!!selectedJabon}
                onClose={() => setSelectedJabon(null)}
                jabonNombre={selectedJabon ? selectedJabon.nombre : ''}
                lotes={lotes}
            />

            {/* Modal para Registrar Salida */}
            {showSalidaModal && jabonSeleccionadoParaSalida && (
                <div style={modalBackdropStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#e67e22' }}>Dar Salida de Inventario</h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#666' }}>
                            Retirar piezas de: <strong>{jabonSeleccionadoParaSalida.nombre}</strong> (Stock: {jabonSeleccionadoParaSalida.cantidad} pzs)
                        </p>
                        <form onSubmit={manejarSalidaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={labelStyle}>Cantidad a retirar (piezas):</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={jabonSeleccionadoParaSalida.cantidad}
                                    placeholder={`Máx: ${jabonSeleccionadoParaSalida.cantidad}`}
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