import React, { useState, useEffect } from 'react';
import './DeliveryPointSelector.css';

const DeliveryPointSelector = ({ onDeliveryPointChange, selectedDeliveryPoint, error }) => {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDeliveryPoints();
  }, []);

  const fetchDeliveryPoints = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/delivery-points');
      const data = await response.json();
      
      if (data.success) {
        setDeliveryPoints(data.deliveryPoints || []);
      } else {
        setErrorMessage('Error al cargar puntos de entrega');
      }
    } catch (error) {
      console.error('Error fetching delivery points:', error);
      setErrorMessage('Error de conexión al cargar puntos de entrega');
    } finally {
      setLoading(false);
    }
  };

  const handlePointSelect = (point) => {
    onDeliveryPointChange(point._id);
  };

  if (loading) {
    return (
      <div className="delivery-point-selector">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Cargando puntos de entrega...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="delivery-point-selector">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {errorMessage}
        </div>
        <button 
          className="retry-button" 
          onClick={fetchDeliveryPoints}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (deliveryPoints.length === 0) {
    return (
      <div className="delivery-point-selector">
        <div className="no-points-message">
          <span className="info-icon">ℹ️</span>
          No hay puntos de entrega disponibles en este momento.
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-point-selector">
      <div className="delivery-point-header">
        <h3>Selecciona tu punto de entrega</h3>
        <p className="delivery-point-subtitle">
          Elige el punto de entrega más conveniente para ti
        </p>
      </div>

      <div className="delivery-points-list">
        {deliveryPoints.map((point) => (
          <div
            key={point._id}
            className={`delivery-point-card ${
              selectedDeliveryPoint === point._id ? 'selected' : ''
            }`}
            onClick={() => handlePointSelect(point)}
          >
            <div className="point-header">
              <div className="point-radio">
                <input
                  type="radio"
                  id={`point-${point._id}`}
                  name="deliveryPoint"
                  value={point._id}
                  checked={selectedDeliveryPoint === point._id}
                  onChange={() => handlePointSelect(point)}
                />
                <label htmlFor={`point-${point._id}`}></label>
              </div>
              <div className="point-info">
                <h4 className="point-name">{point.nombre}</h4>
                <p className="point-address">{point.direccion}</p>
                {point.descripcion && (
                  <p className="point-description">{point.descripcion}</p>
                )}
                {point.referencia && (
                  <p className="point-reference">
                    <strong>Referencia:</strong> {point.referencia}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="delivery-point-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="delivery-point-note">
        <p>
          <strong>Importante:</strong> Solo realizamos entregas en los puntos seleccionados. 
          No se permiten direcciones personalizadas.
        </p>
      </div>
    </div>
  );
};

export default DeliveryPointSelector;

