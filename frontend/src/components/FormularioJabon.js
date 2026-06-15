// frontend/src/components/FormularioJabon.js
import React, { useState } from 'react';
import api from '../api/api';

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
            const res = await api.post('/jabones/', {
                ...formData,
                cantidad: 0 // Garantiza que empiece en 0 pzs
            });
            onJabonAgregado(res.data); // Actualiza la lista en el padre
            alCerrar(); // Cierra el formulario
        } catch (error) {
            console.error("Error al crear el jabón", error);
        }
    };

    return (
        <div style={modalStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h3 style={{ margin: '0 0 15px 0', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', color: '#007bff' }}>
                    Registrar Nuevo Jabón
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={labelStyle}>Nombre del Jabón:</label>
                    <input 
                        type="text" 
                        placeholder="Ejem: Jabón de Avena y Miel" 
                        required 
                        onChange={e => setFormData({...formData, nombre: e.target.value})} 
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={labelStyle}>Categoría:</label>
                    <select 
                        value={formData.categoria} 
                        onChange={e => setFormData({...formData, categoria: e.target.value})}
                        style={inputStyle}
                    >
                        <option value="CP">Cuidado Personal</option>
                        <option value="LAV">Lavandería</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={labelStyle}>Fecha de Registro:</label>
                    <input 
                        type="date" 
                        value={formData.fecha_elaboracion} 
                        onChange={e => setFormData({...formData, fecha_elaboracion: e.target.value})} 
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={labelStyle}>Peso Unitario (gramos):</label>
                    <input 
                        type="number" 
                        placeholder="Ejem: 100" 
                        required 
                        onChange={e => setFormData({...formData, peso_gramos: parseFloat(e.target.value)})} 
                        style={inputStyle}
                    />
                </div>

                <div style={buttonContainerStyle}>
                    <button type="button" onClick={alCerrar} style={cancelButtonStyle}>
                        Cancelar
                    </button>
                    <button type="submit" style={saveButtonStyle}>
                        Guardar Perfil
                    </button>
                </div>
            </form>
        </div>
    );
};

const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    backdropFilter: 'blur(3px)',
    fontFamily: 'sans-serif'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '30px',
    background: 'white',
    borderRadius: '12px',
    width: '380px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    borderLeft: '6px solid #007bff'
};

const labelStyle = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#666'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
};

const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '15px'
};

const saveButtonStyle = {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)'
};

const cancelButtonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
};

export default FormularioJabon;