import React, { useState, useEffect } from 'react';
import api from './api/api';

const HistorialProduccion = () => {
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        api.get('/produccion/')
            .then(res => {
                // Manejo de paginación si existe
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setHistorial(data.sort((a, b) => new Date(b.fecha_elaboracion) - new Date(a.fecha_elaboracion)));
            })
            .catch(err => console.error("Error al cargar el historial:", err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Historial de Elaboración (Benys)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                        <th style={cellStyle}>Fecha</th>
                        <th style={cellStyle}>Jabón</th>
                        <th style={cellStyle}>Unidades</th>
                        <th style={cellStyle}>Tipo</th>
                        <th style={cellStyle}>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    {historial.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={cellStyle}>{new Date(log.fecha_elaboracion).toLocaleDateString()}</td>
                            <td style={cellStyle}>{log.jabon_nombre || `ID: ${log.jabon_producido}`}</td>
                            <td style={cellStyle}>{log.unidades_resultantes}</td>
                            <td style={cellStyle}>{log.tipo}</td>
                            <td style={cellStyle}>{log.notas}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const cellStyle = { padding: '12px', border: '1px solid #ddd' };

export default HistorialProduccion;