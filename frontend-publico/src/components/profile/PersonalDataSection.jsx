import React, { useEffect, useState } from 'react';
import { Save, Edit2, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const PersonalDataSection = () => {
  const token = localStorage.getItem('token');
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://dangstoreptc.onrender.com/api/profile', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      showError('Error al cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('https://dangstoreptc.onrender.com/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      showSuccess('Perfil actualizado correctamente');
      setEditing(false);
    } catch (error) {
      console.error('Error guardando perfil:', error);
      showError('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    loadUserProfile(); // Recargar datos originales
  };

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
        {!editing ? (
          <button className="edit-button" onClick={() => setEditing(true)}>
            <Edit2 size={16} /> Editar
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
            <button className="save-button" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
      
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Nombre</label>
          <input
            className="form-input"
            value={user.name || ''}
            disabled={!editing}
            onChange={e => setUser({ ...user, name: e.target.value })}
            placeholder="Tu nombre completo"
          />
        </div>
        
        <div className="form-field">
          <label className="form-label">Teléfono</label>
          <input
            className="form-input"
            value={user.telephone || ''}
            disabled={!editing}
            onChange={e => setUser({ ...user, telephone: e.target.value })}
            placeholder="Tu número de teléfono"
          />
        </div>
        
        <div className="form-field full-width">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            value={user.email || ''}
            disabled={!editing}
            onChange={e => setUser({ ...user, email: e.target.value })}
            placeholder="Tu dirección de email"
            type="email"
          />
        </div>
      </div>

      {editing && (
        <div className="edit-hint">
          <AlertCircle size={16} />
          <span>Haz clic en "Guardar" para confirmar los cambios o "Cancelar" para descartarlos.</span>
        </div>
      )}
    </div>
  );
};

export default PersonalDataSection;
