import React, { useState, useMemo } from 'react';

const TablaJabones = ({ datos = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
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
                    onClick={() => alert("Aquí abrirías el Modal de Registro de Jabón")}
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
                                <td style={{ color: esCritico ? 'red' : 'black', fontWeight: 'bold' }}>
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
        </section>
    );
};

export default TablaJabones;