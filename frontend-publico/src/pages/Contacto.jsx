import React, { useEffect } from "react";
import '../components/styles/Contacto.css';
import useContactForm from '../components/contact/useContactForm';
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const Contacto = () => {
  const { user } = useAuth();

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
      toast.warning("Debes iniciar sesión para enviar un mensaje");
      return;
    }

    await handleSubmit(); // Llama al submit del hook
  };

  useEffect(() => {
    if (success) toast.success("Mensaje enviado con éxito 🎉");
    if (error) toast.error(error);
  }, [success, error]);

  return (
    <div className="contact-container">
      <div className="contact-card">
        {/* Lado izquierdo - Información */}
        <div className="contact-info">
          <h3>Información de Contacto</h3>
          
          <div className="info-section">
            <strong>Correo electrónico:</strong>
            <p>dangstore2024@gmail.com</p>
          </div>
          
          <div className="info-section">
            <strong>Horarios de atención:</strong>
            <p>Lunes a Viernes: 9:00 - 18:00</p>
            <p>Sábados: 10:00 - 14:00</p>
            <p>Domingos: Cerrado</p>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="contact-form">
          <h3>Envíanos un mensaje</h3>

          <form onSubmit={handleFormSubmit} className={loading ? 'loading' : ''}>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field flex-1">
              <label>Mensaje:</label>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                disabled={loading}
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="submit-button"
              disabled={loading || !name || !email || !message}
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
