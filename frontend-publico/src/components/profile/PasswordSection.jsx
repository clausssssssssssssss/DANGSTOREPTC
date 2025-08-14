import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordSection = () => {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [status, setStatus] = useState('');

  const handleSubmit = () => {
    fetch('/api/profile/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => setStatus(data.message))
      .catch(() => setStatus('Error al actualizar contraseña'));
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title"><h3>Cambiar Contraseña</h3></div>
      </div>
      <div className="password-fields">
        {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
          <div className="password-field" key={field}>
            <label className="form-label" htmlFor={field}>
              {field === 'currentPassword' ? 'Contraseña actual' : field === 'newPassword' ? 'Nueva contraseña' : 'Confirmar contraseña'}
            </label>
            <input
              id={field}
              type={show[field] ? 'text' : 'password'}
              className="password-input"
              placeholder={field === 'currentPassword' ? 'Contraseña actual' : field === 'newPassword' ? 'Nueva contraseña' : 'Confirmar contraseña'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
            <button
              type="button"
              className="field-toggle"
              onClick={() => setShow({ ...show, [field]: !show[field] })}
              title={show[field] ? 'Ocultar' : 'Mostrar'}
            >
              {show[field] ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        ))}
        <button className="password-submit" onClick={handleSubmit}>Actualizar</button>
        {status && <div className={`password-status ${status.includes('correcta') ? 'success' : 'error'}`}>{status}</div>}
      </div>
    </div>
  );
};

export default PasswordSection;
