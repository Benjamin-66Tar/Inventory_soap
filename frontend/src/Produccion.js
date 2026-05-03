import React, { useState, useEffect } from 'react';
import api from './api/api';

const Produccion = () => {
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [jabones, setJabones] = useState([]);
    const [jabonSeleccionado, setJabonSeleccionado] = useState('');
    const [tipo, setTipo] = useState('ESTANDAR');
    const [unidades, setUnidades] = useState(0);
    const [notas, setNotas] = useState('');
    const [filasInsumos, setFilasInsumos] = useState([
        { insumoId: '', cantidadReal: '', lote: '' }
    ]);

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
            detalles_insumos: filasInsumos.map(f => ({
                insumo: parseInt(f.insumoId),
                cantidad_utilizada: parseFloat(f.cantidadReal),
                lote_origen: f.lote || "N/A"

            }))
        };

        // Validación simple antes de enviar
        if (datosParaEnviar.detalles_insumos.some(d => !d.insumo || isNaN(d.cantidad_utilizada))) {
            alert("Por favor, completa todos los campos de insumos correctamente.");
            return;
        }

        try {
            const res = await api.post('/produccion/', datosParaEnviar);
            alert("Producción registrada y stock actualizado con éxito");

            // Opcional: Reiniciar formulario
            setUnidades(0);
            setNotas('');
            setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);

        } catch (err) {
            console.error("Error del servidor:", err.response?.data);
            // Mostrar error específico del backend (como falta de stock)
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
                    <label>Producto a Elaborar (Jabón):</label>
                    <select
                        value={jabonSeleccionado}
                        onChange={e => setJabonSeleccionado(e.target.value)}
                        style={inputStyle}
                        required
                    >
                        <option value="">Seleccione un jabón...</option>
                        {jabones.map(j => (
                            <option key={j.id} value={j.id}>{j.nombre}</option>
                        ))}
                    </select>
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

export default Produccion;