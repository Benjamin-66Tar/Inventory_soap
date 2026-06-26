import React from 'react';
import { styles } from './HistorialStyles';

const BarraFiltrosHistorial = ({ filters, onFilterChange, onClear }) => {
    return (
        <div style={styles.filterBar}>
            {/* Buscador de Texto */}
            <div style={{ ...styles.filterGroup, flexGrow: 1, minWidth: '200px' }}>
                <span style={styles.label}>Buscar por Jabón o Notas</span>
                <input
                    type="text"
                    placeholder="Ejem: Jabón azul, venta, experimento..."
                    value={filters.searchTerm}
                    onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                    style={styles.input}
                />
            </div>

            {/* Selector de Tipo de Lote */}
            <div style={styles.filterGroup}>
                <span style={styles.label}>Tipo de Lote</span>
                <select
                    value={filters.tipo}
                    onChange={(e) => onFilterChange({ tipo: e.target.value })}
                    style={{ ...styles.input, minWidth: '150px' }}
                >
                    <option value="ALL">Todos los tipos</option>
                    <option value="ESTANDAR">Estándar</option>
                    <option value="EXPERIMENTO">Experimento</option>
                </select>
            </div>

            {/* Selector de Periodo */}
            <div style={styles.filterGroup}>
                <span style={styles.label}>Periodo de Producción</span>
                <select
                    value={filters.datePreset}
                    onChange={(e) => onFilterChange({ datePreset: e.target.value })}
                    style={{ ...styles.input, minWidth: '180px' }}
                >
                    <option value="all">Todo el historial</option>
                    <option value="today">Hoy</option>
                    <option value="last7">Últimos 7 días</option>
                    <option value="thisMonth">Este mes</option>
                    <option value="custom">Rango personalizado...</option>
                </select>
            </div>

            {/* Rango Personalizado de Fechas (Dinámico) */}
            {filters.datePreset === 'custom' && (
                <>
                    <div style={styles.filterGroup}>
                        <span style={styles.label}>Desde</span>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => onFilterChange({ startDate: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <span style={styles.label}>Hasta</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => onFilterChange({ endDate: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                </>
            )}

            {/* Botón de Limpiar */}
            <button
                type="button"
                onClick={onClear}
                style={styles.clearBtn}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc3545';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#dc3545';
                }}
            >
                Limpiar Filtros
            </button>
        </div>
    );
};

export default BarraFiltrosHistorial;
