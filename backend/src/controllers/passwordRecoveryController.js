import bcrypt from "bcryptjs";
import Customer from "../models/Customers.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailService.js";

const passwordRecoveryController = {};

// Envía un código de 4 dígitos para recuperar contraseña, válido 15 minutos
passwordRecoveryController.sendRecoveryCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Solicitud de código de recuperación para:', email);

    // Validar que venga el email
    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }

    // Buscar cliente por email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Email no registrado" });
    }

    // Verificar si ya existe un código válido (no expirado)
    if (customer.resetCode && customer.resetCode.code && customer.resetCode.expires) {
      const now = new Date();
      if (customer.resetCode.expires > now) {
        const remainingMinutes = Math.ceil((customer.resetCode.expires - now) / 60000);
        console.log('⚠️ Código ya existe y es válido por', remainingMinutes, 'minutos');
        return res.status(400).json({ 
          message: `Ya tienes un código válido. Espera ${remainingMinutes} minutos o usa el código existente.` 
        });
      } else {
        console.log('⏰ Código anterior expirado, generando nuevo');
      }
    }

    // Generar código aleatorio de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('🔑 Nuevo código generado:', code);

    // Guardar código y fecha de expiración (15 minutos)
    customer.resetCode = {
      code,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    };
    await customer.save();

    // Enviar email con el código de recuperación
    await sendEmail({
      to: email,
      subject: "Recuperación de contraseña",
      text: `Tu código de recuperación es: ${code}. Válido 15 minutos.`,
      html: HTMLRecoveryEmail(code),
    });

    // Responder que se envió el código
    res.json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error("Error en sendCode:", error);
    res.status(500).json({ message: "Error interno al enviar código" });
  }
};

// Valida el código recibido y actualiza la contraseña
passwordRecoveryController.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validar datos obligatorios
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Buscar cliente y obtener el código y expiración
    const customer = await Customer
      .findOne({ email })
      .select("+resetCode.code +resetCode.expires");
    if (!customer) {
      return res.status(404).json({ message: "Email no registrado" });
    }

    // Revisar si hay código previo para recuperación
    const { resetCode: rc = {} } = customer;
    if (!rc.code) {
      return res.status(400).json({ message: "No se solicitó restablecer contraseña" });
    }

    // Verificar que el código coincida
    if (rc.code !== code) {
      return res.status(400).json({ message: "Código incorrecto" });
    }

    // Verificar que el código no haya expirado
    if (rc.expires < new Date()) {
      return res.status(400).json({ message: "Código expirado" });
    }

    // Encriptar y actualizar la nueva contraseña
    customer.password = await bcrypt.hash(newPassword, 10);

    // Limpiar el código para evitar reutilización
    customer.resetCode = {};
    await customer.save();

    // Confirmar cambio exitoso
    res.json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error interno al restablecer contraseña" });
  }
};

// Verifica que el código recibido sea válido y no esté expirado
passwordRecoveryController.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log('🔍 Verificando código:', { email, code });

    // Validar que email y código existan
    if (!email || !code) {
      return res.status(400).json({ message: "Email y código son obligatorios" });
    }

    // Buscar cliente y obtener código y expiración
    const customer = await Customer
      .findOne({ email })
      .select("+resetCode.code +resetCode.expires");

    console.log('👤 Cliente encontrado:', !!customer);
    if (customer && customer.resetCode) {
      console.log('🔑 Código en BD:', customer.resetCode.code);
      console.log('⏰ Expira:', customer.resetCode.expires);
    }

    if (!customer || !customer.resetCode || customer.resetCode.code !== code) {
      console.log('❌ Código incorrecto o cliente no encontrado');
      return res.status(400).json({ message: "Código incorrecto" });
    }

    // Verificar que el código no haya expirado
    if (customer.resetCode.expires < new Date()) {
      console.log('⏰ Código expirado');
      return res.status(400).json({ message: "Código expirado" });
    }

    console.log('✅ Código válido y no expirado');
    // Código válido
    res.json({ ok: true, message: "Código válido" });
  } catch (err) {
    console.error("Error en verifyCode:", err);
    res.status(500).json({ message: "Error interno validating code" });
  }
};

export default passwordRecoveryController;
