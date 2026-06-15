import React, { useState, useEffect } from 'react';
import api from './api/api';
import TablaInsumos from './components/TablaInsumos';
import TablaJabones from './components/TablaJabones';
import FormularioJabon from './components/FormularioJabon';
import FormularioInsumo from './components/FormularioInsumo';

const Inventario = () => {
    const [view, setView] = useState('jabones'); // 'jabones' o 'insumos'
    const [insumos, setInsumos] = useState([]);
    const [jabones, setJabones] = useState([]);

    // Estados para controlar la visibilidad de los modales
    const [showModal, setShowModal] = useState(false);
    const [showModalInsumo, setShowModalInsumo] = useState(false);

    // Funciones para actualizar el estado local tras agregar un registro
    const agregarNuevoJabon = (nuevoJabon) => {
        setJabones([...jabones, nuevoJabon]);
    };

    const agregarNuevoInsumo = (nuevoInsumo) => {
        setInsumos([...insumos, nuevoInsumo]);
    };
    // En el return, podrías mostrar el modal:
    {showModal && <FormularioJabon onJabonAgregado={agregarNuevoJabon} alCerrar={() => setShowModal(false)} />}

    useEffect(() => {
        // Carga centralizada de datos para mantener la sincronización
        api.get('/insumos/').then(res => setInsumos(res.data));
        api.get('/jabones/').then(res => setJabones(res.data));
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

            {/* Renderizado Condicional de Tablas */}
            <div style={{ marginTop: '20px' }}>
            {view === 'jabones' ? (
                <TablaJabones
                    datos={jabones}
                    onAbrirFormulario={() => setShowModal(true)}
                />
            ) : (
                <TablaInsumos datos={insumos}
                    datos={insumos}
                    onAbrirFormulario={() => setShowModalInsumo(true)}
                />
            )}
            </div>

            {showModal && (
                <FormularioJabon
                    onJabonAgregado={agregarNuevoJabon}
                    alCerrar={() => setShowModal(false)}
                />
            )}

            {/* CORRECCIÓN 2: Renderizar el formulario de insumos cuando el estado sea true */}
            {showModalInsumo && (
                <FormularioInsumo
                    onInsumoAgregado={agregarNuevoInsumo}
                    alCerrar={() => setShowModalInsumo(false)}
                />
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