// src/components/personalizedOrder/useCustomerOrders.jsx
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function useCustomerOrders() {
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
    console.log('handleImageChange:', file);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    // También limpiar el input file
    const input = document.getElementById('image-upload');
    if (input) {
      input.value = '';
    }
  };

  const submit = async () => {
    console.log('submit called', { image, modelType, description });
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
      const form = new FormData();
      form.append('image', image);
      form.append('modelType', modelType);
      form.append('description', description);

      const res = await fetch(`${API_URL}/api/custom-orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || 'Error al enviar el encargo');
      }

      const data = await res.json();
      setSuccess(true);
      // El toast se maneja desde el componente padre

    } catch (err) {
      console.error('CATCH en submit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    clearImage,
    submit
  };
}
