const CardResumen = ({ formData }) => {
  return (
    <div className="summary-card">
      <h3 className="summary-title">
        📋 Resumen del Pedido
      </h3>
      <div className="summary-items">
        <div className="summary-item">
          <span>Cliente:</span>
          <span className="font-medium">{formData?.nombre} {formData?.apellido}</span>
        </div>
        <div className="summary-item">
          <span>Email:</span>
          <span className="font-medium">{formData?.email}</span>
        </div>
        <div className="summary-item">
          <span>Dirección:</span>
          <span className="font-medium">{formData?.direccion}, {formData?.ciudad}</span>
        </div>
        <div className="summary-item">
          <span>Teléfono:</span>
          <span className="font-medium">{formData?.telefono}</span>
        </div>
      </div>
      <div className="summary-total">
        <span>Total a Pagar:</span>
        <span className="text-green-600">
          ${parseFloat(formData?.monto || 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CardResumen;
