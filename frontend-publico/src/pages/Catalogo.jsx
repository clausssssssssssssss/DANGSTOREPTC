import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/productos'); // Ajusta la URL según tu backend
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="catalogo-container">
      <h1>Catálogo de Productos</h1>
      <div className="productos-grid">
        {productos.map((producto) => (
          <div key={producto.id} className="producto-card" onClick={() => navigate(`/producto/${producto.id}`)}>
            <img src={producto.imagen} alt={producto.nombre} className="producto-imagen" />
            <h3>{producto.nombre}</h3>
            <p>${producto.precio}</p>
            <button className="btn-ver-detalle">Ver detalle</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalogo;