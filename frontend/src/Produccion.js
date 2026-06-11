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
    const [filasInsumos, setFilasInsumos] = useState([
        { insumoId: '', cantidadReal: '', lote: '' }
    ]);
    const [showQuickCreateJabon, setShowQuickCreateJabon] = useState(false);

    // Carga de insumos disponibles desde el backend
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
    }, []);

    useEffect(() => {
        if (location.state && location.state.preselectedJabonId) {
            setJabonSeleccionado(location.state.preselectedJabonId.toString());
        }
    }, [location.state]);

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

        // Estructura de datos alineada con ProduccionSerializer
        const datosParaEnviar = {
            tipo: tipo,
            jabon_producido: parseInt(jabonSeleccionado),
            unidades_resultantes: parseInt(unidades),
            notas: notas,
            tiempo_curado: tiempoCurado === '' ? 0 : parseInt(tiempoCurado), // Convertir a null si está vacío
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
            setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
        } catch (err) {
            console.error("Error del servidor:", err.response?.data);
            const mensajeError = err.response?.data?.non_field_errors ||
                                 err.response?.data?.detalles_insumos ||
                                 "Error desconocido al procesar la producción.";
            alert("Error: " + JSON.stringify(mensajeError));
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Registrar Nueva Producción</h2>
            <form onSubmit={manejarEnvio}>

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
                                padding: '8px 15px',
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

                <div style={{ marginBottom: '15px' }}>
                    <label>Tipo de Producción:</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} style={inputStyle}>
                        <option value="ESTANDAR">Receta Estándar</option>
                        <option value="EXPERIMENTO">Experimento/Nuevo</option>
                    </select>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                            <th>Insumo</th>
                            <th>Cantidad (g)</th>
                            <th>Lote</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filasInsumos.map((fila, index) => (
                            <tr key={index}>
                                <td>
                                    <select
                                        value={fila.insumoId}
                                        onChange={e => manejarCambioFila(index, 'insumoId', e.target.value)}
                                        style={inputStyle}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {insumosDisponibles.map(ins => (
                                            <option key={ins.id} value={ins.id}>
                                                {ins.nombre} ({ins.cantidad_gramos}g disponibles)
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Ejem: 500"
                                        value={fila.cantidadReal}
                                        onChange={e => manejarCambioFila(index, 'cantidadReal', e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="Lote"
                                        value={fila.lote}
                                        onChange={e => manejarCambioFila(index, 'lote', e.target.value)}
                                        style={inputStyle}
                                    />
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => eliminarFila(index)}
                                        style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        X
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button type="button" onClick={agregarFila} style={{ margin: '15px 0', padding: '8px 15px', cursor: 'pointer' }}>
                    + Añadir Insumo
                </button>

                <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block' }}>Unidades Resultantes:</label>
                        <input
                            type="number"
                            value={unidades}
                            onChange={e => setUnidades(e.target.value)}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <label style={{ display: 'block' }}>Notas:</label>
                        <textarea
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            style={{ ...inputStyle, width: '100%', height: '60px' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <label><strong>Configuración de Curado:</strong></label>
                    <div style={{ marginTop: '10px' }}>
                        <label>Días de curado (Entrada libre): </label>
                        <input
                            type="number"
                            value={tiempoCurado}
                            placeholder="28 (Valor por defecto)"
                            onChange={(e) => {
                                setTiempoCurado(e.target.value);
                                setUnidadTiempo('DIAS'); // Esto fuerza a que el backend use la lógica de 'DIAS'[cite: 1, 3]
                            }}
                            style={inputStyle}
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

                <button
                    type="submit"
                    style={{
                        marginTop: '30px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        width: '100%',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
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