import React, { useState } from 'react';
import { X, Check, FileText, AlertCircle, Clock, MapPin, CreditCard, Ban, RefreshCw, Palette, RotateCcw, Copyright, Lock, Gavel, Users, EyeOff, AlertTriangle } from 'lucide-react';
import logoIcon from '../assets/DANGSTORELOGOPRUEBA.PNG';
import './styles/TerminosModal.css';

const TerminosModal = ({ isOpen, onClose, onAccept, onReject }) => {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      setAccepted(false); // Reset for next time
    }
  };

  const handleReject = () => {
    onReject();
    setAccepted(false); // Reset for next time
  };

  const handleClose = () => {
    onClose();
    setAccepted(false); // Reset for next time
  };

  return (
    <div className="terminos-modal-overlay" onClick={handleClose}>
      <div className="terminos-modal" onClick={e => e.stopPropagation()}>
        <div className="terminos-modal-header">
          <div className="modal-title">
            <img src={logoIcon} alt="DANGSTORE Logo" className="modal-logo" />
            <h2>Términos y Condiciones</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="terminos-modal-content">
          <div className="terms-preview">
            <div className="preview-section">
              <h3><AlertCircle size={16} /> Aceptación de los Términos</h3>
              <p>
                Al registrarte en DANGSTORE, aceptas nuestros términos y condiciones de servicio. 
                Esto incluye el uso de tus datos personales, políticas de pedidos y envíos.
              </p>
            </div>

            <div className="preview-section">
              <h3><Users size={16} /> Alcance del Servicio</h3>
              <p>
                Vendemos <strong>CATÁLOGO</strong> y <strong>ENCARGOS PERSONALIZADOS</strong> con 
                <strong>CAPACIDAD LIMITADA</strong> (emprendimiento de TIEMPO PARCIAL).
              </p>
            </div>

            <div className="preview-section">
              <h3><Clock size={16} /> Fechas de Entrega</h3>
              <p>
                La <strong>FECHA/HORA DE ENTREGA ES ESTIMADA, NO FIJA</strong>. La administración puede 
                <strong>REPROGRAMAR</strong> por OCUPACIONES/ESTUDIOS.
              </p>
            </div>

            <div className="preview-section">
              <h3><MapPin size={16} /> Puntos de Entrega</h3>
              <p>
                Entrega en <strong>PUNTOS PREESTABLECIDOS</strong> o 
                <strong>ZONAS DE COBERTURA</strong>. Si se requiere envío, el 
                <strong>COSTO ES A CARGO DEL CLIENTE</strong>.
              </p>
            </div>

            <div className="preview-section">
              <h3><Ban size={16} /> Sin Reembolsos</h3>
              <p>
                <strong>NO SE REALIZAN REEMBOLSOS</strong> en ningún caso. El cliente ACEPTA que la 
                FECHA DE ENTREGA PUEDE VARIAR y que habrá REPROGRAMACIÓN si es necesario.
              </p>
            </div>

            <div className="preview-section">
              <h3><RefreshCw size={16} /> No-Show y Reprogramación</h3>
              <p>
                Si el cliente <strong>NO LLEGA a la cita</strong>, se REAGENDA UNA VEZ. Un segundo 
                no-show habilita <strong>CARGO POR REPROGRAMACIÓN</strong> o 
                <strong>CANCELACIÓN DEL PEDIDO SIN DEVOLUCIÓN</strong> del anticipo.
              </p>
            </div>

            <div className="preview-section">
              <h3><Palette size={16} /> Variaciones Artesanales</h3>
              <p>
                Producto <strong>HECHO A MANO</strong>: pueden existir 
                <strong>PEQUEÑAS VARIACIONES</strong> de color/tamaño. Esto NO constituye defecto.
              </p>
            </div>

            <div className="preview-section">
              <h3><RotateCcw size={16} /> Cambios y Devoluciones</h3>
              <p>
                <strong>Catálogo:</strong> CAMBIO EN 48 H (sin uso y con empaque).<br />
                <strong>Personalizados:</strong> SIN CAMBIO NI DEVOLUCIÓN, salvo DEFECTO DE FABRICACIÓN 
                reportado en 48 H.
              </p>
            </div>

            <div className="preview-section">
              <h3><Copyright size={16} /> Propiedad Intelectual</h3>
              <p>
                El cliente <strong>DECLARA TENER DERECHOS</strong> de logos/arte enviados. Podemos 
                <strong>FOTOGRAFIAR Y PUBLICAR</strong> el trabajo (indica "NO PUBLICAR" si no deseas).
              </p>
            </div>

            <div className="preview-section">
              <h3><EyeOff size={16} /> Derecho a Rechazar Pedidos</h3>
              <p>
                Podemos <strong>RECHAZAR/PAUSAR</strong> pedidos por SOBRECARGA, HORARIOS NO DISPONIBLES, 
                DISEÑOS OFENSIVOS, PROBLEMAS DE PAGO o INCUMPLIMIENTOS.
              </p>
            </div>

            <div className="preview-section">
              <h3><Lock size={16} /> Privacidad</h3>
              <p>
                Usamos tus datos <strong>SOLO para PEDIDOS, COBROS Y ENTREGAS</strong>. 
                <strong>NO VENDEMOS DATOS</strong>.
              </p>
            </div>

            <div className="preview-section">
              <h3><AlertTriangle size={16} /> Fuerza Mayor</h3>
              <p>
                Clima, salud, cortes de servicio u otros eventos pueden <strong>AFECTAR PLAZOS</strong>. 
                Se REPROGRAMARÁ.
              </p>
            </div>

            <div className="preview-section">
              <h3><Gavel size={16} /> Ley Aplicable</h3>
              <p>
                Rige <strong>EL SALVADOR</strong>. Responsabilidad máxima: 
                <strong>HASTA EL MONTO PAGADO</strong> por el producto afectado.
              </p>
            </div>

            <div className="full-terms-link">
              <p>
                <strong>¿Quieres leer los términos completos?</strong>
                <br />
                Puedes consultar nuestra página completa de términos y condiciones 
                en cualquier momento desde tu perfil.
              </p>
            </div>
          </div>
        </div>

        <div className="terminos-modal-footer">
          <div className="acceptance-section">
            <label className="acceptance-checkbox">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="acceptance-text">
                He leído y acepto los términos y condiciones de DANGSTORE
              </span>
            </label>
          </div>

          <div className="modal-actions">
            <button 
              className="btn-reject"
              onClick={handleReject}
            >
              <X size={18} />
              Rechazar
            </button>
            <button 
              className={`btn-accept ${accepted ? 'enabled' : 'disabled'}`}
              onClick={handleAccept}
              disabled={!accepted}
            >
              <Check size={18} />
              Aceptar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminosModal;
