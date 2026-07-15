import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { styles } from './HistorialStyles';
import BarraFiltrosHistorial from './BarraFiltrosHistorial';
import BarraFiltrosSalidas from './BarraFiltrosSalidas';

const HistorialProduccion = () => {
    const [activeTab, setActiveTab] = useState('elaboraciones'); // 'elaboraciones' o 'salidas'
    const [historial, setHistorial] = useState([]);
    const [salidas, setSalidas] = useState([]);

    // Filtros para Elaboraciones
    const [filters, setFilters] = useState({
        searchTerm: '',
        tipo: 'ALL',
        datePreset: 'all',
        startDate: '',
        endDate: ''
    });

    // Filtros para Salidas
    const [filtersSalidas, setFiltersSalidas] = useState({
        searchTerm: '',
        motivo: 'ALL',
        datePreset: 'all',
        startDate: '',
        endDate: ''
    });

    const cargarDatos = () => {
        api.get('/produccion/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setHistorial(data.sort((a, b) => new Date(b.fecha_elaboracion) - new Date(a.fecha_elaboracion)));
            })
            .catch(err => console.error("Error al cargar el historial de producción:", err));

        api.get('/salidas/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setSalidas(data.sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida)));
            })
            .catch(err => console.error("Error al cargar salidas:", err));
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Actualizar filtros parcialmente (Elaboraciones)
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Restablecer todos los filtros (Elaboraciones)
    const handleClearFilters = () => {
        setFilters({
            searchTerm: '',
            tipo: 'ALL',
            datePreset: 'all',
            startDate: '',
            endDate: ''
        });
    };

    // Actualizar filtros parcialmente (Salidas)
    const handleFilterSalidasChange = (newFilters) => {
        setFiltersSalidas(prev => ({ ...prev, ...newFilters }));
    };

    // Restablecer todos los filtros (Salidas)
    const handleClearFiltersSalidas = () => {
        setFiltersSalidas({
            searchTerm: '',
            motivo: 'ALL',
            datePreset: 'all',
            startDate: '',
            endDate: ''
        });
    };

    // Lógica de filtrado en cascada memorizada (Elaboraciones)
    const filteredHistorial = useMemo(() => {
        return historial.filter(item => {
            // 1. Filtro de búsqueda (Jabón o Notas)
            const soapName = (item.jabon_nombre || '').toLowerCase();
            const notes = (item.notas || '').toLowerCase();
            const search = filters.searchTerm.toLowerCase();
            const matchesSearch = soapName.includes(search) || notes.includes(search);

            // 2. Filtro de tipo de lote
            const matchesTipo = filters.tipo === 'ALL' || item.tipo === filters.tipo;

            // 3. Filtro por fecha (Normalizado a Días)
            let matchesDate = true;
            const itemDate = new Date(item.fecha_elaboracion);
            const itemDateStart = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()).getTime();
            
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

            if (filters.datePreset === 'today') {
                matchesDate = itemDateStart === todayStart;
            } else if (filters.datePreset === 'last7') {
                const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
                matchesDate = itemDateStart >= sevenDaysAgo && itemDateStart <= todayStart;
            } else if (filters.datePreset === 'thisMonth') {
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
                matchesDate = itemDateStart >= firstDayOfMonth && itemDateStart <= todayStart;
            } else if (filters.datePreset === 'custom') {
                if (filters.startDate) {
                    const start = new Date(filters.startDate).getTime();
                    matchesDate = matchesDate && itemDateStart >= start;
                }
                if (filters.endDate) {
                    const end = new Date(filters.endDate).getTime();
                    matchesDate = matchesDate && itemDateStart <= end;
                }
            }

            return matchesSearch && matchesTipo && matchesDate;
        });
    }, [historial, filters]);

    // Lógica de filtrado en cascada memorizada (Salidas)
    const filteredSalidas = useMemo(() => {
        return salidas.filter(item => {
            // 1. Filtro de búsqueda (Jabón o Notas)
            const soapName = (item.jabon_nombre || '').toLowerCase();
            const notes = (item.notas || '').toLowerCase();
            const search = filtersSalidas.searchTerm.toLowerCase();
            const matchesSearch = soapName.includes(search) || notes.includes(search);

            // 2. Filtro de motivo
            const matchesMotivo = filtersSalidas.motivo === 'ALL' || item.motivo_salida === filtersSalidas.motivo;

            // 3. Filtro por fecha (Normalizado a Días)
            let matchesDate = true;
            const itemDate = new Date(item.fecha_salida);
            const itemDateStart = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()).getTime();
            
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

            if (filtersSalidas.datePreset === 'today') {
                matchesDate = itemDateStart === todayStart;
            } else if (filtersSalidas.datePreset === 'last7') {
                const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
                matchesDate = itemDateStart >= sevenDaysAgo && itemDateStart <= todayStart;
            } else if (filtersSalidas.datePreset === 'thisMonth') {
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
                matchesDate = itemDateStart >= firstDayOfMonth && itemDateStart <= todayStart;
            } else if (filtersSalidas.datePreset === 'custom') {
                if (filtersSalidas.startDate) {
                    const start = new Date(filtersSalidas.startDate).getTime();
                    matchesDate = matchesDate && itemDateStart >= start;
                }
                if (filtersSalidas.endDate) {
                    const end = new Date(filtersSalidas.endDate).getTime();
                    matchesDate = matchesDate && itemDateStart <= end;
                }
            }

            return matchesSearch && matchesMotivo && matchesDate;
        });
    }, [salidas, filtersSalidas]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Historiales de Actividad</h2>

            {/* Pestañas Superiores Horizontales */}
            <div style={tabContainerStyle}>
                <button
                    onClick={() => setActiveTab('elaboraciones')}
                    style={tabButtonStyle(activeTab === 'elaboraciones')}
                >
                    🧪 Historial de Elaboración
                </button>
                <button
                    onClick={() => setActiveTab('salidas')}
                    style={tabButtonStyle(activeTab === 'salidas')}
                >
                    📤 Historial de Salidas
                </button>
            </div>
            
            {/* Pestaña: Historial de Elaboración */}
            {activeTab === 'elaboraciones' && (
                <>
                    {/* Barra de Filtros Modular */}
                    <BarraFiltrosHistorial
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />

                    {/* Tabla de Resultados */}
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Fecha</th>
                                <th style={styles.th}>Jabón Producido</th>
                                <th style={styles.th}>Unidades</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistorial.length > 0 ? (
                                filteredHistorial.map(log => (
                                    <tr key={log.id}>
                                        <td style={styles.td}>{new Date(log.fecha_elaboracion).toLocaleDateString()}</td>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                            {log.jabon_nombre || `ID: ${log.jabon_producido}`}
                                        </td>
                                        <td style={styles.td}>{log.unidades_resultantes} pzs</td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(log.tipo)}>
                                                {log.tipo === 'ESTANDAR' ? 'Estándar' : 'Experimento'}
                                            </span>
                                        </td>
                                        <td style={styles.td} title={log.notes || log.notas}>
                                            <div style={styles.notesContainer}>
                                                {log.notas || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Sin notas</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '30px' }}>
                                        No se encontraron lotes de producción con los filtros activos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}

            {/* Pestaña: Historial de Salidas */}
            {activeTab === 'salidas' && (
                <>
                    {/* Barra de Filtros de Salidas */}
                    <BarraFiltrosSalidas
                        filters={filtersSalidas}
                        onFilterChange={handleFilterSalidasChange}
                        onClear={handleClearFiltersSalidas}
                    />

                    {/* Tabla de Salidas */}
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Fecha</th>
                                <th style={styles.th}>Jabón Retirado</th>
                                <th style={styles.th}>Cantidad</th>
                                <th style={styles.th}>Motivo</th>
                                <th style={styles.th}>Notas / Justificación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSalidas.length > 0 ? (
                                filteredSalidas.map(log => (
                                    <tr key={log.id}>
                                        <td style={styles.td}>{new Date(log.fecha_salida).toLocaleDateString()}</td>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                            {log.jabon_nombre || `ID: ${log.jabon}`}
                                        </td>
                                        <td style={styles.td}>{log.cantidad_salida} pzs</td>
                                        <td style={styles.td}>
                                            <span style={styles.badgeSalida(log.motivo_salida)}>
                                                {log.motivo_display}
                                            </span>
                                        </td>
                                        <td style={styles.td} title={log.notas}>
                                            <div style={styles.notesContainer}>
                                                {log.notas || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Sin notas</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '30px' }}>
                                        No se encontraron registros de salidas con los filtros activos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

// Estilos de navegación de pestañas reutilizados del Módulo de Producción
const tabContainerStyle = {
    display: 'flex',
    borderBottom: '2px solid #eee',
    marginBottom: '25px',
    gap: '10px'
};

const tabButtonStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
    backgroundColor: 'transparent',
    color: isActive ? '#007bff' : '#555',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none'
});

export default HistorialProduccion;
