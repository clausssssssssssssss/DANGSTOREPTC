// src/utils/mailService.js
// Servicio de email usando Brevo API (optimizado para Railway/Render)

import { config } from '../../config.js';
import fetch from 'node-fetch';

/**
 * Servicio de email usando Brevo API
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log('=== ENVÍO DE EMAIL ===');
    console.log('📧 Destinatario:', to);
    console.log('📋 Asunto:', subject);
    console.log('🔑 API Key configurada:', !!config.email.brevo.apiKey);
    console.log('👤 Remitente:', config.email.brevo.senderEmail);

    // Validar configuración
    if (!config.email.brevo.apiKey) {
      throw new Error('BREVO_API_KEY no está configurada en las variables de entorno');
    }

    // Preparar payload
    const payload = {
      sender: { 
        name: config.email.brevo.senderName, 
        email: config.email.brevo.senderEmail 
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html || `<p>${text}</p>`,
    };

    console.log('📤 Enviando a Brevo API...');

    // Hacer la petición
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": config.email.brevo.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log('📨 Status de respuesta:', response.status, response.statusText);

    // Manejar errores de la API
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Brevo API:', JSON.stringify(errorData, null, 2));
      
      // Mensajes de error específicos
      if (response.status === 400) {
        throw new Error(`Error de validación: ${errorData.message || 'Datos inválidos'}`);
      } else if (response.status === 401) {
        throw new Error('API Key inválida o expirada');
      } else if (response.status === 402) {
        throw new Error('Cuenta de Brevo sin créditos o suspendida');
      } else {
        throw new Error(`Error enviando email: ${errorData.message || response.statusText}`);
      }
    }

    // Respuesta exitosa
    const data = await response.json();
    console.log('✅ Email enviado exitosamente');
    console.log('📬 Message ID:', data.messageId);
    console.log('===================\n');
    
    return data;

  } catch (err) {
    console.error('❌ ERROR EN ENVÍO DE EMAIL:', err.message);
    console.error('Stack:', err.stack);
    console.error('===================\n');
    throw err;
  }
};

/**
 * Genera el contenido HTML profesional para el mensaje de recuperación de contraseña
 */
const HTMLRecoveryEmail = (code) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Recuperación - DANGSTORE</title>
  </head>
  <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f7f8fc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); overflow: hidden;">
      
      <!-- Header corporativo -->
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px;">
          DANGSTORE
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">
          Recuperación de Contraseña
        </p>
      </div>
      
      <!-- Contenido principal -->
      <div style="padding: 40px 30px;">
        <div style="text-align: center;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">
            Código de Verificación
          </h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
            <br>Utiliza el siguiente código para continuar:
          </p>
          
          <!-- Código destacado -->
          <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; padding: 30px; margin: 30px 0;">
            <p style="font-size: 32px; font-weight: 700; color: #1f2937; margin: 0; letter-spacing: 6px; font-family: 'Courier New', monospace;">
              ${code}
            </p>
          </div>
          
          <!-- Información importante -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 25px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
              ⏱️ Este código expira en 15 minutos por motivos de seguridad
            </p>
          </div>
          
          <!-- Instrucciones -->
          <div style="text-align: left; margin: 30px 0;">
            <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
              📋 Instrucciones:
            </h3>
            <ol style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0; padding-left: 18px;">
              <li>Ingresa el código en la aplicación</li>
              <li>Crea una nueva contraseña segura</li>
              <li>Confirma los cambios</li>
            </ol>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; margin-top: 30px; line-height: 1.4;">
            Si no solicitaste este código, puedes ignorar este mensaje.<br>
            Tu cuenta permanece segura y protegida. 🔒
          </p>
        </div>
      </div>
      
      <!-- Footer profesional -->
      <div style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.4;">
          © 2024 DANGSTORE. Todos los derechos reservados.<br>
          Este es un mensaje automático generado por el sistema.
        </p>
      </div>
      
    </div>
  </body>
  </html>
`;

// Exportamos las funciones que usa el controlador
export {
  sendEmail,
  HTMLRecoveryEmail
};