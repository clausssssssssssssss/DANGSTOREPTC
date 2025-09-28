import { useState } from 'react';

// URL del servidor local para desarrollo
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

export default function useContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al enviar mensaje');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error al enviar el mensaje:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      } else if (err.message.includes('500')) {
        setError('Error del servidor. El servicio de correo no está disponible temporalmente.');
      } else {
        setError(err.message || 'Error al enviar el mensaje');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    loading,
    error,
    success,
    handleSubmit,
  };
}
