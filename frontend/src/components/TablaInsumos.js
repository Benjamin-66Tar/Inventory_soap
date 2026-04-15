import React from 'react';

const TablaInsumos = ({ datos = [] }) => {
    return (
        <section>
            <h2>Materia Prima (Insumos)</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>Nombre</th>
                        <th>Cantidad (g)</th>
                        <th>Proveedor</th>
                        <th>Fecha de Ingreso</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.length > 0 ? (
                        datos.map(i => (
                            <tr key={i.id}>
                                <td>{i.nombre}</td>
                                <td>{i.cantidad_gramos} g</td>
                                <td>{i.proveedor}</td>
                                <td>{i.fecha_ingreso}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>No hay insumos registrados.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    );
};

export default TablaInsumos;