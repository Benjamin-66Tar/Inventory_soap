import React, { useState, useEffect } from 'react';
import api from './api/api';

const Curado = () => {
    const [lotes, setLotes] = useState([]);

    useEffect(() => {
        api.get('/produccion/')
            .then(res => {
                const enEspera = res.data.filter(p => p.en_curado);
                setLotes(enEspera);
            })
            .catch(err => console.error("Error al cargar lotes:", err));
    }, []);

    // Función corregida y cerrada correctamente
    const calcularProgreso = (fechaInicio, fechaFin) => {
        if (!fechaInicio || !fechaFin) return 0;

        const inicio = new Date(fechaInicio).getTime();
        const fin = new Date(fechaFin).getTime();
        const hoy = new Date().getTime();

        const total = fin - inicio;
        const transcurrido = hoy - inicio;

        if (total <= 0) return 100;

        const porcentaje = (transcurrido / total) * 100;
        return Math.min(100, Math.max(0, porcentaje));
    }; // <-- Aquí estaba el error, faltaba cerrar esta llave

    const calcularDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        hoy.setHours(0, 0, 0, 0);
        fin.setHours(0, 0, 0, 0);

        const diferencia = fin - hoy;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    };

    const finalizar = async (id) => {
        try {
            await api.post(`/produccion/${id}/finalizar_curado/`);
            alert("¡Jabón movido al inventario!");
            setLotes(lotes.filter(l => l.id !== id));
        } catch (err) {
            const msg = err.response?.data?.detail || "Error en el servidor";
            alert("Error al finalizar curado: " + msg);
            console.error("Error completo:", err.response);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>Panel de Curado (Benys)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {lotes.map(lote => {
                    const diasRestantes = calcularDiasRestantes(lote.fecha_termino_curado);

                    // Usamos fecha_elaboracion que es el nombre real en tu base de datos
                    const progreso = calcularProgreso(lote.fecha_elaboracion, lote.fecha_termino_curado);

                    return (
                        <div key={lote.id} style={cardStyle(diasRestantes)}>
                            <h3 style={{ marginTop: 0 }}>{lote.jabon_nombre}</h3>
                            <p style={{ margin: '5px 0' }}>Tipo: <strong>{lote.tipo}</strong></p>

                            <div style={{ margin: '15px 0' }}>
                                <p style={{ fontWeight: 'bold', color: diasRestantes <= 0 ? '#28a745' : '#333' }}>
                                    {diasRestantes > 0 ? `Faltan ${diasRestantes} días` : '¡Listo para inventario!'}
                                </p>
                                <progress
                                    value={progreso}
                                    max="100"
                                    style={{ width: '100%', height: '12px' }}
                                />
                            </div>

                            <button
                                onClick={() => finalizar(lote.id)}
                                disabled={diasRestantes > 0}
                                style={btnStyle(diasRestantes > 0)}
                            >
                                {diasRestantes > 0 ? 'En proceso...' : 'Pasar a Inventario'}
                            </button>
                        </div>
                    );
                })}
            </div>
            {lotes.length === 0 && <p>No hay lotes en proceso de curado actualmente.</p>}
        </div>
    );
};

const cardStyle = (dias) => ({
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    backgroundColor: dias <= 0 ? '#f0fff4' : '#ffffff',
    transition: 'transform 0.2s',
    borderLeft: dias <= 0 ? '5px solid #28a745' : '5px solid #007bff'
});

const btnStyle = (bloqueado) => ({
    marginTop: '10px',
    backgroundColor: bloqueado ? '#e0e0e0' : '#28a745',
    color: bloqueado ? '#888' : 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    width: '100%',
    fontWeight: 'bold',
    cursor: bloqueado ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s'
});

export default Curado;