import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from './api/api';
import FormularioJabon from './components/FormularioJabon';
import { useAuth } from './context/AuthContext';
import { useResponsive } from './context/ResponsiveContext';

const Produccion = () => {
    const { role } = useAuth();
    const { isMobile } = useResponsive();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('nueva_produccion');

    // --- ESTADOS ORIGINALES (NUEVA PRODUCCIÓN) ---
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [jabones, setJabones] = useState([]);
    const [jabonSeleccionado, setJabonSeleccionado] = useState('');
    const [tipo, setTipo] = useState('ESTANDAR');
    const [unidades, setUnidades] = useState(0);
    const [notas, setNotas] = useState('');
    const [tiempoCurado, setTiempoCurado] = useState('');
    const [unidadTiempo, setUnidadTiempo] = useState('DIAS');
    const [config, setConfig] = useState(null);

    // Estados para gestión de recetas en producción
    const [recetaActiva, setRecetaActiva] = useState(null);
    const [errorReceta, setErrorReceta] = useState('');

    const [filasInsumos, setFilasInsumos] = useState([
        { insumoId: '', cantidadReal: '' }
    ]);
    const [showQuickCreateJabon, setShowQuickCreateJabon] = useState(false);

    // --- ESTADOS PARA GESTIÓN DE RECETAS OFICIALES ---
    const [recetas, setRecetas] = useState([]);
    const [showRecetaModal, setShowRecetaModal] = useState(false);
    const [selectedReceta, setSelectedReceta] = useState(null);
    const [recetaForm, setRecetaForm] = useState({
        jabon: '',
        cantidad_piezas_base: 10,
        ingredientes: [{ insumo: '', cantidad_base: '' }]
    });

    // --- ESTADOS PARA GESTIÓN DE CATEGORÍAS ---
    const [categorias, setCategorias] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [categoriaNombre, setCategoriaNombre] = useState('');

    // --- ESTADOS PARA ELIMINACIÓN DE JABÓN ---
    const [jabonAEliminar, setJabonAEliminar] = useState(null);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [errorEliminacion, setErrorEliminacion] = useState('');

    // --- CARGA INICIAL DE DATOS ---
    useEffect(() => {
        api.get('/insumos/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setInsumosDisponibles(data);
            })
            .catch(err => console.error("Error al cargar insumos:", err));

        api.get('/jabones/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setJabones(data);
            })
            .catch(err => console.error("Error al cargar jabones:", err));

        api.get('/configuracion/')
            .then(res => setConfig(res.data))
            .catch(err => console.error("Error al cargar configuración:", err));

        cargarCategorias();
        cargarRecetas();
    }, []);

    useEffect(() => {
        if (location.state && location.state.preselectedJabonId) {
            setJabonSeleccionado(location.state.preselectedJabonId.toString());
            setActiveTab('nueva_produccion');
        }
    }, [location.state]);

    // --- FUNCIONES DE CARGA AUXILIARES ---
    const cargarCategorias = () => {
        api.get('/categorias/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setCategorias(data);
            })
            .catch(err => console.error("Error al cargar categorías:", err));
    };

    const cargarRecetas = () => {
        api.get('/recetas/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setRecetas(data);
            })
            .catch(err => console.error("Error al cargar recetas:", err));
    };

    // --- LÓGICA DE DETECTAR RECETA (NUEVA PRODUCCIÓN) ---
    useEffect(() => {
        if (tipo === 'ESTANDAR' && jabonSeleccionado) {
            api.get(`/recetas/?jabon=${jabonSeleccionado}`)
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                    if (data.length > 0) {
                        setRecetaActiva(data[0]);
                        setErrorReceta('');
                    } else {
                        setRecetaActiva(null);
                        setErrorReceta('Este jabón no cuenta con una receta estándar configurada. Por favor, configúrala en la pestaña de Recetas Oficiales o utiliza el modo Experimento.');
                        setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
                    }
                })
                .catch(err => {
                    console.error("Error al cargar receta:", err);
                    setRecetaActiva(null);
                    setErrorReceta('Error al cargar la receta desde el servidor.');
                });
        } else {
            setRecetaActiva(null);
            setErrorReceta('');
        }
    }, [jabonSeleccionado, tipo]);

    // Controlar reset de filas al cambiar a Experimento
    useEffect(() => {
        if (tipo === 'EXPERIMENTO') {
            setRecetaActiva(null);
            setErrorReceta('');
            setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
        }
    }, [tipo]);

    // Escalar ingredientes automáticamente al cambiar las unidades en Receta Estándar
    useEffect(() => {
        if (tipo === 'ESTANDAR' && recetaActiva) {
            const piezasBase = recetaActiva.cantidad_piezas_base || 10;
            const factor = parseFloat(unidades) / piezasBase;
            
            if (!isNaN(factor) && factor > 0) {
                const nuevasFilas = recetaActiva.ingredientes.map(ing => ({
                    insumoId: ing.insumo.toString(),
                    cantidadReal: (ing.cantidad_base * factor).toFixed(2),
                    lote: ''
                }));
                setFilasInsumos(nuevasFilas);
            } else {
                const nuevasFilas = recetaActiva.ingredientes.map(ing => ({
                    insumoId: ing.insumo.toString(),
                    cantidadReal: '0.00',
                    lote: ''
                }));
                setFilasInsumos(nuevasFilas);
            }
        }
    }, [unidades, recetaActiva, tipo]);

    const handleJabonAgregado = (nuevoJabon) => {
        setJabones(prev => [...prev, nuevoJabon]);
        setJabonSeleccionado(nuevoJabon.id.toString());
        setShowQuickCreateJabon(false);
    };

    // --- ACCIONES DE PRODUCCIÓN (FORMULARIO ORIGINAL) ---
    const agregarFila = () => {
        setFilasInsumos([...filasInsumos, { insumoId: '', cantidadReal: '' }]);
    };

    const manejarCambioFila = (index, campo, valor) => {
        const nuevasFilas = [...filasInsumos];
        nuevasFilas[index][campo] = valor;
        setFilasInsumos(nuevasFilas);
    };

    const eliminarFila = (index) => {
        if (filasInsumos.length > 1) {
            const nuevasFilas = filasInsumos.filter((_, i) => i !== index);
            setFilasInsumos(nuevasFilas);
        }
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();

        if (tipo === 'ESTANDAR' && !recetaActiva) {
            alert("No se puede registrar producción estándar sin una receta configurada.");
            return;
        }

        const datosParaEnviar = {
            tipo: tipo,
            jabon_producido: parseInt(jabonSeleccionado),
            unidades_resultantes: parseInt(unidades),
            notas: notas,
            tiempo_curado: tiempoCurado === '' ? 0 : parseInt(tiempoCurado),
            unidad_tiempo: unidadTiempo,
            detalles_insumos: filasInsumos.map(f => ({
                insumo: parseInt(f.insumoId),
                cantidad_utilizada: parseFloat(f.cantidadReal),
                lote_origen: "N/A",
                costo_unitario_momento: 0.0
            }))
        };

        if (datosParaEnviar.detalles_insumos.some(d => !d.insumo || isNaN(d.cantidad_utilizada))) {
            alert("Por favor, completa todos los campos de insumos correctamente.");
            return;
        }

        try {
            await api.post('/produccion/', datosParaEnviar);
            alert("Producción registrada y stock actualizado con éxito");
            setUnidades(0);
            setNotas('');
            setTiempoCurado('');
            if (tipo === 'EXPERIMENTO') {
                setFilasInsumos([{ insumoId: '', cantidadReal: '', lote: '' }]);
            }
        } catch (err) {
            console.error("Error del servidor:", err.response?.data);
            const mensajeError = err.response?.data?.non_field_errors ||
                                 err.response?.data?.detalles_insumos ||
                                 "Error desconocido al procesar la producción.";
            alert("Error: " + JSON.stringify(mensajeError));
        }
    };

    // --- ACCIONES DE CATEGORÍAS ---
    const agregarCategoria = async (e) => {
        e.preventDefault();
        if (!categoriaNombre.trim()) return;
        try {
            await api.post('/categorias/', { nombre: categoriaNombre });
            alert("Categoría creada con éxito.");
            setCategoriaNombre('');
            setShowAddModal(false);
            cargarCategorias();
        } catch (err) {
            console.error("Error al crear categoría:", err);
            alert("Error al crear la categoría. Asegúrate de que no exista ya.");
        }
    };

    const abrirEditar = (cat) => {
        setSelectedCategoria(cat);
        setCategoriaNombre(cat.nombre);
        setShowEditModal(true);
    };

    const guardarEdicionCategoria = async (e) => {
        e.preventDefault();
        if (!categoriaNombre.trim() || !selectedCategoria) return;
        try {
            await api.put(`/categorias/${selectedCategoria.id}/`, { nombre: categoriaNombre });
            alert("Categoría actualizada con éxito.");
            setCategoriaNombre('');
            setSelectedCategoria(null);
            setShowEditModal(false);
            cargarCategorias();
        } catch (err) {
            console.error("Error al actualizar categoría:", err);
            alert("Error al editar la categoría.");
        }
    };

    const eliminarCategoria = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombre}"?`)) return;
        try {
            await api.delete(`/categorias/${id}/`);
            alert("Categoría eliminada con éxito.");
            cargarCategorias();
        } catch (err) {
            console.error("Error al eliminar categoría:", err);
            if (err.response?.status === 400 || err.response?.status === 409 || err.response?.data) {
                alert("No se puede eliminar la categoría porque está en uso en uno o más jabones registrados.");
            } else {
                alert("Error al eliminar la categoría.");
            }
        }
    };

    // --- ACCIONES DE ELIMINACIÓN DE JABÓN (EXCLUSIVO ADMIN) ---
    const iniciarEliminarJabon = (jabon) => {
        setJabonAEliminar(jabon);
        setErrorEliminacion('');
        setShowConfirmDeleteModal(true);
    };

    const cancelarEliminacion = () => {
        setJabonAEliminar(null);
        setErrorEliminacion('');
        setShowConfirmDeleteModal(false);
    };

    const ejecutarEliminarJabon = async () => {
        if (!jabonAEliminar) return;
        try {
            await api.delete(`/jabones/${jabonAEliminar.id}/`);
            
            // Actualizar lista local de jabones
            setJabones(prev => prev.filter(j => j.id !== jabonAEliminar.id));
            
            // Si el jabón seleccionado en el formulario de producción es el que borramos, limpiarlo
            if (jabonSeleccionado === jabonAEliminar.id.toString()) {
                setJabonSeleccionado('');
            }
            
            // Recargar recetas ya que la receta del jabón se elimina en cascada
            cargarRecetas();
            
            // Cerrar el modal y limpiar estados
            setJabonAEliminar(null);
            setShowConfirmDeleteModal(false);
            setErrorEliminacion('');
            alert("El jabón y todos sus registros asociados fueron eliminados con éxito.");
        } catch (err) {
            console.error("Error al eliminar jabón:", err);
            const msg = err.response?.data?.detail || err.response?.data?.error || "Error al intentar eliminar el jabón desde el servidor.";
            setErrorEliminacion(msg);
        }
    };

    // --- ACCIONES DE RECETAS ---
    const abrirNuevaReceta = () => {
        setSelectedReceta(null);
        setRecetaForm({
            jabon: '',
            cantidad_piezas_base: 10,
            ingredientes: [{ insumo: '', cantidad_base: '' }]
        });
        setShowRecetaModal(true);
    };

    const abrirEditarReceta = (receta) => {
        setSelectedReceta(receta);
        setRecetaForm({
            jabon: receta.jabon,
            cantidad_piezas_base: receta.cantidad_piezas_base,
            ingredientes: receta.ingredientes.map(i => ({
                insumo: i.insumo,
                cantidad_base: i.cantidad_base
            }))
        });
        setShowRecetaModal(true);
    };

    const agregarFilaIngrediente = () => {
        setRecetaForm({
            ...recetaForm,
            ingredientes: [...recetaForm.ingredientes, { insumo: '', cantidad_base: '' }]
        });
    };

    const eliminarFilaIngrediente = (index) => {
        if (recetaForm.ingredientes.length > 1) {
            setRecetaForm({
                ...recetaForm,
                ingredientes: recetaForm.ingredientes.filter((_, i) => i !== index)
            });
        }
    };

    const manejarCambioIngrediente = (index, campo, valor) => {
        const nuevosIngredientes = [...recetaForm.ingredientes];
        nuevosIngredientes[index][campo] = valor;
        setRecetaForm({ ...recetaForm, ingredientes: nuevosIngredientes });
    };

    const guardarReceta = async (e) => {
        e.preventDefault();
        
        if (!recetaForm.jabon) {
            alert("Por favor, selecciona un jabón.");
            return;
        }
        if (recetaForm.ingredientes.some(i => !i.insumo || !i.cantidad_base || parseFloat(i.cantidad_base) <= 0)) {
            alert("Por favor, completa todos los ingredientes con cantidades válidas mayores a 0.");
            return;
        }

        const datosParaEnviar = {
            jabon: parseInt(recetaForm.jabon),
            cantidad_piezas_base: parseInt(recetaForm.cantidad_piezas_base),
            ingredientes: recetaForm.ingredientes.map(i => ({
                insumo: parseInt(i.insumo),
                cantidad_base: parseFloat(i.cantidad_base)
            }))
        };

        try {
            if (selectedReceta) {
                await api.put(`/recetas/${selectedReceta.id}/`, datosParaEnviar);
                alert("Receta actualizada con éxito.");
            } else {
                await api.post('/recetas/', datosParaEnviar);
                alert("Receta creada con éxito.");
            }
            setShowRecetaModal(false);
            cargarRecetas();
        } catch (err) {
            console.error("Error al guardar receta:", err);
            const msg = err.response?.data?.jabon || err.response?.data?.non_field_errors || "Error al guardar la receta.";
            alert("Error: " + JSON.stringify(msg));
        }
    };

    const eliminarReceta = async (id, jabonNombre) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar la receta para "${jabonNombre}"?`)) return;
        try {
            await api.delete(`/recetas/${id}/`);
            alert("Receta eliminada con éxito.");
            cargarRecetas();
        } catch (err) {
            console.error("Error al eliminar receta:", err);
            alert("Error al eliminar la receta.");
        }
    };

    const jabonesDisponiblesParaReceta = jabones.filter(j => {
        if (selectedReceta && selectedReceta.jabon === j.id) return true;
        return !recetas.some(r => r.jabon === j.id);
    });

    const unitSuffix = config ? config.unidad_peso : 'g';

    return (
        <div style={{ ...panelContainerStyle, padding: isMobile ? '10px' : '20px' }}>
            {/* Cabecera del Panel */}
            <div style={headerStyle}>
                <h2>Módulo de Producción</h2>
                <p style={{ margin: 0, color: '#666' }}>Registra nuevas elaboraciones, gestiona las recetas estándar oficiales y define las líneas de categorías.</p>
            </div>

            {/* Pestañas Superiores Horizontales */}
            <div style={{ 
                ...tabContainerStyle, 
                overflowX: isMobile ? 'auto' : 'visible', 
                whiteSpace: 'nowrap', 
                WebkitOverflowScrolling: 'touch',
                paddingBottom: isMobile ? '8px' : '0',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                <button
                    onClick={() => setActiveTab('nueva_produccion')}
                    style={tabButtonStyle(activeTab === 'nueva_produccion')}
                >
                    🧪 Nueva Producción
                </button>
                {role === 'ADMIN' && (
                    <>
                        <button
                            onClick={() => setActiveTab('recetas_oficiales')}
                            style={tabButtonStyle(activeTab === 'recetas_oficiales')}
                        >
                            📝 Recetas Oficiales
                        </button>
                        <button
                            onClick={() => setActiveTab('categorias')}
                            style={tabButtonStyle(activeTab === 'categorias')}
                        >
                            🏷️ Categorías
                        </button>
                        <button
                            onClick={() => setActiveTab('catalogo_jabones')}
                            style={tabButtonStyle(activeTab === 'catalogo_jabones')}
                        >
                            🧼 Catálogo de Jabones
                        </button>
                    </>
                )}
            </div>

            {/* CONTENIDO DE PESTAÑAS */}
            
            {/* PESTAÑA 1: NUEVA PRODUCCIÓN (Formulario Original) */}
            {activeTab === 'nueva_produccion' && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={sectionTitleStyle}>Registrar Nueva Producción</h3>
                    <form onSubmit={manejarEnvio}>

                        {/* Seleccionar Jabon */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Producto a Elaborar (Jabón):</label>
                            <select
                                value={jabonSeleccionado}
                                onChange={e => setJabonSeleccionado(e.target.value)}
                                style={{ ...inputStyle, width: '100%', margin: 0 }}
                                required
                            >
                                <option value="">Seleccione un jabón...</option>
                                {jabones.map(j => (
                                    <option key={j.id} value={j.id}>{j.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Seleccionar Tipo de Proceso */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo de Producción:</label>
                            <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                                <option value="ESTANDAR">Receta Estándar (Automático)</option>
                                <option value="EXPERIMENTO">Experimento / Nuevo (Libre)</option>
                            </select>
                        </div>

                        {/* Mensaje de Error / Bloqueo en Receta Estándar */}
                        {errorReceta && (
                            <div style={errorBannerStyle}>
                                ⚠️ {errorReceta}
                            </div>
                        )}

                        {/* Sección de Insumos */}
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginTop: '25px', color: '#555' }}>
                            Insumos consumidos {tipo === 'ESTANDAR' && '🔒 (Bloqueado por Receta)'}
                        </h3>
                        
                        {isMobile ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                                {filasInsumos.map((fila, index) => (
                                    <div key={index} style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', fontSize: '14px', color: '#4b5563' }}>Insumo #{index + 1}</span>
                                            {tipo === 'EXPERIMENTO' && filasInsumos.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarFila(index)}
                                                    style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                                >
                                                    ✕ Quitar
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Insumo</label>
                                            <select
                                                value={fila.insumoId}
                                                onChange={e => manejarCambioFila(index, 'insumoId', e.target.value)}
                                                style={{ 
                                                    ...inputStyle, 
                                                    width: '100%', 
                                                    backgroundColor: tipo === 'ESTANDAR' ? '#f3f4f6' : 'white',
                                                    cursor: tipo === 'ESTANDAR' ? 'not-allowed' : 'default'
                                                }}
                                                disabled={tipo === 'ESTANDAR'}
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {insumosDisponibles.map(ins => (
                                                    <option key={ins.id} value={ins.id}>
                                                        {ins.nombre} ({ins.cantidad_gramos}{unitSuffix} disp.)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Cantidad ({unitSuffix})</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0.00"
                                                value={fila.cantidadReal}
                                                onChange={e => manejarCambioFila(index, 'cantidadReal', e.target.value)}
                                                style={{ 
                                                    ...inputStyle, 
                                                    width: '100%', 
                                                    backgroundColor: tipo === 'ESTANDAR' ? '#f3f4f6' : 'white',
                                                    cursor: tipo === 'ESTANDAR' ? 'not-allowed' : 'text'
                                                }}
                                                disabled={tipo === 'ESTANDAR'}
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', fontSize: '14px' }}>
                                        <th style={{ padding: '8px 0' }}>Insumo</th>
                                        <th style={{ padding: '8px 0' }}>Cantidad ({unitSuffix})</th>
                                        {tipo === 'EXPERIMENTO' && <th style={{ padding: '8px 0', textAlign: 'center' }}>Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filasInsumos.map((fila, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '6px 0' }}>
                                                <select
                                                    value={fila.insumoId}
                                                    onChange={e => manejarCambioFila(index, 'insumoId', e.target.value)}
                                                    style={{ 
                                                        ...inputStyle, 
                                                        width: '95%', 
                                                        backgroundColor: tipo === 'ESTANDAR' ? '#f5f5f5' : 'white',
                                                        cursor: tipo === 'ESTANDAR' ? 'not-allowed' : 'default'
                                                    }}
                                                    disabled={tipo === 'ESTANDAR'}
                                                    required
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {insumosDisponibles.map(ins => (
                                                        <option key={ins.id} value={ins.id}>
                                                            {ins.nombre} ({ins.cantidad_gramos}{unitSuffix} disp.)
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={{ padding: '6px 0' }}>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.00"
                                                    value={fila.cantidadReal}
                                                    onChange={e => manejarCambioFila(index, 'cantidadReal', e.target.value)}
                                                    style={{ 
                                                        ...inputStyle, 
                                                        width: '90%', 
                                                        backgroundColor: tipo === 'ESTANDAR' ? '#f5f5f5' : 'white',
                                                        cursor: tipo === 'ESTANDAR' ? 'not-allowed' : 'text'
                                                    }}
                                                    disabled={tipo === 'ESTANDAR'}
                                                    required
                                                />
                                            </td>
                                            {tipo === 'EXPERIMENTO' && (
                                                <td style={{ padding: '6px 0', textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarFila(index)}
                                                        style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        X
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Botón Añadir fila en Experimento */}
                        {tipo === 'EXPERIMENTO' && (
                            <button 
                                type="button" 
                                onClick={agregarFila} 
                                style={addInsumoButtonStyle}
                            >
                                + Añadir Insumo
                            </button>
                        )}

                        {/* Unidades y Notas */}
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '20px' }}>
                            <div style={{ width: isMobile ? '100%' : '220px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Unidades Resultantes:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={unidades}
                                    onChange={e => setUnidades(parseInt(e.target.value) || 0)}
                                    style={{ ...inputStyle, width: '100%' }}
                                    required
                                />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Notas de Producción:</label>
                                <textarea
                                    value={notas}
                                    placeholder="Notas, experimentos, detalles del lote..."
                                    onChange={e => setNotas(e.target.value)}
                                    style={{ ...inputStyle, width: '100%', height: '60px' }}
                                />
                            </div>
                        </div>

                        {/* Configuración de Curado */}
                        <div style={curadoSectionStyle}>
                            <label><strong>Configuración de Curado:</strong></label>
                            <div style={{ marginTop: '10px' }}>
                                <label>Días de curado (Entrada libre): </label>
                                <input
                                    type="number"
                                    value={tiempoCurado}
                                    placeholder={config ? `${config.dias_curado_defecto} (Valor por defecto)` : "28"}
                                    onChange={(e) => {
                                        setTiempoCurado(e.target.value);
                                        setUnidadTiempo('DIAS');
                                    }}
                                    style={{ ...inputStyle, maxWidth: '200px' }}
                                />
                                <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                                    Unidad: {unidadTiempo}
                                </span>
                            </div>
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setTiempoCurado(4); setUnidadTiempo('SEMANAS'); }}
                                    style={{ ...btnStyleSecundario, backgroundColor: (tiempoCurado === 4 && unidadTiempo === 'SEMANAS') ? '#007bff' : '#6c757d' }}
                                >
                                    4 Semanas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setTiempoCurado(2); setUnidadTiempo('MESES'); }}
                                    style={{ ...btnStyleSecundario, backgroundColor: (tiempoCurado === 2 && unidadTiempo === 'MESES') ? '#007bff' : '#6c757d' }}
                                >
                                    2 Meses
                                </button>
                            </div>
                        </div>

                        {/* Finalizar Producción */}
                        <button
                            type="submit"
                            style={{
                                marginTop: '30px',
                                backgroundColor: (tipo === 'ESTANDAR' && !recetaActiva) ? '#cccccc' : '#28a745',
                                color: 'white',
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                width: '100%',
                                fontSize: '16px',
                                cursor: (tipo === 'ESTANDAR' && !recetaActiva) ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            disabled={tipo === 'ESTANDAR' && !recetaActiva}
                        >
                            Finalizar
                        </button>
                    </form>
                </div>
            )}

            {/* PESTAÑA 2: RECETAS OFICIALES (ABM Recetas) */}
            {activeTab === 'recetas_oficiales' && (
                <div>
                    <div style={titleRowStyle}>
                        <h3 style={{ margin: 0 }}>Recetas de Producción Oficiales</h3>
                        <button onClick={abrirNuevaReceta} style={addButtonStyle}>
                            + Nueva Receta
                        </button>
                    </div>
                    <p style={descriptionStyle}>Configura los insumos base requeridos para fabricar lotes de jabón estándar.</p>
                    
                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                        <table border="1" cellPadding="10" style={tableStyle}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ width: '45%', textAlign: 'left' }}>Jabón</th>
                                    <th style={{ width: '25%', textAlign: 'left' }}>Lote Base</th>
                                    <th style={{ width: '30%', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recetas.length > 0 ? (
                                    recetas.map(rec => (
                                        <tr key={rec.id}>
                                            <td style={{ fontWeight: '500' }}>{rec.jabon_nombre}</td>
                                            <td>{rec.cantidad_piezas_base} piezas</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button onClick={() => abrirEditarReceta(rec)} style={editBtnStyle}>
                                                    Editar ✏️
                                                </button>
                                                <button onClick={() => eliminarReceta(rec.id, rec.jabon_nombre)} style={deleteBtnStyle}>
                                                    Eliminar 🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>No hay recetas configuradas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PESTAÑA 3: CATEGORÍAS (ABM Categorías) */}
            {activeTab === 'categorias' && (
                <div>
                    <div style={titleRowStyle}>
                        <h3 style={{ margin: 0 }}>Líneas y Categorías de Jabón</h3>
                        <button onClick={() => { setCategoriaNombre(''); setShowAddModal(true); }} style={addButtonStyle}>
                            + Nueva Categoría
                        </button>
                    </div>
                    <p style={descriptionStyle}>Administra las categorías de jabones que se asocian al dar de alta perfiles de producto.</p>
                    
                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                        <table border="1" cellPadding="10" style={tableStyle}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ width: '70%', textAlign: 'left' }}>Nombre de la Categoría</th>
                                    <th style={{ width: '30%', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.length > 0 ? (
                                    categorias.map(cat => (
                                        <tr key={cat.id}>
                                            <td style={{ fontWeight: '500' }}>{cat.nombre}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button onClick={() => abrirEditar(cat)} style={editBtnStyle}>
                                                    Editar ✏️
                                                </button>
                                                <button onClick={() => eliminarCategoria(cat.id, cat.nombre)} style={deleteBtnStyle}>
                                                    Eliminar 🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" style={{ textAlign: 'center', color: '#999' }}>No hay categorías registradas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PESTAÑA 4: CATÁLOGO DE JABONES (Exclusivo Administrador) */}
            {activeTab === 'catalogo_jabones' && role === 'ADMIN' && (
                <div>
                    <div style={titleRowStyle}>
                        <h3 style={{ margin: 0 }}>Catálogo de Jabones</h3>
                        <button onClick={() => setShowQuickCreateJabon(true)} style={addButtonStyle}>
                            + Nuevo Jabón
                        </button>
                    </div>
                    <p style={descriptionStyle}>
                        Consulte y gestione los perfiles de jabones registrados. <strong>Nota:</strong> Al eliminar un tipo de jabón, se borrarán en cascada todos sus registros de producción, recetas y salidas de stock asociadas.
                    </p>
                    
                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                        <table border="1" cellPadding="10" style={tableStyle}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ width: '40%', textAlign: 'left' }}>Nombre del Jabón</th>
                                    <th style={{ width: '25%', textAlign: 'left' }}>Categoría</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>Stock (Piezas)</th>
                                    <th style={{ width: '20%', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jabones.length > 0 ? (
                                    jabones.map(j => (
                                        <tr key={j.id}>
                                            <td style={{ fontWeight: '500' }}>{j.nombre}</td>
                                            <td>{j.categoria_nombre || 'Sin Categoría'}</td>
                                            <td style={{ textAlign: 'center' }}>{j.cantidad}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    onClick={() => iniciarEliminarJabon(j)} 
                                                    style={deleteBtnStyle}
                                                >
                                                    Eliminar 🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No hay jabones registrados en el catálogo.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- MODALES Y DIÁLOGOS EMERGENTES --- */}

            {/* Quick Create Jabón Modal */}
            {showQuickCreateJabon && (
                <FormularioJabon
                    onJabonAgregado={handleJabonAgregado}
                    alCerrar={() => setShowQuickCreateJabon(false)}
                />
            )}

            {/* Modal para Agregar Categoría */}
            {showAddModal && (
                <div style={modalBackdropStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Añadir Nueva Categoría</h3>
                        <form onSubmit={agregarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Nombre:</label>
                                <input
                                    type="text"
                                    placeholder="Ejem: Línea Exfoliante"
                                    value={categoriaNombre}
                                    onChange={e => setCategoriaNombre(e.target.value)}
                                    style={{ ...inputStyle, width: '100%' }}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div style={modalButtonsStyle}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={cancelModalBtnStyle}>
                                    Cancelar
                                </button>
                                <button type="submit" style={saveModalBtnStyle}>
                                    Crear Categoría
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Editar Categoría */}
            {showEditModal && (
                <div style={modalBackdropStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Editar Categoría</h3>
                        <form onSubmit={guardarEdicionCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Nombre de Categoría:</label>
                                <input
                                    type="text"
                                    value={categoriaNombre}
                                    onChange={e => setCategoriaNombre(e.target.value)}
                                    style={{ ...inputStyle, width: '100%' }}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div style={modalButtonsStyle}>
                                <button type="button" onClick={() => { setShowEditModal(false); setSelectedCategoria(null); }} style={cancelModalBtnStyle}>
                                    Cancelar
                                </button>
                                <button type="submit" style={saveModalBtnStyle}>
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Crear/Editar Recetas */}
            {showRecetaModal && (
                <div style={modalBackdropStyle}>
                    <div style={{ 
                        ...modalContentStyle, 
                        width: isMobile ? '92%' : '500px', 
                        maxWidth: '500px', 
                        borderLeft: '6px solid #28a745',
                        padding: isMobile ? '15px' : '30px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#28a745' }}>
                            {selectedReceta ? 'Editar Receta' : 'Nueva Receta de Producción'}
                        </h3>
                        <form onSubmit={guardarReceta} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {/* Selector de Jabon */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Jabón Destino:</label>
                                <select
                                    value={recetaForm.jabon}
                                    onChange={e => setRecetaForm({ ...recetaForm, jabon: e.target.value })}
                                    style={{ ...inputStyle, width: '100%', maxWidth: '100%' }}
                                    disabled={!!selectedReceta}
                                    required
                                >
                                    <option value="">Seleccione un jabón...</option>
                                    {jabonesDisponiblesParaReceta.map(j => (
                                        <option key={j.id} value={j.id}>{j.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tamaño de Lote Base */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Unidades Producidas en Lote Base:</label>
                                <p style={descriptionStyle}>Cantidad de piezas resultantes para la cantidad de ingredientes especificados abajo.</p>
                                <input
                                    type="number"
                                    min="1"
                                    value={recetaForm.cantidad_piezas_base}
                                    onChange={e => setRecetaForm({ ...recetaForm, cantidad_piezas_base: parseInt(e.target.value) || 10 })}
                                    style={{ ...inputStyle, width: '100%', maxWidth: '200px' }}
                                    required
                                />
                            </div>

                            {/* Detalle de Ingredientes / Insumos */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Insumos Base de la Receta:</label>
                                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '6px', marginBottom: '5px' }}>
                                    {recetaForm.ingredientes.map((ing, index) => (
                                        <div key={index} style={{ display: 'flex', gap: isMobile ? '6px' : '10px', alignItems: 'center', marginBottom: '8px' }}>
                                            
                                            {/* Selector Insumo */}
                                            <select
                                                value={ing.insumo}
                                                onChange={e => manejarCambioIngrediente(index, 'insumo', e.target.value)}
                                                style={{ 
                                                    ...inputStyle, 
                                                    padding: isMobile ? '8px 6px' : '10px', 
                                                    fontSize: isMobile ? '13px' : '14px', 
                                                    margin: 0, 
                                                    flex: 2 
                                                }}
                                                required
                                            >
                                                <option value="">Seleccionar Insumo...</option>
                                                {insumosDisponibles.map(ins => (
                                                    <option key={ins.id} value={ins.id}>{ins.nombre}</option>
                                                ))}
                                            </select>

                                            {/* Cantidad Base */}
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder={`Cant. (${unitSuffix})`}
                                                value={ing.cantidad_base}
                                                onChange={e => manejarCambioIngrediente(index, 'cantidad_base', e.target.value)}
                                                style={{ 
                                                    ...inputStyle, 
                                                    padding: isMobile ? '8px 6px' : '10px', 
                                                    fontSize: isMobile ? '13px' : '14px', 
                                                    margin: 0, 
                                                    flex: 1.2 
                                                }}
                                                required
                                            />

                                            {/* Botón borrar fila */}
                                            <button
                                                type="button"
                                                onClick={() => eliminarFilaIngrediente(index)}
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: isMobile ? '8px 10px' : '8px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarFilaIngrediente}
                                    style={{
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    + Agregar Insumo
                                </button>
                            </div>

                            <div style={modalButtonsStyle}>
                                <button type="button" onClick={() => setShowRecetaModal(false)} style={cancelModalBtnStyle}>
                                    Cancelar
                                </button>
                                <button type="submit" style={{ ...saveModalBtnStyle, backgroundColor: '#28a745' }}>
                                    Guardar Receta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Eliminar Jabón */}
            {showConfirmDeleteModal && jabonAEliminar && (
                <div style={modalBackdropStyle}>
                    <div style={{ 
                        ...modalContentStyle, 
                        width: isMobile ? '90%' : '400px', 
                        maxWidth: '400px', 
                        borderLeft: '6px solid #dc3545',
                        padding: isMobile ? '15px' : '25px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#dc3545' }}>¿Confirmar Eliminación?</h3>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0 0 15px 0', color: '#333' }}>
                            ¿Está seguro de que desea eliminar por completo el jabón <strong>{jabonAEliminar.nombre}</strong>?
                        </p>
                        
                        <div style={{ 
                            backgroundColor: '#fff3cd', 
                            color: '#856404', 
                            border: '1px solid #ffeeba', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            fontSize: '12.5px', 
                            marginBottom: '15px',
                            lineHeight: '1.4'
                        }}>
                            ⚠️ <strong>Advertencia de Borrado en Cascada:</strong> Esta acción eliminará permanentemente:
                            <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                                <li>El perfil del jabón en el catálogo.</li>
                                <li>La receta estándar asociada (si existe).</li>
                                <li>El historial de producciones de este jabón ({jabonAEliminar.cantidad_curando || 0} piezas en curado).</li>
                                <li>Todos los registros de salidas y ventas ({jabonAEliminar.cantidad_lista || 0} piezas listas en stock).</li>
                            </ul>
                        </div>

                        {errorEliminacion && (
                            <div style={{ ...errorBannerStyle, marginBottom: '15px', fontSize: '13px' }}>
                                {errorEliminacion}
                            </div>
                        )}

                        <div style={modalButtonsStyle}>
                            <button 
                                type="button" 
                                onClick={cancelarEliminacion} 
                                style={{ ...cancelModalBtnStyle, backgroundColor: '#6c757d' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={ejecutarEliminarJabon} 
                                style={deleteBtnStyle}
                            >
                                Sí, eliminar jabón
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- DISEÑO AESTHETICS Y ESTILOS DE LA INTERFAZ ---

const panelContainerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    color: '#333'
};

const headerStyle = {
    marginBottom: '20px',
    borderBottom: '2px solid #eee',
    paddingBottom: '15px'
};

const tabContainerStyle = {
    display: 'flex',
    borderBottom: '2px solid #eee',
    marginBottom: '25px',
    gap: '10px'
};

const tabButtonStyle = (isActive) => ({
    padding: '12px 20px',
    border: 'none',
    borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
    backgroundColor: 'transparent',
    color: isActive ? '#007bff' : '#555',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    flexShrink: 0,
    whiteSpace: 'nowrap'
});

const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
};

const titleRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
};

const addButtonStyle = {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 5px rgba(40, 167, 69, 0.2)'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
    border: '1px solid #eee'
};

const editBtnStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    marginRight: '8px',
    fontWeight: 'bold'
};

const deleteBtnStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
};

// Modal Estilos
const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    backdropFilter: 'blur(3px)'
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '350px',
    boxSizing: 'border-box',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    borderLeft: '6px solid #007bff',
    fontFamily: 'sans-serif'
};

const modalButtonsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '15px'
};

const saveModalBtnStyle = {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const cancelModalBtnStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#444'
};

const descriptionStyle = {
    margin: '0 0 5px 0',
    fontSize: '12.5px',
    color: '#777'
};

// Estilos del Formulario de Producción Original
const inputStyle = {
    padding: '8px',
    margin: '5px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
};


const errorBannerStyle = {
    padding: '12px',
    backgroundColor: '#fff0f0',
    borderLeft: '5px solid #ff4d4d',
    color: '#ff4d4d',
    marginBottom: '15px',
    borderRadius: '4px',
    fontSize: '13.5px',
    fontWeight: '600'
};

const addInsumoButtonStyle = {
    marginTop: '12px',
    padding: '8px 15px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '13px'
};

const curadoSectionStyle = {
    marginTop: '20px',
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
};

const btnStyleSecundario = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s'
};

export default Produccion;