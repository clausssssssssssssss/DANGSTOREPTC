import { useState } from 'react';

export default function usePersonalizedOrder() {
  const [preview, setPreview]         = useState(null);
  const [image, setImage]             = useState(null);
  const [modelType, setModelType]     = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState(null);

  /**
   * Maneja la selección de la imagen:
   * - Guarda el archivo en `image`
   * - Genera una URL de preview para mostrarla en pantalla
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /**
   * Envía el encargo al backend en formato FormData:
   * - image (file)
   * - modelType (string)
   * - description (string)
   */
  const submit = async () => {
    setLoading(true);
    setError(null);

    // Validaciones mínimas
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
      const token = localStorage.getItem('token'); // asume que guardas tu JWT aquí
      const form  = new FormData();
      form.append('image', image);
      form.append('modelType', modelType);
      form.append('description', description);

      const res = await fetch('/api/custom-orders', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    form
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al enviar el encargo');
      }

      // Éxito
      setSuccess(true);
    } catch (err) {
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
    submit
  };
}
