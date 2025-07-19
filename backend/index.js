// backend/index.js
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './database.js';
import app       from './app.js';

const PORT = process.env.PORT || 3001;

app.post("/api/token", async (req, res) => {
  try {
    const response = await fetch("https://id.wompi.sv/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: process.env.GRANT_TYPE,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener token" });
  }
});

// Endpoint para procesar el pago de manera de prueba
app.post("/api/testPayment", async (req, res) => {
  try {
    const { token, formData } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token de acceso requerido" });
    }
    if (!formData) {
      return res.status(400).json({ error: "Datos de pago requeridos" });
    }

    const paymentResponse = await fetch(
      "https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (!paymentResponse.ok) {
      const error = await paymentResponse.text();
      return res.status(paymentResponse.status).json({ error });
    }

    const paymentData = await paymentResponse.json();
    res.json(paymentData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
});

//endpoint para el pago real con tarjeta 
// prueba siempre con datos 0.01 de dinero 

app.post("/api/payment3ds", async (req, res) => {
  try {
    const { token, formData  } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token de acceso requerido" });
    }
    if (!formData ) {
      return res.status(400).json({ error: "Datos de pago requeridos" });
    }

    const response = await fetch("https://api.wompi.sv/TransaccionCompra/3Ds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
});



(async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
  }
})();
