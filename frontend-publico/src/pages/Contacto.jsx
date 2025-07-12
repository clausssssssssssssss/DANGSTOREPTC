import React, { useState } from "react";
import "./Contacto.css";

const Contacto = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          
          <div className="info-section">
            <strong>Redes sociales:</strong>
            <div className="social-item">
              <span className="instagram-icon">📷</span>
              <span>DANGSTORE</span>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="contact-form">
          <h3>Envíanos un mensaje</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
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
              />
            </div>

            <div className="form-field">
              <label>Mensaje:</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows="5"
              ></textarea>
            </div>

            <button type="submit" className="submit-button">
              Enviar Mensaje
            </button>

            {status && (
              <div className={`status-message ${status ? 'show' : ''}`}>
                {status}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;