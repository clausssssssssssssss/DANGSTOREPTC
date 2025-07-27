import React, { useState } from "react";
import '../components/styles/Contacto.css';
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";


const Contacto = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
    if (!user) {
      toast.warning("Debes iniciar sesión para enviar un mensaje");
      return;
    }
    setLoading(true);
    setStatus("Enviando...");

    try {
      const res = await fetch("http://localhost:4000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Mensaje enviado correctamente ✅");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setStatus("Ocurrió un error al enviar el mensaje ❌");
    } finally {
      setLoading(false);
    }
  };

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
          
          <div className={loading ? 'loading' : ''}>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field flex-1">
              <label>Mensaje:</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                disabled={loading}
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              onClick={handleSubmit}
              disabled={loading || !form.name || !form.email || !form.message}
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>

            {status && (
              <div className={`status-message ${status ? 'show' : ''}`}>
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;