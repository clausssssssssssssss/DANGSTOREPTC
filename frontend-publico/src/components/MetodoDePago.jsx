import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { checkout } from '../utils/orderService';

const MetodoDePago = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { success, orderId } = await checkout();
      if (success) {
        showToast({
          title: 'Pedido realizado',
          message: `Tu pedido #${orderId} ha sido procesado con éxito`,
          type: 'success'
        });
      }
    } catch (error) {
      showToast({
        title: 'Error al procesar el pago',
        message: error.message || 'Ocurrió un error durante el checkout',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Método de Pago</h2>
      
      {/* Aquí irían los campos del formulario de pago porfi tener en cuenta que puede cambiar a futuro */}
      <div className="mb-4">
        <label className="block mb-2">Número de tarjeta</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded"
          placeholder="1234 5678 9012 3456"
        />
      </div>
      
      {/* Más campos de pago aqui (Se necesita hablar)... */}
      
      <button
        onClick={handleCheckout}
        disabled={isProcessing}
        className={`w-full py-2 px-4 rounded text-white ${isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isProcessing ? 'Procesando...' : 'Pagar ahora'}
      </button>
    </div>
  );
};

export default MetodoDePago;