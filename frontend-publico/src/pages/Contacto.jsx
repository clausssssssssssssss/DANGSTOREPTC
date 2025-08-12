import React, { useEffect } from "react";
import '../components/styles/Contacto.css';
import useContactForm from '../components/contact/useContactForm';
import { useAuth } from "../hooks/useAuth";
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import { Mail, Clock, Calendar, Send } from 'lucide-react';

const Contacto = () => {
  const { user } = useAuth();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

  const {
    name, setName,
    email, setEmail,
    message, setMessage,
    loading,
    error,
    success,
    handleSubmit
  } = useContactForm();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showWarning("Debes iniciar sesión para enviar un mensaje");
      return;
    }

    await handleSubmit();
  };

  useEffect(() => {
    if (success) showSuccess("Mensaje enviado con éxito 🎉");
    if (error) showError(error);
  }, [success, error, showSuccess, showError]);

  return (
    <div className="contact-page">
      <header className="contact-header">
        <h1>DANGSTORE</h1>
        <p className="header-subtitle">Contáctanos para cualquier consulta</p>
      </header>

      <div className="contact-container">
        {/* Sección de Información */}
        <div className="contact-info-card">
          <h2 className="section-title">
            <span className="title-icon">📬</span>
            Información de Contacto
          </h2>
          
          <div className="contact-detail">
            <div className="detail-icon">
              <Mail size={18} />
            </div>
            <div>
              <p className="detail-label">Correo electrónico:</p>
              <p className="detail-value">dangstore2024@gmail.com</p>
            </div>
          </div>
          
          <div className="contact-detail">
            <div className="detail-icon">
              <Clock size={18} />
            </div>
            <div>
              <p className="detail-label">Horarios de atención:</p>
              <div className="schedule-item">
                <Calendar size={14} />
                <span>Lunes a Viernes: 9:00 - 18:00</span>
              </div>
              <div className="schedule-item">
                <Calendar size={14} />
                <span>Sábados: 10:00 - 14:00</span>
              </div>
              <div className="schedule-item">
                <Calendar size={14} />
                <span>Domingos: Cerrado</span>
              </div>
            </div>
          </div>

          <div className="social-section">
            <h3 className="social-title">Redes sociales:</h3>
            <div className="social-tag">
              <span>DANGSTORE</span>
            </div>
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div className="contact-form-card">
          <h2 className="section-title">
            <span className="title-icon">✉️</span>
            Envíanos un mensaje
          </h2>

          <form onSubmit={handleFormSubmit} className={loading ? 'loading' : ''}>
            <div className="form-group">
              <label className="input-label">Nombre</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="Ingresa tu nombre"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Ingresa tu correo"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Mensaje</label>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                disabled={loading}
                placeholder="Escribe tu mensaje aquí..."
                className="form-textarea"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="submit-button"
              disabled={loading || !name || !email || !message}
            >
              <Send size={18} className="button-icon" />
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Contacto;