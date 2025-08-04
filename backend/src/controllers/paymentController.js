import fetch from 'node-fetch';

// 1) Obtener token de Wompi
export async function getToken(req, res) {
  try {
    const response = await fetch('https://id.wompi.sv/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: process.env.GRANT_TYPE,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error al obtener token:', err);
    res.status(500).json({ error: 'Error interno al obtener token' });
  }
}

// 2) Pago de prueba (sin 3DS)
export async function testPayment(req, res) {
  const { token, formData } = req.body;
  if (!token || !formData)
    return res.status(400).json({ error: 'token y formData son requeridos' });

  try {
    const response = await fetch(
      'https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error en pago de prueba:', err);
    res.status(500).json({ error: 'Error interno al procesar pago de prueba' });
  }
}

// 3) Pago real con 3DS
export async function realPayment(req, res) {
  const { token, formData } = req.body;
  if (!token || !formData)
    return res.status(400).json({ error: 'token y formData son requeridos' });

  try {
    const response = await fetch('https://api.wompi.sv/TransaccionCompra/3Ds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error en pago real:', err);
    res.status(500).json({ error: 'Error interno al procesar pago real' });
  }
}

// 4) Pago simulado (fake) para desarrollo
function generateTransactionId() {
  return 'FAKE_' + Date.now();
}
export async function fakePayment(req, res) {
  const { amount, currency = 'USD' } = req.body;
  if (!amount)
    return res.status(400).json({ error: 'amount es requerido' });

  // Simular pequeño delay
  await new Promise((r) => setTimeout(r, 1000));

  res.json({
    success: true,
    transactionId: generateTransactionId(),
    amount,
    currency,
    status: 'approved',
    message: 'Pago simulado exitoso',
    timestamp: new Date().toISOString(),
    type: 'fake',
  });
}
