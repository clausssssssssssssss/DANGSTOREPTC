// src/controllers/paymentController.js
import paypal from "@paypal/checkout-server-sdk";
import { config } from '../../config.js';

// Configuración de PayPal Sandbox
const clientId     = config.paypal.clientId;
const clientSecret = config.paypal.clientSecret;
const environment  = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client       = new paypal.core.PayPalHttpClient(environment);

const paymentController = {};

/**
 * Crea una orden en PayPal y devuelve el orderID + enlace de aprobación.
 * POST /api/payments/create
 */
paymentController.createPayment = async (req, res) => {
  const { total } = req.body;
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: "USD",
        value: total.toFixed(2)
      }
    }],
    application_context: {
      locale: "es-SV",
      shipping_preference: "NO_SHIPPING",
      return_url: `${config.appUrl}/payments/success`, // tu ruta de éxito
      cancel_url: `${config.appUrl}/payments/cancel`   // tu ruta de cancelación
    }
  });

  try {
    const order = await client.execute(request);
    // Extraer el link de aprobación
    const approveLink = order.result.links.find(l => l.rel === 'approve').href;
    return res.status(201).json({
      orderID:     order.result.id,
      approveLink
    });
  } catch (err) {
    console.error('PayPal create error:', err);
    return res.status(500).json({ message: 'Error creando orden PayPal' });
  }
};

/**
 * Captura el pago en PayPal tras la aprobación del pagador.
 * POST /api/payments/capture
 */
paymentController.capturePayment = async (req, res) => {
  const { orderID } = req.body;
  const request     = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    return res.status(200).json({ status: capture.result.status });
  } catch (err) {
    console.error('PayPal capture error:', err);
    return res.status(500).json({ message: 'Error capturando pago' });
  }
};

export default paymentController;
