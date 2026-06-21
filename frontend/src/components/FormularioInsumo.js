// frontend/src/components/FormularioInsumo.js
import React, { useState } from 'react';
import api from '../api/api';

const FormularioInsumo = ({ onInsumoAgregado, alCerrar, insumos = [] }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad_gramos: 0,
        proveedor: '',
        fecha_ingreso: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nombreNormalizado = formData.nombre.trim().toLowerCase();
        const existe = insumos.some(ins => ins.nombre.trim().toLowerCase() === nombreNormalizado);
        if (existe) {
            alert("⚠️ Ya existe una materia prima registrada con este nombre.\n\nSi deseas agregar más stock, por favor utiliza la opción 'Reabastecer' en la tabla de materias primas.");
            return;
        }

        try {
            // Asegúrate de que la URL coincida con tu endpoint de Django para insumos
            const res = await api.post('/insumos/', formData);
            onInsumoAgregado(res.data);
            alCerrar();
        } catch (error) {
            console.error("Error al registrar el insumo", error);
            const errors = error.response?.data;
            if (errors && (errors.nombre || JSON.stringify(errors).includes("unique"))) {
                alert("⚠️ Ya existe una materia prima registrada con este nombre.\n\nSi deseas agregar más stock, por favor utiliza la opción 'Reabastecer' en la tabla de materias primas.");
            } else {
                alert("Error al guardar el insumo. Revisa la consola.");
            }
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h3>Registrar Nueva Materia Prima</h3>
                <input
                    type="text"
                    placeholder="Nombre del Insumo"
                    required
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
                <input
                    type="number"
                    placeholder="Cantidad (gramos)"
                    required
                    onChange={e => setFormData({...formData, cantidad_gramos: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="Proveedor"
                    required
                    onChange={e => setFormData({...formData, proveedor: e.target.value})}
                />
                <input
                    type="date"
                    value={formData.fecha_ingreso}
                    onChange={e => setFormData({...formData, fecha_ingreso: e.target.value})}
                />

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px', flex: 1 }}>Guardar</button>
                    <button type="button" onClick={alCerrar} style={{ padding: '10px', flex: 1 }}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const formStyle = { background: 'white', padding: '30px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px', width: '400px' };

export default FormularioInsumo;