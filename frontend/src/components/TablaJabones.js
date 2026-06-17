import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ModalDesgloseStock from './ModalDesgloseStock';

const TablaJabones = ({ datos = [], onAbrirFormulario, config }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedJabon, setSelectedJabon] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [lotes, setLotes] = useState([]);
    const UMBRAL_CRITICO = config ? config.umbral_critico_stock : 5;

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
                        nota: p.notas
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

    return (
        <section>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Productos Terminados</h2>
                <button
                    onClick={onAbrirFormulario}
                    style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', borderRadius: '5px' }}
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
                    style={{ padding: '8px', flex: 1 }}
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ padding: '8px' }}
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
                    ))}
                </select>
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e6f7ff' }}>
                        <th>Jabón</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>Peso Unitario</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredJabones.map(j => {
                        const esCritico = j.cantidad < UMBRAL_CRITICO;
                        return (
                            <tr key={j.id} style={{ backgroundColor: esCritico ? '#ffcccc' : 'transparent' }}>
                                <td style={{ fontWeight: esCritico ? 'bold' : 'normal' }}>{j.nombre}</td>
                                <td 
                                    onClick={() => setSelectedJabon(j)}
                                    style={{ 
                                        color: esCritico ? 'red' : 'black', 
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        textDecoration: 'underline dotted',
                                        backgroundColor: 'rgba(0,123,255,0.05)'
                                    }}
                                    title="Toca para ver desglose de stock"
                                >
                                    {j.cantidad} pzs
                                </td>
                                <td>{j.categoria_nombre || 'Sin Categoría'}</td>
                                <td>{j.peso_gramos}{config ? config.unidad_peso : 'g'}</td>
                                <td>
                                    {esCritico ? <span style={{ color: 'red' }}>⚠️ REABASTECER</span> : '✅ OK'}
                                </td>
                                <td>
                                    <button
                                        onClick={() => navigate('/produccion', { state: { preselectedJabonId: j.id } })}
                                        style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(40,167,69,0.15)',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        Fabricar 🛠️
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Modal de Desglose de Stock */}
            <ModalDesgloseStock
                isOpen={!!selectedJabon}
                onClose={() => setSelectedJabon(null)}
                jabonNombre={selectedJabon ? selectedJabon.nombre : ''}
                lotes={lotes}
            />
        </section>
    );
};

export default TablaJabones;