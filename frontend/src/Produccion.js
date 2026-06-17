import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from './api/api';
import FormularioJabon from './components/FormularioJabon';

const Produccion = () => {
    const location = useLocation();
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [jabones, setJabones] = useState([]);
    const [jabonSeleccionado, setJabonSeleccionado] = useState('');
    const [tipo, setTipo] = useState('ESTANDAR');
    const [unidades, setUnidades] = useState(0);
    const [notas, setNotas] = useState('');
    const [tiempoCurado, setTiempoCurado] = useState('');
    const [unidadTiempo, setUnidadTiempo] = useState('DIAS');
    const [config, setConfig] = useState(null);

    // Estados para gestión de recetas
    const [recetaActiva, setRecetaActiva] = useState(null);
    const [errorReceta, setErrorReceta] = useState('');

    const [filasInsumos, setFilasInsumos] = useState([
        { insumoId: '', cantidadReal: '', lote: '' }
    ]);
    const [showQuickCreateJabon, setShowQuickCreateJabon] = useState(false);

    // Carga de catálogos y configuración
    useEffect(() => {
        api.get('/insumos/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setInsumosDisponibles(data);
            })
            .catch(err => console.error("Error al cargar insumos:", err));

        api.get('/jabones/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setJabones(data);
            })
            .catch(err => console.error("Error al cargar jabones:", err));

        api.get('/configuracion/')
            .then(res => setConfig(res.data))
            .catch(err => console.error("Error al cargar configuración:", err));
    }, []);

    useEffect(() => {
        if (location.state && location.state.preselectedJabonId) {
            setJabonSeleccionado(location.state.preselectedJabonId.toString());
        }
    }, [location.state]);

    // Buscar receta al cambiar jabón o tipo
    useEffect(() => {
        if (tipo === 'ESTANDAR' && jabonSeleccionado) {
            api.get(`/recetas/?jabon=${jabonSeleccionado}`)
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                    if (data.length > 0) {
                        setRecetaActiva(data[0]);
                        setErrorReceta('');
                    } else {
                        setRecetaActiva(null);
                        setErrorReceta('Este jabón no cuenta con una receta estándar configurada. Por favor, configúrala en el panel de configuración o utiliza el modo Experimento.');
                        setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
                    }
                })
                .catch(err => {
                    console.error("Error al cargar receta:", err);
                    setRecetaActiva(null);
                    setErrorReceta('Error al cargar la receta desde el servidor.');
                });
        } else {
            setRecetaActiva(null);
            setErrorReceta('');
        }
    }, [jabonSeleccionado, tipo]);

    // Controlar reset de filas al cambiar a Experimento
    useEffect(() => {
        if (tipo === 'EXPERIMENTO') {
            setRecetaActiva(null);
            setErrorReceta('');
            setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
        }
    }, [tipo]);

    // Escalar ingredientes automáticamente al cambiar las unidades en Receta Estándar
    useEffect(() => {
        if (tipo === 'ESTANDAR' && recetaActiva) {
            const piezasBase = recetaActiva.cantidad_piezas_base || 10;
            const factor = parseFloat(unidades) / piezasBase;
            
            if (!isNaN(factor) && factor > 0) {
                const nuevasFilas = recetaActiva.ingredientes.map(ing => ({
                    insumoId: ing.insumo.toString(),
                    cantidadReal: (ing.cantidad_base * factor).toFixed(2),
                    lote: ''
                }));
                setFilasInsumos(nuevasFilas);
            } else {
                const nuevasFilas = recetaActiva.ingredientes.map(ing => ({
                    insumoId: ing.insumo.toString(),
                    cantidadReal: '0.00',
                    lote: ''
                }));
                setFilasInsumos(nuevasFilas);
            }
        }
    }, [unidades, recetaActiva, tipo]);

    const handleJabonAgregado = (nuevoJabon) => {
        setJabones(prev => [...prev, nuevoJabon]);
        setJabonSeleccionado(nuevoJabon.id.toString());
        setShowQuickCreateJabon(false);
    };

    const agregarFila = () => {
        setFilasInsumos([...filasInsumos, { insumoId: '', cantidadReal: '', lote: '' }]);
    };

    const manejarCambioFila = (index, campo, valor) => {
        const nuevasFilas = [...filasInsumos];
        nuevasFilas[index][campo] = valor;
        setFilasInsumos(nuevasFilas);
    };

    const eliminarFila = (index) => {
        if (filasInsumos.length > 1) {
            const nuevasFilas = filasInsumos.filter((_, i) => i !== index);
            setFilasInsumos(nuevasFilas);
        }
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();

        if (tipo === 'ESTANDAR' && !recetaActiva) {
            alert("No se puede registrar producción estándar sin una receta configurada.");
            return;
        }

        // Estructura de datos alineada con ProduccionSerializer
        const datosParaEnviar = {
            tipo: tipo,
            jabon_producido: parseInt(jabonSeleccionado),
            unidades_resultantes: parseInt(unidades),
            notas: notas,
            tiempo_curado: tiempoCurado === '' ? 0 : parseInt(tiempoCurado),
            unidad_tiempo: unidadTiempo,
            detalles_insumos: filasInsumos.map(f => ({
                insumo: parseInt(f.insumoId),
                cantidad_utilizada: parseFloat(f.cantidadReal),
                lote_origen: f.lote || "N/A",
                costo_unitario_momento: 0.0
            }))
        };

        if (datosParaEnviar.detalles_insumos.some(d => !d.insumo || isNaN(d.cantidad_utilizada))) {
            alert("Por favor, completa todos los campos de insumos correctamente.");
            return;
        }

        try {
            await api.post('/produccion/', datosParaEnviar);
            alert("Producción registrada y stock actualizado con éxito");
            setUnidades(0);
            setNotas('');
            setTiempoCurado('');
            if (tipo === 'EXPERIMENTO') {
                setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
            }
        } catch (err) {
            console.error("Error del servidor:", err.response?.data);
            const mensajeError = err.response?.data?.non_field_errors ||
                                 err.response?.data?.detalles_insumos ||
                                 "Error desconocido al procesar la producción.";
            alert("Error: " + JSON.stringify(mensajeError));
        }
    };

    const unitSuffix = config ? config.unidad_peso : 'g';

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Registrar Nueva Producción</h2>
            <form onSubmit={manejarEnvio}>

                {/* Seleccionar Jabon */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Producto a Elaborar (Jabón):</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select
                            value={jabonSeleccionado}
                            onChange={e => setJabonSeleccionado(e.target.value)}
                            style={{ ...inputStyle, flex: 1, margin: 0 }}
                            required
                        >
                            <option value="">Seleccione un jabón...</option>
                            {jabones.map(j => (
                                <option key={j.id} value={j.id}>{j.nombre}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowQuickCreateJabon(true)}
                            style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '18px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '36px',
                                width: '36px',
                                margin: 0
                            }}
                            title="Registrar nuevo perfil de Jabón"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Seleccionar Tipo de Proceso */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo de Producción:</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                        <option value="ESTANDAR">Receta Estándar (Automático)</option>
                        <option value="EXPERIMENTO">Experimento / Nuevo (Libre)</option>
                    </select>
                </div>

                {/* Mensaje de Error / Bloqueo en Receta Estándar */}
                {errorReceta && (
                    <div style={{ padding: '12px', backgroundColor: '#fff0f0', borderLeft: '5px solid #ff4d4d', color: '#ff4d4d', marginBottom: '15px', borderRadius: '4px', fontSize: '13.5px', fontWeight: '600' }}>
                        ⚠️ {errorReceta}
                    </div>
                )}

                {/* Sección de Insumos */}
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginTop: '25px', color: '#555' }}>
                    Insumos consumidos {tipo === 'ESTANDAR' && '🔒 (Bloqueado por Receta)'}
                </h3>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', fontSize: '14px' }}>
                            <th style={{ padding: '8px 0' }}>Insumo</th>
                            <th style={{ padding: '8px 0' }}>Cantidad ({unitSuffix})</th>
                            <th style={{ padding: '8px 0' }}>Lote</th>
                            {tipo === 'EXPERIMENTO' && <th style={{ padding: '8px 0', textAlign: 'center' }}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filasInsumos.map((fila, index) => (
                            <tr key={index}>
                                <td style={{ padding: '6px 0' }}>
                                    <select
                                        value={fila.insumoId}
                                        onChange={e => manejarCambioFila(index, 'insumoId', e.target.value)}
                                        style={{ 
                                            ...inputStyle, 
                                            width: '95%', 
                                            backgroundColor: tipo === 'ESTANDAR' ? '#f5f5f5' : 'white',
                                            cursor: tipo === 'ESTANDAR' ? 'not-allowed' : 'default'
                                        }}
                                        disabled={tipo === 'ESTANDAR'}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {insumosDisponibles.map(ins => (
                                            <option key={ins.id} value={ins.id}>
                                                {ins.nombre} ({ins.cantidad_gramos}{unitSuffix} disp.)
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '6px 0' }}>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0.00"
                                        value={fila.cantidadReal}
                                        onChange={e => manejarCambioFila(index, 'cantidadReal', e.target.value)}
                                        style={{ 
                                            ...inputStyle, 
                                            width: '90%', 
                                            backgroundColor: tipo === 'ESTANDAR' ? '#f5f5f5' : 'white',
                                            cursor: tipo === 'ESTANDAR' ? 'not-allowed' : 'text'
                                        }}
                                        disabled={tipo === 'ESTANDAR'}
                                        required
                                    />
                                </td>
                                <td style={{ padding: '6px 0' }}>
                                    <input
                                        type="text"
                                        placeholder="Código Lote Insumo"
                                        value={fila.lote}
                                        onChange={e => manejarCambioFila(index, 'lote', e.target.value)}
                                        style={{ ...inputStyle, width: '90%' }}
                                        required
                                    />
                                </td>
                                {tipo === 'EXPERIMENTO' && (
                                    <td style={{ padding: '6px 0', textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => eliminarFila(index)}
                                            style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            X
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Botón Añadir fila en Experimento */}
                {tipo === 'EXPERIMENTO' && (
                    <button 
                        type="button" 
                        onClick={agregarFila} 
                        style={{ 
                            marginTop: '12px', 
                            padding: '8px 15px', 
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '13px'
                        }}
                    >
                        + Añadir Insumo
                    </button>
                )}

                {/* Unidades y Notas */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                    <div style={{ width: '220px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Unidades Resultantes:</label>
                        <input
                            type="number"
                            min="1"
                            value={unidades}
                            onChange={e => setUnidades(parseInt(e.target.value) || 0)}
                            style={{ ...inputStyle, width: '100%' }}
                            required
                        />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Notas de Producción:</label>
                        <textarea
                            value={notas}
                            placeholder="Notas, experimentos, detalles del lote..."
                            onChange={e => setNotas(e.target.value)}
                            style={{ ...inputStyle, width: '100%', height: '60px' }}
                        />
                    </div>
                </div>

                {/* Configuración de Curado */}
                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <label><strong>Configuración de Curado:</strong></label>
                    <div style={{ marginTop: '10px' }}>
                        <label>Días de curado (Entrada libre): </label>
                        <input
                            type="number"
                            value={tiempoCurado}
                            placeholder={config ? `${config.dias_curado_defecto} (Valor por defecto)` : "28"}
                            onChange={(e) => {
                                setTiempoCurado(e.target.value);
                                setUnidadTiempo('DIAS');
                            }}
                            style={{ ...inputStyle, maxWidth: '200px' }}
                        />
                        <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                            Unidad: {unidadTiempo}
                        </span>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={() => { setTiempoCurado(4); setUnidadTiempo('SEMANAS'); }}
                            style={{ ...btnStyleSecundario, backgroundColor: (tiempoCurado === 4 && unidadTiempo === 'SEMANAS') ? '#007bff' : '#6c757d' }}
                        >
                            4 Semanas
                        </button>
                        <button
                            type="button"
                            onClick={() => { setTiempoCurado(2); setUnidadTiempo('MESES'); }}
                            style={{ ...btnStyleSecundario, backgroundColor: (tiempoCurado === 2 && unidadTiempo === 'MESES') ? '#007bff' : '#6c757d' }}
                        >
                            2 Meses
                        </button>
                    </div>
                </div>

                {/* Finalizar Producción */}
                <button
                    type="submit"
                    style={{
                        marginTop: '30px',
                        backgroundColor: (tipo === 'ESTANDAR' && !recetaActiva) ? '#cccccc' : '#28a745',
                        color: 'white',
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        width: '100%',
                        fontSize: '16px',
                        cursor: (tipo === 'ESTANDAR' && !recetaActiva) ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    disabled={tipo === 'ESTANDAR' && !recetaActiva}
                >
                    Finalizar Producción y Descontar Stock
                </button>
            </form>

            {showQuickCreateJabon && (
                <FormularioJabon
                    onJabonAgregado={handleJabonAgregado}
                    alCerrar={() => setShowQuickCreateJabon(false)}
                />
            )}
        </div>
    );
};

const inputStyle = {
    padding: '8px',
    margin: '5px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
};

const btnStyleSecundario = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s'
};

export default Produccion;