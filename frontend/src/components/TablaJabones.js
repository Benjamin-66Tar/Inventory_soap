import React, { useState, useMemo } from 'react';

const TablaJabones = ({ datos = [], onAbrirFormulario }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedJabon, setSelectedJabon] = useState(null);
    const UMBRAL_CRITICO = 5;

    // Lógica de filtrado memorizada para optimizar el rendimiento
    const filteredJabones = useMemo(() => {
        return datos.filter(j => {
            const coincideNombre = j.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const coincideCategoria = categoryFilter === '' || j.categoria === categoryFilter;
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
                    <option value="CP">Cuidado Personal</option>
                    <option value="LAV">Lavandería</option>
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
                                <td>{j.categoria === 'CP' ? 'Cuidado Personal' : 'Lavandería'}</td>
                                <td>{j.peso_gramos}g</td>
                                <td>
                                    {esCritico ? <span style={{ color: 'red' }}>⚠️ REABASTECER</span> : '✅ OK'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Modal de Desglose de Stock */}
            {selectedJabon && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(3px)'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '25px',
                        borderRadius: '12px',
                        width: '350px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        borderLeft: '5px solid #007bff',
                        fontFamily: 'sans-serif'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333', borderBottom: '2px solid #f2f2f2', paddingBottom: '8px' }}>
                            Desglose de Stock: {selectedJabon.nombre}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#555' }}>
                                <span>🟢 Listo para usar:</span>
                                <strong style={{ color: '#28a745' }}>{selectedJabon.cantidad_lista || 0} pzs</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#555' }}>
                                <span>⏳ En proceso de curado:</span>
                                <strong style={{ color: '#ffc107' }}>{selectedJabon.cantidad_curando || 0} pzs</strong>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid #f2f2f2', margin: '5px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                                <span>Total General:</span>
                                <span>{(selectedJabon.cantidad_lista || 0) + (selectedJabon.cantidad_curando || 0)} pzs</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedJabon(null)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                marginTop: '10px',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TablaJabones;