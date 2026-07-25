import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/api';
import { useAuth } from './context/AuthContext';
import { useResponsive } from './context/ResponsiveContext';

const Dashboard = () => {
    const { user } = useAuth();
    const { isMobile } = useResponsive();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalSoapPieces: 0,
        curingPieces: 0,
        lowStockInsumosCount: 0,
        lowStockInsumos: [],
        curingBatches: [],
        configUnit: 'g',
        threshold: 5
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatosDashboard = async () => {
            setLoading(true);
            try {
                // Cargar Configuración
                const resConfig = await api.get('/configuracion/').catch(() => ({ data: { unidad_peso: 'g', umbral_critico_stock: 5 } }));
                const unidad = resConfig.data?.unidad_peso || 'g';
                const umbral = resConfig.data?.umbral_critico_stock ?? 5;

                // Cargar Jabones
                const resJabones = await api.get('/jabones/').catch(() => ({ data: [] }));
                const jabonesData = Array.isArray(resJabones.data) ? resJabones.data : (resJabones.data.results || []);
                const totalPiezasListas = jabonesData.reduce((acc, j) => acc + (parseInt(j.cantidad) || 0), 0);

                // Cargar Insumos
                const resInsumos = await api.get('/insumos/').catch(() => ({ data: [] }));
                const insumosData = Array.isArray(resInsumos.data) ? resInsumos.data : (resInsumos.data.results || []);
                const insumosCriticos = insumosData.filter(ins => (parseFloat(ins.cantidad_gramos) || 0) <= umbral);

                // Cargar Lotes en Curado
                const resProduccion = await api.get('/produccion/').catch(() => ({ data: [] }));
                const produccionData = Array.isArray(resProduccion.data) ? resProduccion.data : (resProduccion.data.results || []);
                const enCurado = produccionData.filter(p => p.en_curado);
                const totalPiezasCurado = enCurado.reduce((acc, p) => acc + (parseInt(p.unidades_resultantes) || 0), 0);

                setStats({
                    totalSoapPieces: totalPiezasListas,
                    curingPieces: totalPiezasCurado,
                    lowStockInsumosCount: insumosCriticos.length,
                    lowStockInsumos: insumosCriticos,
                    curingBatches: enCurado,
                    configUnit: unidad,
                    threshold: umbral
                });
            } catch (err) {
                console.error("Error al cargar métricas del Dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        cargarDatosDashboard();
    }, []);

    const calcularDiasRestantes = (fechaFin) => {
        if (!fechaFin) return 0;
        const hoy = new Date();
        const fin = new Date(fechaFin);
        hoy.setHours(0, 0, 0, 0);
        fin.setHours(0, 0, 0, 0);
        const diferencia = fin - hoy;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    };

    const username = user?.first_name || user?.username || 'Colaborador';

    return (
        <div style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: isMobile ? '15px' : '25px',
            boxSizing: 'border-box',
            color: '#1f2937'
        }}>
            {/* FILA 1: Encabezado y Saludo */}
            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: isMobile ? '16px 20px' : '24px 30px',
                marginBottom: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>👋</span>
                    <div>
                        <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: '#111827', fontWeight: '700' }}>
                            ¡Hola, {username}!
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                            Bienvenido al panel principal de SoapManager. Aquí tienes el diagnóstico en tiempo real de tu fábrica.
                        </p>
                    </div>
                </div>
            </div>

            {/* FILA 2: Tarjetas de Métricas (KPIs) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '28px'
            }}>
                {/* KPI 1: Stock Disponible */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    borderLeft: '5px solid #10b981'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                            Stock Disponible
                        </span>
                        <span style={{ fontSize: '22px' }}>📦</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginTop: '10px' }}>
                        {loading ? '...' : `${stats.totalSoapPieces} pzs`}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                        Jabones listos para despacho
                    </p>
                </div>

                {/* KPI 2: En Curado */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    borderLeft: '5px solid #3b82f6'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                            En Curado
                        </span>
                        <span style={{ fontSize: '22px' }}>⏳</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginTop: '10px' }}>
                        {loading ? '...' : `${stats.curingPieces} pzs`}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>
                        {stats.curingBatches.length} lotes en maduración
                    </p>
                </div>

                {/* KPI 3: Alertas Críticas */}
                <div style={{
                    backgroundColor: stats.lowStockInsumosCount > 0 ? '#fef2f2' : '#ffffff',
                    border: '1px solid ' + (stats.lowStockInsumosCount > 0 ? '#fca5a5' : '#e5e7eb'),
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    borderLeft: '5px solid ' + (stats.lowStockInsumosCount > 0 ? '#ef4444' : '#6b7280')
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: stats.lowStockInsumosCount > 0 ? '#991b1b' : '#6b7280', textTransform: 'uppercase' }}>
                            Alertas Críticas
                        </span>
                        <span style={{ fontSize: '22px' }}>🚨</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: stats.lowStockInsumosCount > 0 ? '#dc2626' : '#111827', marginTop: '10px' }}>
                        {loading ? '...' : `${stats.lowStockInsumosCount}`}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: stats.lowStockInsumosCount > 0 ? '#dc2626' : '#6b7280', fontWeight: '500' }}>
                        {stats.lowStockInsumosCount > 0 ? 'Insumos por debajo del umbral' : 'Todos los insumos con stock suficiente'}
                    </p>
                </div>
            </div>

            {/* FILA 3: Acciones Rápidas (Ajustadas sin "Nuevo Jabón") */}
            <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span> Acciones Rápidas Operativas
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: '14px'
                }}>
                    {/* Acción 1: Nueva Producción */}
                    <button
                        onClick={() => navigate('/produccion')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: '#1e3a8a',
                            color: '#ffffff',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                            transition: 'transform 0.15s ease, backgroundColor 0.15s ease',
                            textAlign: 'left'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>🧪</span>
                        <div>
                            <div style={{ fontWeight: '700' }}>Nueva Producción</div>
                            <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: '400' }}>Registrar lote de fabricación</div>
                        </div>
                    </button>

                    {/* Acción 2: Registrar Insumo */}
                    <button
                        onClick={() => navigate('/inventario', { state: { defaultView: 'insumos' } })}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                            transition: 'transform 0.15s ease, backgroundColor 0.15s ease',
                            textAlign: 'left'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>➕</span>
                        <div>
                            <div style={{ fontWeight: '700' }}>Registrar Insumo</div>
                            <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: '400' }}>Ingresar materia prima recibida</div>
                        </div>
                    </button>

                    {/* Acción 3: Registrar Salida */}
                    <button
                        onClick={() => navigate('/inventario')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: '#4b5563',
                            color: '#ffffff',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(75, 85, 99, 0.25)',
                            transition: 'transform 0.15s ease, backgroundColor 0.15s ease',
                            textAlign: 'left'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>📤</span>
                        <div>
                            <div style={{ fontWeight: '700' }}>Registrar Salida</div>
                            <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: '400' }}>Despachar ventas o mermas</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* FILA 4: Paneles de Detalle (Alertas e Insumos) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
            }}>
                {/* Resumen Insumos Críticos */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️</span> Insumos con Stock Bajo
                    </h4>
                    {stats.lowStockInsumos.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {stats.lowStockInsumos.map(ins => (
                                <div key={ins.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 12px',
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '8px',
                                    fontSize: '13px'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#991b1b' }}>{ins.nombre}</span>
                                    <span style={{ fontWeight: '700', color: '#dc2626' }}>
                                        {ins.cantidad_gramos} {stats.configUnit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                            ✅ No hay materias primas por debajo del umbral de reabastecimiento.
                        </p>
                    )}
                </div>

                {/* Resumen Curado */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⏳</span> Lotes Próximos a Finalizar Curado
                    </h4>
                    {stats.curingBatches.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {stats.curingBatches.slice(0, 4).map(lote => {
                                const diasRestantes = calcularDiasRestantes(lote.fecha_termino_curado);
                                const esListo = diasRestantes <= 0;
                                return (
                                    <div key={lote.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        backgroundColor: esListo ? '#ecfdf5' : '#f9fafb',
                                        border: '1px solid ' + (esListo ? '#a7f3d0' : '#e5e7eb'),
                                        borderRadius: '8px',
                                        fontSize: '13px'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '600', color: '#111827' }}>{lote.jabon_nombre || `Lote #${lote.id}`}</span>
                                            <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px' }}>({lote.unidades_resultantes} pzs)</span>
                                        </div>
                                        <span style={{
                                            fontWeight: '700',
                                            color: esListo ? '#059669' : '#d97706',
                                            backgroundColor: esListo ? '#d1fae5' : '#fef3c7',
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            fontSize: '11px'
                                        }}>
                                            {esListo ? '¡Listo para venta!' : `${diasRestantes} días rest.`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                            No hay lotes en proceso de curado actualmente.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
