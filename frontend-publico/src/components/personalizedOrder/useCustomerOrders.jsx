// src/components/personalizedOrder/usePersonalizedOrder.jsx
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function usePersonalizedOrder() {
  const [preview, setPreview]         = useState(null);
  const [image, setImage]             = useState(null);
  const [modelType, setModelType]     = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState(null);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  async function submit() {
    setLoading(true);
    setError(null);

    if (!image) {
      setError('Debes subir una imagen');
      setLoading(false);
      return;
    }
    if (!modelType) {
      setError('Selecciona un tipo de modelo');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const form  = new FormData();
      form.append('image', image);
      form.append('modelType', modelType);
      form.append('description', description);

      const res = await fetch(`${API_URL}/api/custom-orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al enviar el encargo');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    preview,
    modelType,
    description,
    loading,
    success,
    error,
    setModelType,
    setDescription,
    handleImageChange,
    submit
  };
}
