import React from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.jsx";
import { useCart } from "../context/CartContext.jsx";
import usePaymentFakeForm from "../components/payment/hook/usePaymentFakeForm.jsx";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import "../components/styles/formPayment.css";


const FormPaymentFake = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const { cart, clearCart } = useCart(userId);

  // calcula total y cantidad
  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0);

  const {
    formData,
    datosEnviados,
    handleChange,
    handleSubmit,
    limpiarFormulario,
    handleFakePayment,
  } = usePaymentFakeForm();

  const onPay = async () => {
    const itemsParaOrden = cart.map(item => ({
      product: item.product?._id || item.product?.id,
      quantity: item.quantity || 1,
      price: item.product?.price || 0,
    }));

    const result = await handleFakePayment({ 
      userId, 
      items: itemsParaOrden,
      total, 
      clientData: formData 
    });

    if (result?.success) {
      clearCart();
      limpiarFormulario();
      navigate('/carrito', { replace: true, state: { paid: true, total } });
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-wrapper">
        <div className="payment-card">
          <div className="section-header">
            <h2 className="section-title">Pago Simulado</h2>
            <p className="section-subtitle">Completa los datos para generar una orden de prueba.</p>
          </div>
          <div className="form-grid">
            <InputField id="nombreCliente" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} type="text" label="Nombre del Cliente" placeholder="Ingresa el nombre completo" required />
            <InputField id="emailCliente" name="emailCliente" value={formData.emailCliente} onChange={handleChange} type="email" label="Email del Cliente" placeholder="cliente@ejemplo.com" required />
            <InputField id="monto" name="monto" value={Math.max(Number(formData.monto || 0), Number(total || 0))} onChange={handleChange} type="number" label="Monto" placeholder="0.00" min={Number(total || 0)} step="0.01" required />

            <div className="actions">
              <Button onClick={handleSubmit} type="button" variant="primary" className="btn-primary" text="Enviar Datos" />
            </div>
          </div>
        </div>

        {datosEnviados && (
          <div className="payment-card" style={{ marginTop: 16 }}>
            <div className="section-header">
              <h3 className="section-title">✅ Datos Recibidos</h3>
              <p className="section-subtitle">Revisa y confirma el pago de prueba.</p>
            </div>
            <div className="form-grid">
              <div>
                <strong>Nombre:</strong> {datosEnviados.nombreCliente}
              </div>
              <div>
                <strong>Email:</strong> {datosEnviados.emailCliente}
              </div>
              <div>
                <strong>Monto:</strong> ${Math.max(Number(datosEnviados.monto || 0), Number(total || 0)).toFixed(2)}
              </div>
              <div className="actions actions-duo">
                <Button onClick={onPay} text={`Pagar $${total.toFixed(2)}`} variant="secondary" className="btn-primary" />
                <Button onClick={limpiarFormulario} text="Editar" variant="secondary" className="btn-secondary" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPaymentFake;
