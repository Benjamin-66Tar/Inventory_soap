import React, { useState, useEffect } from 'react';
import api from './api/api';
import TablaInsumos from './components/TablaInsumos';
import TablaJabones from './components/TablaJabones';
import FormularioInsumo from './components/FormularioInsumo';

const Inventario = () => {
    const [view, setView] = useState('jabones'); // 'jabones' o 'insumos'
    const [insumos, setInsumos] = useState([]);
    const [jabones, setJabones] = useState([]);

    // Estados para controlar la visibilidad de los modales
    const [showModalInsumo, setShowModalInsumo] = useState(false);
    const [config, setConfig] = useState(null);

    const agregarNuevoInsumo = (nuevoInsumo) => {
        setInsumos([...insumos, nuevoInsumo]);
    };

    const handleReabastecerInsumo = async (insumoId, cantidadAdicional, proveedor, fechaIngreso) => {
        const insumoObj = insumos.find(i => i.id === insumoId);
        if (!insumoObj) return;

        const nuevaCantidad = parseFloat(insumoObj.cantidad_gramos) + parseFloat(cantidadAdicional);

        try {
            await api.patch(`/insumos/${insumoId}/`, {
                cantidad_gramos: nuevaCantidad,
                proveedor: proveedor,
                fecha_ingreso: fechaIngreso
            });
            // Recargar datos
            const res = await api.get('/insumos/');
            setInsumos(res.data);
        } catch (err) {
            console.error("Error al reabastecer insumo:", err);
            alert("Error al reabastecer el insumo.");
            throw err; // Relanzar para que el modal sepa que falló
        }
    };

    const handleRegistrarSalida = async (jabonId, cantidad, motivo, notas) => {
        try {
            await api.post('/salidas/', {
                jabon: parseInt(jabonId),
                cantidad_salida: parseInt(cantidad),
                motivo_salida: motivo,
                notas: notas
            });
            // Recargar datos
            const resJabones = await api.get('/jabones/');
            setJabones(resJabones.data);
            const resInsumos = await api.get('/insumos/');
            setInsumos(resInsumos.data);
        } catch (err) {
            console.error("Error al registrar salida de jabón:", err);
            alert("Error al registrar la salida de inventario.");
            throw err;
        }
    };

    useEffect(() => {
        // Carga centralizada de datos para mantener la sincronización
        api.get('/insumos/').then(res => setInsumos(res.data));
        api.get('/jabones/').then(res => setJabones(res.data));
        api.get('/configuracion/').then(res => setConfig(res.data)).catch(err => console.error(err));
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
                    onRegistrarSalida={handleRegistrarSalida}
                    config={config}
                />
            ) : (
                <TablaInsumos 
                    datos={insumos}
                    onAbrirFormulario={() => setShowModalInsumo(true)}
                    onReabastecer={handleReabastecerInsumo}
                    config={config}
                />
            )}
            </div>

            {showModalInsumo && (
                <FormularioInsumo
                    onInsumoAgregado={agregarNuevoInsumo}
                    alCerrar={() => setShowModalInsumo(false)}
                    insumos={insumos}
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