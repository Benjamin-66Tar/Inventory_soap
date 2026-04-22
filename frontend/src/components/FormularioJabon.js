// frontend/src/components/FormularioJabon.js
import React, { useState } from 'react';
import axios from 'axios';

const FormularioJabon = ({ onJabonAgregado, alCerrar }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad: 0,
        categoria: 'CP',
        fecha_elaboracion: new Date().toISOString().split('T')[0],
        peso_gramos: 0
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Envío de datos al ViewSet de Jabon en Django
            const res = await axios.post('http://127.0.0.1:8000/api/jabones/', formData);
            onJabonAgregado(res.data); // Actualiza la lista en el padre
            alCerrar(); // Cierra el formulario
        } catch (error) {
            console.error("Error al crear el jabón", error);
        }
    };

    return (
        <div style={modalStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h3>Registrar Nuevo Jabón</h3>
                <input type="text" placeholder="Nombre" required onChange={e => setFormData({...formData, nombre: e.target.value})} />
                <input type="number" placeholder="Cantidad" required onChange={e => setFormData({...formData, cantidad: e.target.value})} />
                <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                    <option value="CP">Cuidado Personal</option>
                    <option value="LAV">Lavandería</option>
                </select>
                <input type="date" value={formData.fecha_elaboracion} onChange={e => setFormData({...formData, fecha_elaboracion: e.target.value})} />
                <input type="number" placeholder="Peso (gramos)" required onChange={e => setFormData({...formData, peso_gramos: e.target.value})} />

                <div style={{ marginTop: '10px' }}>
                    <button type="submit" style={{ backgroundColor: '#28a745', color: 'white' }}>Guardar</button>
                    <button type="button" onClick={alCerrar}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

const modalStyle = { /* Estilos para centrar el formulario */ };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', background: 'white' };

export default FormularioJabon;