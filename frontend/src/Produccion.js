import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Produccion = () => {
    // --- ESTADOS ---
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [tipo, setTipo] = useState('ESTANDAR'); // ESTANDAR o EXPERIMENTO
    const [recetaSeleccionada, setRecetaSeleccionada] = useState('');
    const [unidades, setUnidades] = useState(0);
    const [notas, setNotas] = useState('');

    // Estado para la tabla dinámica de insumos
    const [filasInsumos, setFilasInsumos] = useState([
        { insumoId: '', cantidadReal: '', lote: '' }
    ]);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        // Carga el catálogo de insumos para los selectores
        axios.get('http://127.0.0.1:8000/api/insumos/')
            .then(res => setInsumosDisponibles(res.data))
            .catch(err => console.error("Error cargando insumos:", err));
    }, []);

    // --- LÓGICA DE LA TABLA ---
    const agregarFila = () => {
        setFilasInsumos([...filasInsumos, { insumoId: '', cantidadReal: '', lote: '' }]);
    };

    const eliminarFila = (index) => {
        const nuevasFilas = filasInsumos.filter((_, i) => i !== index);
        setFilasInsumos(nuevasFilas);
    };

    const manejarCambioFila = (index, campo, valor) => {
        const nuevasFilas = [...filasInsumos];
        nuevasFilas[index][campo] = valor;
        setFilasInsumos(nuevasFilas);
    };

    // --- ENVÍO DE DATOS ---
    const guardarProduccion = async (e) => {
        e.preventDefault();

        // Validar que haya al menos un insumo
        if (filasInsumos.some(f => !f.insumoId || !f.cantidadReal)) {
            alert("Por favor, completa todos los campos de los insumos.");
            return;
        }

        const payload = {
            tipo_produccion: tipo,
            receta_id: tipo === 'ESTANDAR' ? recetaSeleccionada : null,
            detalles_insumos: filasInsumos,
            unidades_resultantes: unidades,
            notas: notas,
            fecha_registro: new Date().toISOString()
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/produccion/', payload);
            alert("¡Producción registrada con éxito! El inventario ha sido actualizado.");

            // Resetear formulario
            setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
            setUnidades(0);
            setNotas('');
        } catch (err) {
            console.error("Error al guardar la producción:", err);
            alert("Error al conectar con el servidor.");
        }
    };

    // --- DISEÑO (JSX) ---
    return (
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h1 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                Registro de Producción
            </h1>

            <form onSubmit={guardarProduccion}>
                {/* SECCIÓN 1: Configuración General */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                    <div>
                        <label><b>Tipo de Ruta:</b></label><br/>
                        <select value={tipo} onChange={e => setTipo(e.target.value)} style={inputStyle}>
                            <option value="ESTANDAR">Producción Estándar (Receta)</option>
                            <option value="EXPERIMENTO">Experimento / Prueba</option>
                        </select>
                    </div>

                    <div>
                        <label><b>Unidades Producidas:</b></label><br/>
                        <input
                            type="number"
                            value={unidades}
                            onChange={e => setUnidades(e.target.value)}
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                {/* SECCIÓN 2: Tabla Dinámica de Insumos */}
                <div style={{ marginBottom: '20px' }}>
                    <h3>Materiales Utilizados</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', backgroundColor: '#eee' }}>
                                <th style={thStyle}>Insumo</th>
                                <th style={thStyle}>Cantidad (g/ml)</th>
                                <th style={thStyle}>Lote (Opcional)</th>
                                <th style={thStyle}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filasInsumos.map((fila, index) => (
                                <tr key={index}>
                                    <td style={tdStyle}>
                                        <select
                                            value={fila.insumoId}
                                            onChange={e => manejarCambioFila(index, 'insumoId', e.target.value)}
                                            style={{...inputStyle, width: '100%'}}
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            {insumosDisponibles.map(i => (
                                                <option key={i.id} value={i.id}>{i.nombre}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="number"
                                            value={fila.cantidadReal}
                                            onChange={e => manejarCambioFila(index, 'cantidadReal', e.target.value)}
                                            style={{...inputStyle, width: '90%'}}
                                            required
                                        />
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="text"
                                            placeholder="Ej: L-402"
                                            value={fila.lote}
                                            onChange={e => manejarCambioFila(index, 'lote', e.target.value)}
                                            style={{...inputStyle, width: '90%'}}
                                        />
                                    </td>
                                    <td style={tdStyle}>
                                        {filasInsumos.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => eliminarFila(index)}
                                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                            >
                                                X
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        type="button"
                        onClick={agregarFila}
                        style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}
                    >
                        + Agregar Insumo
                    </button>
                </div>

                {/* SECCIÓN 3: Notas y Envío */}
                <div style={{ marginBottom: '20px' }}>
                    <label><b>Notas del Proceso:</b></label><br/>
                    <textarea
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        style={{ width: '100%', height: '80px', marginTop: '5px' }}
                        placeholder="Observaciones sobre la temperatura, cambios en la mezcla, etc."
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '12px 25px',
                        fontSize: '16px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Finalizar y Descontar Stock
                </button>
            </form>
        </div>
    );
};

// --- ESTILOS RÁPIDOS ---
const inputStyle = {
    padding: '8px',
    marginTop: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc'
};

const thStyle = { padding: '10px', borderBottom: '1px solid #ddd' };
const tdStyle = { padding: '10px' };

export default Produccion;