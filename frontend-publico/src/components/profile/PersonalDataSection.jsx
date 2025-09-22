import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';

// URL del servidor local para desarrollo
const API_BASE = 'https://dangstoreptc.onrender.com/api';

const PersonalDataSection = ({ userId, showSuccess, showError }) => {
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    telephone: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos personales
  const fetchPersonalData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token inválido o expirado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPersonalData({
        name: data.name || '',
        email: data.email || '',
        telephone: data.telephone || '',
        address: data.address || ''
      });
      
    } catch (err) {
      console.error('Error fetching personal data:', err);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Guardar cambios
  const saveChanges = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personalData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token inválido o expirado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      showSuccess('Datos actualizados correctamente');
      setIsEditing(false);
      
    } catch (err) {
      console.error('Error updating personal data:', err);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchPersonalData(); // Recargar datos originales
  };

  useEffect(() => {
    fetchPersonalData();
  }, []);

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title">
          <h3>Datos Personales</h3>
        </div>
        {!isEditing ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            <Edit size={16} /> Editar
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
            <button className="save-button" onClick={saveChanges} disabled={loading}>
              <Save size={16} /> {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
      
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Nombre</label>
          <input
            className="form-input"
            value={personalData.name || ''}
            disabled={!isEditing}
            onChange={e => setPersonalData({ ...personalData, name: e.target.value })}
            placeholder="Tu nombre completo"
          />
        </div>
        
        <div className="form-field">
          <label className="form-label">Teléfono</label>
          <input
            className="form-input"
            value={personalData.telephone || ''}
            disabled={!isEditing}
            onChange={e => setPersonalData({ ...personalData, telephone: e.target.value })}
            placeholder="Tu número de teléfono"
          />
        </div>
        
        <div className="form-field full-width">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            value={personalData.email || ''}
            disabled={!isEditing}
            onChange={e => setPersonalData({ ...personalData, email: e.target.value })}
            placeholder="Tu dirección de email"
            type="email"
          />
        </div>
        
        <div className="form-field full-width">
          <label className="form-label">Dirección</label>
          <input
            className="form-input"
            value={personalData.address || ''}
            disabled={!isEditing}
            onChange={e => setPersonalData({ ...personalData, address: e.target.value })}
            placeholder="Tu dirección completa"
          />
        </div>
      </div>

      {isEditing && (
        <div className="edit-hint">
          <X size={16} />
          <span>Haz clic en "Guardar" para confirmar los cambios o "Cancelar" para descartarlos.</span>
        </div>
      )}
    </div>
  );
};

export default PersonalDataSection;
