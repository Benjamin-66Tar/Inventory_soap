// 1. Importación corregida de los hooks
import React, { useState, useMemo } from 'react';

const TablaInsumos = ({ datos = [], onAbrirFormulario, config }) => {
    // 2. Estados para la búsqueda y el filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [providerFilter, setProviderFilter] = useState('');

    // 3. Lógica de filtrado memorizada
    const filteredInsumos = useMemo(() => {
        return datos.filter(i => {
            const coincideNombre = i.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const coincideProveedor = providerFilter === '' || i.proveedor === providerFilter;
            return coincideNombre && coincideProveedor;
        });
    }, [datos, searchTerm, providerFilter]);

    // 4. Obtener lista única de proveedores para el selector
    const proveedoresUnicos = [...new Set(datos.map(i => i.proveedor))];

    return (
        <section>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2>Materia Prima (Insumos)</h2>
                {/* Botón actualizado */}
                <button
                    onClick={onAbrirFormulario}
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                >
                    + Nuevo Insumo
                </button>
            </div>

            {/* 5. Controles de búsqueda y filtrado añadidos */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Buscar insumo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', flex: 1 }}
                />
                <select
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value)}
                    style={{ padding: '8px' }}
                >
                    <option value="">Todos los proveedores</option>
                    {proveedoresUnicos.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>Nombre</th>
                        <th>Cantidad ({config ? config.unidad_peso : 'g'})</th>
                        <th>Proveedor</th>
                        <th>Fecha de Ingreso</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 6. Cambio de 'datos.map' a 'filteredInsumos.map' para que el filtro funcione */}
                    {filteredInsumos.length > 0 ? (
                        filteredInsumos.map(i => (
                            <tr key={i.id}>
                                <td>{i.nombre}</td>
                                <td>{i.cantidad_gramos} {config ? config.unidad_peso : 'g'}</td>
                                <td>{i.proveedor}</td>
                                <td>{i.fecha_ingreso}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>No se encontraron insumos.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    );
};

export default TablaInsumos;