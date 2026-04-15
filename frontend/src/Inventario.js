import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const Inventario = () => {
    const [insumos, setInsumos] = useState([]);
    const [jabones, setJabones] = useState([]);

    // 1. Nuevos estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Umbral de stock crítico
    const UMBRAL_CRITICO = 5;

    useEffect(() => {
        // Petición para obtener Insumos
        axios.get('http://127.0.0.1:8000/api/insumos/')
            .then(res => setInsumos(res.data))
            .catch(err => console.error("Error en insumos:", err));

        // Petición para obtener Jabones
        axios.get('http://127.0.0.1:8000/api/jabones/')
            .then(res => setJabones(res.data))
            .catch(err => console.error("Error en jabones:", err));
    }, []);

    // 2. Lógica de filtrado optimizada con useMemo
    const filteredJabones = useMemo(() => {
        return jabones.filter(j => {
            const coincideNombre = j.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const coincideCategoria = categoryFilter === '' || j.categoria === categoryFilter;
            return coincideNombre && coincideCategoria;
        });
    }, [jabones, searchTerm, categoryFilter]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Panel de Inventario - Benys</h1>

            {/* 3. Nueva UI de Búsqueda y Filtros */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Buscar jabón por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', width: '300px' }}
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

            <section>
                <h2>Materia Prima (Insumos)</h2>
                <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Nombre</th>
                            <th>Cantidad (g)</th>
                            <th>Proveedor</th>
                            <th>Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumos.map(i => (
                            <tr key={i.id}>
                                <td>{i.nombre}</td>
                                <td>{i.cantidad_gramos}</td>
                                <td>{i.proveedor}</td>
                                <td>{i.fecha_ingreso}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Productos Terminados (Jabones)</h2>
                <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
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
                            // 4. Lógica visual de Stock Crítico
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
                                        {esCritico ? <strong>⚠️ REABASTECER</strong> : '✅ Ok'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default Inventario;