import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TablaInsumos from './components/TablaInsumos';
import TablaJabones from './components/TablaJabones';

const Inventario = () => {
    const [view, setView] = useState('jabones'); // 'jabones' o 'insumos'
    const [insumos, setInsumos] = useState([]);
    const [jabones, setJabones] = useState([]);

    useEffect(() => {
        // Carga centralizada de datos para mantener la sincronización
        axios.get('http://127.0.0.1:8000/api/insumos/').then(res => setInsumos(res.data));
        axios.get('http://127.0.0.1:8000/api/jabones/').then(res => setJabones(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Gestión de Inventario - Benys</h1>

            {/* Selector de Tabla (Tabs) */}
            <div style={{ marginBottom: '20px', borderBottom: '2px solid #ccc' }}>
                <button
                    onClick={() => setView('jabones')}
                    style={buttonStyle(view === 'jabones')}
                >
                    🧼 Inventario de Jabones
                </button>
                <button
                    onClick={() => setView('insumos')}
                    style={buttonStyle(view === 'insumos')}
                >
                    📦 Materias Primas
                </button>
            </div>

            {/* Renderizado Condicional */}
            {view === 'jabones' ? (
                <TablaJabones datos={jabones} />
            ) : (
                <TablaInsumos datos={insumos} />
            )}
        </div>
    );
};

// Estilo básico para las pestañas
const buttonStyle = (isActive) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : 'black',
    border: 'none',
    borderBottom: isActive ? '3px solid #0056b3' : 'none',
    marginRight: '5px',
    fontWeight: 'bold'
});

export default Inventario;