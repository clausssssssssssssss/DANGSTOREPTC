import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import './DeliveryPointSelector.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://dangstoreptc-production.up.railway.app';

export default function DeliveryPointSelector({ selectedPointId, onSelectPoint }) {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadDeliveryPoints();
  }, []);
  
  const loadDeliveryPoints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/delivery-points`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDeliveryPoints(data.deliveryPoints || []);
      } else {
        setError('No se pudieron cargar los puntos de entrega');
      }
    } catch (err) {
      console.error('Error cargando puntos de entrega:', err);
      setError('Error al cargar puntos de entrega');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="delivery-point-loading">
        <div className="spinner"></div>
        <p>Cargando puntos de entrega...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="delivery-point-error">
        <p>{error}</p>
        <button onClick={loadDeliveryPoints} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }
  
  if (deliveryPoints.length === 0) {
    return (
      <div className="delivery-point-empty">
        <MapPin size={48} color="#ccc" />
        <p>No hay puntos de entrega disponibles actualmente</p>
      </div>
    );
  }
  
  return (
    <div className="delivery-point-selector">
      <div className="delivery-point-info">
        <MapPin size={20} color="#6c5ce7" />
        <p>Selecciona el punto de entrega donde recogerás tu pedido</p>
      </div>
      
      <div className="delivery-points-list">
        {deliveryPoints.map((point) => (
          <div
            key={point._id}
            className={`delivery-point-card ${selectedPointId === point._id ? 'selected' : ''}`}
            onClick={() => onSelectPoint(point)}
          >
            <div className="point-header">
              <div className="point-info">
                <h4 className="point-name">{point.nombre}</h4>
                <p className="point-address">{point.direccion}</p>
                {point.referencia && (
                  <p className="point-reference">
                    <MapPin size={14} />
                    Referencia: {point.referencia}
                  </p>
                )}
              </div>
              <div className="point-select">
                {selectedPointId === point._id ? (
                  <CheckCircle size={24} color="#4CAF50" />
                ) : (
                  <div className="point-radio"></div>
                )}
              </div>
            </div>
            
            {point.descripcion && (
              <p className="point-description">{point.descripcion}</p>
            )}
            
            <div className="point-schedule">
              <Clock size={14} />
              <span>{point.horarioAtencion}</span>
            </div>
            
            {point.coordenadas && (
              <a
                href={`https://www.google.com/maps?q=${point.coordenadas.lat},${point.coordenadas.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="point-map-link"
                onClick={(e) => e.stopPropagation()}
              >
                <MapPin size={14} />
                Ver en el mapa
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

