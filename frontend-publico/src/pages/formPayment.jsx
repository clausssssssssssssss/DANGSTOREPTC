import React from "react";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import usePaymentForm from "../components/payment/hook/usePaymentForm";
import { formatCardNumber } from "../utils/validator";
import TitleH2 from "../components/payment/TitleH2";
import SpanText from "../components/payment/SpanText";
import CardResumen from "../components/payment/CardResumen";
import TitleH1 from "../components/payment/TitleH1";
import ProgressBar from "../components/payment/ProgressBar";

const FormPayment = () => {
  const {
    formData,
    handleChangeData,
    handleChangeTarjeta,
    formDataTarjeta,
    limpiarFormulario,
    handleFirstStep,
    handleFinishPayment,
    step,
    setStep,
  } = usePaymentForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header con indicador de progreso */}
        <div className="text-center mb-8">
          <TitleH1 text="Formulario de Pago" />

          {/* Progress Bar */}
          <ProgressBar step={step} />
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <TitleH2 label="Información del cliente" />
              <SpanText
                text="Este formulario realiza un cobro real a través de una API. Tener cuidado
        con los datos ingresados, de preferencia hacer pruebas enviando $0.01"
              />
            </div>

            <div className="space-y-6">
              <InputField
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChangeData}
                type="text"
                label="Nombres"
                placeholder="Daniel Wilfredo"
                required
              />
              <InputField
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChangeData}
                type="text"
                label="Apellidos"
                placeholder="Granados Hernández"
                required
              />

              <InputField
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChangeData}
                type="email"
                label="Correo Electrónico"
                placeholder="juan@ejemplo.com"
                required
              />
              <InputField
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChangeData}
                type="text"
                label="direccion"
                placeholder="Av. Aguilares 201"
                required
              />
              <InputField
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChangeData}
                type="text"
                label="Ciudad"
                placeholder="San Salvador"
                required
              />
              <InputField
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChangeData}
                type="text"
                label="telefono"
                placeholder="San Salvador"
                required
              />

              <InputField
                id="monto"
                name="monto"
                value={formData.monto}
                onChange={handleChangeData}
                type="number"
                label="Monto a Pagar"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />

              <div className="pt-4">
                <Button
                  onClick={handleFirstStep}
                  variant="primary"
                  className="w-full text-lg"
                  text="Continuar con el Pago →"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Resumen del pedido */}

            <CardResumen formData={formData} />

            {/* Formulario de tarjeta */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <TitleH2 label="Información de pago" />

              <div className="space-y-6">
                <p>{formDataTarjeta.numeroTarjeta}</p>
                <InputField
                  id="numeroTarjeta"
                  name="numeroTarjeta"
                  value={formatCardNumber(formDataTarjeta.numeroTarjeta)}
                  onChange={handleChangeTarjeta}
                  type="text"
                  label="Número de Tarjeta"
                  placeholder="1234 5678 9012 3456"
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <InputField
                    id="mesVencimiento"
                    name="mesVencimiento"
                    value={formDataTarjeta.mesVencimiento}
                    onChange={handleChangeTarjeta}
                    type="number"
                    label="Mes"
                    placeholder="MM"
                    min="1"
                    max="12"
                    required
                  />
                  <InputField
                    id="anioVencimiento"
                    name="anioVencimiento"
                    value={formDataTarjeta.anioVencimiento}
                    onChange={handleChangeTarjeta}
                    type="number"
                    label="Año"
                    placeholder="YYYY"
                    min={new Date().getFullYear()}
                    required
                  />
                  <InputField
                    id="cvv"
                    name="cvv"
                    value={formDataTarjeta.cvv}
                    onChange={handleChangeTarjeta}
                    type="text"
                    label="CVV"
                    placeholder="123"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="danger"
                    className="flex-1"
                    text="← Volver"
                  />
                  <Button
                    onClick={handleFinishPayment}
                    variant="secondary"
                    className="flex-1 text-lg"
                    text="💰 Procesar Pago"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              ¡Pago Exitoso!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu transacción ha sido procesada correctamente
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                Monto procesado: ${parseFloat(formData?.monto || 0).toFixed(2)}
              </p>
            </div>
            <Button
              onClick={limpiarFormulario}
              variant="primary"
              className="w-full"
              text="🔄 Nueva Transacción"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPayment;
