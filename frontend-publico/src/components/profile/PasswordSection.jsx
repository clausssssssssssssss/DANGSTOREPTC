import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordSection = () => {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
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
      <div className="password-header">
        <h3 className="password-title">Cambiar Contraseña</h3>
      </div>
      <div className="password-fields">
        {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
          <div className="password-field" key={field}>
            <input
              type={show ? 'text' : 'password'}
              className="password-input"
              placeholder={field}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}
        <button className="password-toggle" onClick={() => setShow(!show)}>
          {show ? <EyeOff /> : <Eye />}
        </button>
        <button className="password-submit" onClick={handleSubmit}>Actualizar</button>
        {status && <div className={`password-status ${status.includes('correcta') ? 'success' : 'error'}`}>{status}</div>}
      </div>
    </div>
  );
};

export default PasswordSection;
