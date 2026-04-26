import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Produccion = () => {
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [tipo, setTipo] = useState('ESTANDAR');
    const [unidades, setUnidades] = useState(0);
    const [notas, setNotas] = useState('');
    const [filasInsumos, setFilasInsumos] = useState([
        { insumoId: '', cantidadReal: '', lote: '' }
    ]);

    // CARGA DE DATOS - Verificado para Django
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/insumos/')
            .then(res => {
                // Django puede enviar [ ] o { "results": [ ] }
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setInsumosDisponibles(data);
            })
            .catch(err => console.error("Error al cargar insumos:", err));
    }, []);

    const agregarFila = () => {
        setFilasInsumos([...filasInsumos, { insumoId: '', cantidadReal: '', lote: '' }]);
    };

    const manejarCambioFila = (index, campo, valor) => {
        const nuevasFilas = [...filasInsumos];
        nuevasFilas[index][campo] = valor;
        setFilasInsumos(nuevasFilas);
    };

    const guardarProduccion = async (e) => {
        e.preventDefault();

        // PAYLOAD AJUSTADO EXACTAMENTE A TU SERIALIZER
        const payload = {
            tipo: tipo,
            unidades_resultantes: parseInt(unidades) || 0,
            notas: notas,
            detalles_insumos: filasInsumos.map(f => ({
                insumo: parseInt(f.insumoId),            // ID numérico
                cantidad_utilizada: parseFloat(f.cantidadReal) || 0,
                lote_origen: f.lote || "N/A",
                costo_unitario_momento: 0               // Requerido por tu modelo
            }))
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/produccion/', payload);
            alert("¡Éxito! Producción guardada.");
            window.location.reload(); // Recarga para limpiar todo
        } catch (err) {
            console.error("Error de Django:", err.response?.data);
            alert("Error: " + JSON.stringify(err.response?.data));
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Nueva Producción</h2>
            <form onSubmit={guardarProduccion}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Tipo:</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} style={inputStyle}>
                        <option value="ESTANDAR">Estándar</option>
                        <option value="EXPERIMENTO">Experimento</option>
                    </select>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Insumo</th>
                            <th>Cantidad</th>
                            <th>Lote</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filasInsumos.map((fila, index) => (
                            <tr key={index}>
                                <td>
                                    <select
                                        value={fila.insumoId}
                                        onChange={e => manejarCambioFila(index, 'insumoId', e.target.value)}
                                        required
                                        style={inputStyle}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {/* Aquí estaba el error: asegurar que recorremos el array correcto */}
                                        {insumosDisponibles.map(i => (
                                            <option key={i.id} value={i.id}>{i.nombre}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={fila.cantidadReal}
                                        onChange={e => manejarCambioFila(index, 'cantidadReal', e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={fila.lote}
                                        onChange={e => manejarCambioFila(index, 'lote', e.target.value)}
                                        style={inputStyle}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" onClick={agregarFila} style={{ margin: '10px 0' }}>+ Añadir</button>

                <div style={{ marginTop: '20px' }}>
                    <label>Unidades Producidas:</label>
                    <input type="number" value={unidades} onChange={e => setUnidades(e.target.value)} style={inputStyle} />
                </div>

                <button type="submit" style={{ marginTop: '20px', backgroundColor: 'green', color: 'white', padding: '10px' }}>
                    Finalizar y Descontar Stock
                </button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '8px', margin: '5px', borderRadius: '4px', border: '1px solid #ccc' };

export default Produccion;