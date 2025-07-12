import React, { useEffect, useState } from 'react';
import { Save, Edit2 } from 'lucide-react';

const PersonalDataSection = () => {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
  fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => {
      console.log('Status response:', res.status);  // <--- Aquí el log
      return res.json();
    })
    .then(data => {
      console.log('Datos perfil recibidos:', data);  // <--- Aquí el log
      setUser(data);
    })
    .catch(err => console.error(err));
}, []);

  const handleSave = () => {
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(user)
    }).then(() => setEditing(false));
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title">
          <h3>Datos Personales</h3>
        </div>
        <button className="edit-button" onClick={() => setEditing(!editing)}>
          {editing ? <Save /> : <Edit2 />} {editing ? 'Guardar' : 'Editar'}
        </button>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Nombre</label>
          <input
            className="form-input"
            value={user.name || ''}
            disabled={!editing}
            onChange={e => setUser({ ...user, name: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Teléfono</label>
          <input
            className="form-input"
            value={user.telephone || ''}
            disabled={!editing}
            onChange={e => setUser({ ...user, telephone: e.target.value })}
          />
        </div>
        <div className="form-field full-width">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            value={user.email || ''}
            disabled={!editing}
            onChange={e => setUser({ ...user, email: e.target.value })}
          />
        </div>
      </div>
      {editing && (
        <div className="form-actions">
          <button className="save-button" onClick={handleSave}>
            <Save /> Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalDataSection;
