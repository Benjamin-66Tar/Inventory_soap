import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Produccion = () => {
    const [insumos, setInsumos] = useState([]);
    const [consumo, setConsumo] = useState({ insumo: '', cantidad_usada: '' });

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/insumos/').then(res => setInsumos(res.data));
    }, []);

    const registrarConsumo = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/consumos/', consumo)
            .then(() => {
                alert("Consumo registrado. El inventario se actualizó automáticamente.");
                setConsumo({ insumo: '', cantidad_usada: '' });
            })
            .catch(err => console.error(err));
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Registro de Producción</h1>
            <form onSubmit={registrarConsumo} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                    <label>Insumo Utilizado:</label><br/>
                    <select
                        value={consumo.insumo}
                        onChange={e => setConsumo({...consumo, insumo: e.target.value})}
                        required
                    >
                        <option value="">Selecciona un material...</option>
                        {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label>Cantidad (gramos):</label><br/>
                    <input
                        type="number"
                        value={consumo.cantidad_usada}
                        onChange={e => setConsumo({...consumo, cantidad_usada: e.target.value})}
                        required
                    />
                </div>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 15px' }}>
                    Registrar Descuento
                </button>
            </form>
        </div>
    );
};

export default Produccion;