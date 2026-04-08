import React from 'react';
import Inventario from './Inventario'; // Importamos tu nuevo componente

function App() {
  return (
    <div className="App">
      {/* Ya no necesitamos useState ni useEffect aquí,
          porque Inventario.js ya se encarga de eso.
      */}
      <Inventario />
    </div>
  );
}

export default App;