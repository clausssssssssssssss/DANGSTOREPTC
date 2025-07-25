import React from "react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useCart } from "../cart/hook/useCart.jsx";
import usePaymentFakeForm from "../payment/hook/usePaymentFakeForm.jsx";
import InputField from "../payment/InputField";
import Button from "../payment/Button";


const FormPaymentFake = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { cart, clearCart } = useCart(userId);

  // calcula total y cantidad
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const {
    formData,
    datosEnviados,
    handleChange,
    handleSubmit,
    limpiarFormulario,
    handleFakePayment,
  } = usePaymentFakeForm();

  const onPay = async () => {
    const success = await handleFakePayment({ 
      userId, 
      items: cart, 
      total, 
      clientData: formData 
    });
    if (success) {
      clearCart();
      limpiarFormulario();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Fake Payment Example
          </h2>

          <div className="space-y-4">
            <InputField
              id="nombreCliente"
              name="nombreCliente"
              value={formData.nombreCliente}
              onChange={handleChange}
              type="text"
              label="Nombre del Cliente"
              placeholder="Ingresa el nombre completo"
              required
            />

            <InputField
              id="emailCliente"
              name="emailCliente"
              value={formData.emailCliente}
              onChange={handleChange}
              type="email"
              label="Email del Cliente"
              placeholder="cliente@ejemplo.com"
              required
            />

            <InputField
              id="monto"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              type="number"
              label="Monto"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />

            <Button
              onClick={handleSubmit}
              type="button"
              variant="primary"
              className="w-full"
              text="Enviar Datos"
            />
          </div>
        </div>

        {datosEnviados && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              ✅ Datos Recibidos:
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {datosEnviados.nombreCliente}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {datosEnviados.emailCliente}
              </p>
              <p>
                <span className="font-medium">Monto:</span> $
                {parseFloat(datosEnviados.monto).toFixed(2)}
              </p>
            </div>
              <Button 
          onClick={onPay} 
          text={`Pagar $${total.toFixed(2)}`} 
          variant="secondary" 
        />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPaymentFake;
