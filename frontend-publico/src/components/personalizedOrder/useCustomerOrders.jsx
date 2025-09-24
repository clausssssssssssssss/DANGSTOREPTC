// src/components/personalizedOrder/useCustomerOrders.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'https://dangstoreptc-production.up.railway.app/api';

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
    const input = document.getElementById('image-upload');
    if (input) {
      input.value = '';
    }
  };

  const submit = async () => {
    console.log('=== SUBMIT CALLED ===');
    console.log('Image:', image);
    console.log('ModelType:', modelType);
    console.log('Description:', description);
    
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

      // Log para ver qué se está enviando
      console.log('=== FORM DATA ===');
      for (let pair of form.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      console.log('Enviando request a:', `${API_URL}/custom-orders`);
      console.log('Token:', token ? 'Presente' : 'Ausente');

      const res = await fetch(`${API_URL}/custom-orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      if (!res.ok) {
        // Intentar obtener más información del error
        const errText = await res.text();
        console.log('Error response text:', errText);
        
        let errBody;
        try {
          errBody = JSON.parse(errText);
        } catch (e) {
          console.log('No se pudo parsear como JSON');
          errBody = { message: errText || 'Error desconocido' };
        }
        
        console.log('Error body:', errBody);
        throw new Error(errBody?.message || 'Datos de validación incorrectos');
      }

      const data = await res.json();
      console.log('Success response:', data);
      setSuccess(true);

    } catch (err) {
      console.error('=== CATCH en submit ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
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