// src/pages/Encargo.jsx
import React, { useEffect } from 'react';
import { CloudUpload, X, Check, XCircle } from 'lucide-react';
import useCustomerOrders from '../components/personalizedOrder/useCustomerOrders';
import { useAuth } from '../hooks/useAuth';
import useCategories from '../hooks/useCategories';
import Modal from '../components/ui/Modal';
import '../components/styles/Encargo.css';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import logo from '../assets/DANGSTORELOGOPRUEBA.PNG';

export default function Encargo() {
const { user } = useAuth();
const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
const { categorias, loading: categoriasLoading, error: categoriasError } = useCategories();

  const {
    preview,
    modelType,
    description,
    loading,
    success,
    error,
    setModelType,
    setDescription,
    handleImageChange,
    submit,
    clearImage
  } = useCustomerOrders();

  // Efecto para manejar el éxito del encargo
  useEffect(() => {
    if (success) {
      showSuccess('¡Tu pedido ha sido enviado exitosamente! Te contactaremos pronto.');
      
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [success, showSuccess]);

  // Función personalizada para manejar el cambio de imagen con toast
  const handleImageChangeWithToast = (e) => {
    // Verificar si el usuario está registrado antes de permitir subir imágenes
    if (!user) {
      showWarning("Debes registrarte para poder hacer un encargo personalizado");
      // Limpiar el input para evitar que se procese la imagen
      e.target.value = '';
      return;
    }

    const file = e.target.files[0];
    if (file) {
      handleImageChange(e);
      showSuccess("Imagen subida exitosamente");
    }
  };

  const handleEncargoSubmit = async () => {
    if (!user) {
      showWarning("Debes iniciar sesión para enviar un encargo");
      return;
    }

    // Validaciones mínimas (opcional, ya están en el botón)
    if (!preview || !modelType) {
      showWarning("Completa todos los campos para enviar tu encargo");
      return;
    }

    // Si pasa todo, ejecuta el submit original
    await submit();
    
    // Si el submit fue exitoso, mostrar toast
    if (success) {
      showSuccess("¡Encargo enviado exitosamente! Te contactaremos pronto.");
    }
  };

  // Nueva función para eliminar la imagen
  const handleRemoveImage = () => {
    clearImage();
    showSuccess("Imagen eliminada");
  };

  return (
    <div className="encargo-container">
      <div className="encargo-header">
        <div className="logo-container">
          <img src={logo} alt="DANGSTORE Logo" className="header-logo" />
        </div>
        <h1 className="encargo-title">Encargo Personalizado</h1>
        <h2 className="encargo-subtitle">Crea tu llavero o cuadro único</h2>
        <p className="encargo-description">
          Sube tu imagen favorita y personaliza tu producto. 
          Creamos diseños únicos especialmente para ti.
        </p>
      </div>

      <div className="encargo-card">
        <div className="upload-zone">
          {preview ? (
            <div className="image-preview">
              {/* Botón para eliminar imagen */}
              <button 
                className="remove-image-btn"
                onClick={handleRemoveImage}
                type="button"
                title="Eliminar imagen"
              >
                <X size={20} />
              </button>
              
              <img src={preview} alt="Preview" className="preview-image" />
              <div className="preview-thumbnail">
                <img src={preview} alt="thumb" className="thumbnail-image" />
              </div>
            </div>
          ) : (
            <label htmlFor="image-upload" className="upload-label">
              <CloudUpload size={48} className="upload-icon" />
              <span className="upload-text">
                {!user ? 'Regístrate para subir imagen' : 'Haz click para subir'}
              </span>
              {!user && (
                <span className="upload-hint">
                  Necesitas una cuenta para hacer encargos personalizados
                </span>
              )}
            </label>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChangeWithToast}
            className="hidden-input"
          />
        </div>

        <div className="form-panel">
          <div className="field-group">
            <label className="field-label">Tipo</label>
            <select
              value={modelType}
              onChange={e => setModelType(e.target.value)}
              className="field-select"
              disabled={categoriasLoading}
            >
              <option value="">Selecciona...</option>
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria.name.toLowerCase()}>
                  {categoria.name}
                </option>
              ))}
            </select>
            {categoriasLoading && (
              <p className="loading-text">Cargando categorías...</p>
            )}
            {categoriasError && (
              <p className="error-text">Error cargando categorías: {categoriasError}</p>
            )}
          </div>
          <div className="field-group flex-1">
            <label className="field-label">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              className="field-textarea"
              placeholder="Escribe detalles adicionales..."
            />
          </div>

          {/* Mostrar mensaje de error si existe */}
          {error && <p className="error-message">{error}</p>}

          {/* Botón de enviar encargo - solo mostrar si el usuario está logueado */}
          {user ? (
            <button
              onClick={handleEncargoSubmit}
              disabled={loading || !preview || !modelType}
              className="submit-button"
            >
              {loading ? 'Enviando...' : 'Enviar Encargo'}
            </button>
          ) : (
            <button
              disabled={true}
              className="submit-button"
            >
              Regístrate para enviar
            </button>
          )}
        </div>
      </div>

      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
    
  );
}