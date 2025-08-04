// src/pages/Encargo.jsx
import { CloudUpload, X } from 'lucide-react';
import useCustomerOrders from '../components/personalizedOrder/useCustomerOrders.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import Modal from '../components/ui/Modal';
import '../components/styles/Encargo.css';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

export default function Encargo() {
const { user } = useAuth();
const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

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

  // Función personalizada para manejar el cambio de imagen con toast
  const handleImageChangeWithToast = (e) => {
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
    showInfo("Imagen eliminada");
  };

  return (
    <div className="encargo-container">
      <div className="encargo-header">
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
              <span className="upload-text">Haz click para subir</span>
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
            >
              <option value="">Selecciona...</option>
              <option value="llavero">Llavero</option>
              <option value="cuadro_chico">Cuadro chico</option>
              <option value="cuadro_grande">Cuadro grande</option>
            </select>
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

          <button
            onClick={handleEncargoSubmit}
            disabled={loading || !preview || !modelType}
            className="submit-button"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

      {/* Modal de éxito cuando success === true */}
      {success && (
        <Modal onClose={() => window.location.reload()}>
          <div className="modal-body">
            <h2 className="modal-title">Tu pedido ha sido enviado</h2>
            <p className="modal-text">Te caerá una notificación de tu cotización.</p>
            <button
              onClick={() => window.location.reload()}
              className="modal-button"
            >
              Aceptar
            </button>
          </div>
        </Modal>
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
    
  );
}