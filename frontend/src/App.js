import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [insumos, setInsumos] = useState([]);

  useEffect(() => {
    // La URL debe coincidir con la de tu urls.py (isumos con una 'n' omitida)
    axios.get('http://127.0.0.1:8000/api/isumos/')
      .then(response => {
        setInsumos(response.data);
      })
      .catch(error => console.error("Error cargando insumos:", error));
  }, []);

  return (
    <div>
      <h1>Inventario de Insumos - Benys</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Gramos</th>
            <th>Proveedor</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map(item => (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>{item.cantidad_gramos}</td>
              <td>{item.proveedor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;