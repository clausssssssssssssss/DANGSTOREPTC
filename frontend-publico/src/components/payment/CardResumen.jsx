const CardResumen = ({ formData }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
      <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
        <span className="mr-2">📋</span> Resumen del Pedido
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-blue-700">Cliente:</span>
          <span className="font-medium">{formData?.nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Email:</span>
          <span className="font-medium">{formData?.email}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span className="text-blue-800">Total:</span>
          <span className="text-green-600">
            ${parseFloat(formData?.monto || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
export default CardResumen;
