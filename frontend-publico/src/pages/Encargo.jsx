// src/pages/Encargo.jsx
import { CloudUpload } from 'lucide-react';
import useCustomerOrders from '../components/personalizedOrder/useCustomerOrders.jsx';
import Modal from '../components/ui/Modal';
import '../components/styles/Encargo.css';
import { toast } from 'react-toastify';

export default function Encargo() {

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
    submit
  } = useCustomerOrders();

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
            onChange={handleImageChange}
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
            onClick={submit}
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
    </div>
  );
}
