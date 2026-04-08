import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Inventario = () => {
    const [insumos, setInsumos] = useState([]);
    const [jabones, setJabones] = useState([]);

    useEffect(() => {
        // Petición para obtener Insumos
        axios.get('http://127.0.0.1:8000/api/insumos/')
            .then(res => setInsumos(res.data))
            .catch(err => console.error("Error en insumos:", err));

        // Petición para obtener Jabones
        axios.get('http://127.0.0.1:8000/api/jabones/')
            .then(res => setJabones(res.data))
            .catch(err => console.error("Error en jabones:", err));
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Panel de Inventario - Benys</h1>

            <section>
                <h2>Materia Prima (Insumos)</h2>
                <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Nombre</th>
                            <th>Cantidad (g)</th>
                            <th>Proveedor</th>
                            <th>Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumos.map(i => (
                            <tr key={i.id}>
                                <td>{i.nombre}</td>
                                <td>{i.cantidad_gramos}</td>
                                <td>{i.proveedor}</td>
                                <td>{i.fecha_ingreso}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Productos Terminados (Jabones)</h2>
                <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e6f7ff' }}>
                            <th>Jabón</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Peso Unitario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jabones.map(j => (
                            <tr key={j.id}>
                                <td>{j.nombre}</td>
                                <td>{j.cantidad} pzs</td>
                                <td>{j.categoria === 'CP' ? 'Cuidado Personal' : 'Lavandería'}</td>
                                <td>{j.peso_gramos}g</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default Inventario;