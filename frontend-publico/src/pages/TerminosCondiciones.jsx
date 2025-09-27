import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  FileText, 
  Shield, 
  Lock, 
  Users, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  CreditCard, 
  Ban, 
  RefreshCw, 
  Palette, 
  RotateCcw, 
  Copyright, 
  Camera, 
  AlertCircle, 
  EyeOff, 
  Gavel,
  Globe
} from 'lucide-react';
import logoIcon from '../assets/DANGSTORELOGOPRUEBA.PNG';
import '../components/styles/TerminosCondiciones.css';

const TerminosCondiciones = ({ onAccept, onReject, isModal = false }) => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleAccept = () => {
    if (accepted) {
      onAccept && onAccept();
      if (!isModal) {
        navigate('/auth');
      }
    }
  };

  const handleReject = () => {
    onReject && onReject();
    if (!isModal) {
      navigate('/');
    }
  };

  return (
    <div className={`terminos-container ${isModal ? 'modal-mode' : ''}`}>
      <div className="terminos-header">
        <div className="terminos-logo">
          <img src={logoIcon} alt="DANGSTORE Logo" className="header-logo" />
          <h1>Términos y Condiciones</h1>
        </div>
        <p className="terminos-subtitle">
          DANGSTORE - Llaveros de Hama Beads Personalizados
        </p>
      </div>

      <div className="terminos-content">
        <div className="terminos-section">
          <h2><Shield size={20} /> 1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar los servicios de DANGSTORE, usted acepta estar sujeto a estos 
            términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, 
            no debe utilizar nuestros servicios.
          </p>
        </div>

        <div className="terminos-section">
          <h2><Users size={20} /> 2. Alcance del Servicio</h2>
          <p>
            Vendemos <strong>CATÁLOGO</strong> y <strong>ENCARGOS PERSONALIZADOS</strong> con 
            <strong>CAPACIDAD LIMITADA</strong> (emprendimiento de TIEMPO PARCIAL).
          </p>
        </div>

        <div className="terminos-section">
          <h2><Clock size={20} /> 3. Fechas de Entrega NO Garantizadas</h2>
          <p>
            La <strong>FECHA/HORA DE ENTREGA ES ESTIMADA, NO FIJA</strong>. La administración puede 
            <strong>REPROGRAMAR</strong> por OCUPACIONES/ESTUDIOS. Siempre te avisaremos el cambio 
            con la PRIMERA FECHA DISPONIBLE.
          </p>
        </div>

        <div className="terminos-section">
          <h2><MapPin size={20} /> 4. Puntos y Zonas Predefinidas</h2>
          <p>
            La entrega es en <strong>PUNTOS DE ENTREGA PREESTABLECIDOS</strong> o 
            <strong>ZONAS DE COBERTURA</strong>. Si se requiere envío, el 
            <strong>COSTO ES A CARGO DEL CLIENTE</strong>.
          </p>
        </div>

        <div className="terminos-section">
          <h2><Ban size={20} /> 5. Sin Reembolsos (Política Estricta)</h2>
          <p>
            <strong>NO SE REALIZAN REEMBOLSOS</strong> en ningún caso. Para evitar inconvenientes, 
            el cliente ACEPTA que la FECHA DE ENTREGA PUEDE VARIAR y que habrá 
            REPROGRAMACIÓN si es necesario.
          </p>
        </div>

        <div className="terminos-section">
          <h2><RefreshCw size={20} /> 6. No-Show y Reprogramación</h2>
          <p>
            Si el cliente <strong>NO LLEGA a la cita</strong>, se REAGENDA UNA VEZ. Un segundo 
            no-show habilita <strong>CARGO POR REPROGRAMACIÓN</strong> o 
            <strong>CANCELACIÓN DEL PEDIDO SIN DEVOLUCIÓN</strong> del anticipo.
          </p>
        </div>

        <div className="terminos-section">
          <h2><Palette size={20} /> 8. Variaciones Artesanales</h2>
          <p>
            Producto <strong>HECHO A MANO</strong>: pueden existir 
            <strong>PEQUEÑAS VARIACIONES</strong> de color/tamaño. Esto NO constituye defecto.
          </p>
        </div>

        <div className="terminos-section">
          <h2><RotateCcw size={20} /> 9. Cambios y Devoluciones</h2>
          <p>
            <strong>Catálogo</strong>: CAMBIO EN 48 H (sin uso y con empaque; logística por el cliente).<br />
            <strong>Personalizados</strong>: SIN CAMBIO NI DEVOLUCIÓN, salvo DEFECTO DE FABRICACIÓN 
            reportado en 48 H → REPARACIÓN O REPOSICIÓN (si es imposible, NOTA DE CRÉDITO, no efectivo).
          </p>
        </div>

        <div className="terminos-section">
          <h2><Copyright size={20} /> 10. Propiedad Intelectual</h2>
          <p>
            El cliente <strong>DECLARA TENER DERECHOS</strong> de logos/arte enviados y 
            <strong>EXIME A DANGSTORE</strong> de reclamos de terceros. Podemos 
            <strong>FOTOGRAFIAR Y PUBLICAR</strong> el trabajo (indica "NO PUBLICAR" al confirmar si no deseas).
          </p>
        </div>

        <div className="terminos-section">
          <h2><EyeOff size={20} /> 10. Derecho a Rechazar Pedidos</h2>
          <p>
            Podemos <strong>RECHAZAR/PAUSAR</strong> pedidos por SOBRECARGA, HORARIOS NO DISPONIBLES, 
            DISEÑOS OFENSIVOS, PROBLEMAS DE PAGO o INCUMPLIMIENTOS.
          </p>
        </div>

        <div className="terminos-section">
          <h2><Lock size={20} /> 11. Privacidad</h2>
          <p>
            Usamos tus datos <strong>SOLO para PEDIDOS, COBROS Y ENTREGAS</strong>. 
            <strong>NO VENDEMOS DATOS</strong>. Ver política ampliada: [enlace].
          </p>
        </div>

        <div className="terminos-section">
          <h2><AlertTriangle size={20} /> 12. Fuerza Mayor</h2>
          <p>
            Clima, salud, cortes de servicio u otros eventos pueden <strong>AFECTAR PLAZOS</strong>. 
            Se REPROGRAMARÁ.
          </p>
        </div>

        <div className="terminos-section">
          <h2><Gavel size={20} /> 13. Ley Aplicable y Responsabilidad</h2>
          <p>
            Rige <strong>EL SALVADOR</strong>. Responsabilidad máxima: 
            <strong>HASTA EL MONTO PAGADO</strong> por el producto afectado.
          </p>
        </div>

        <div className="terminos-section">
          <h2><Users size={20} /> 14. Contacto</h2>
          <p>
            Para preguntas sobre estos términos y condiciones, puede contactarnos:
          </p>
          <ul>
            <li>Email: soportedangstore@gmail.com</li>
            <li>Instagram: @dangstore.sv</li>
            <li>Ubicación: El Salvador, Centroamérica</li>
          </ul>
        </div>
      </div>

      <div className="terminos-footer">
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

        <div className="terminos-actions">
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
            Aceptar Términos
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminosCondiciones;
