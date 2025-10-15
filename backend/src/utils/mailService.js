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

/**
 * Genera el contenido HTML para notificación de stock disponible
 */
const HTMLStockAvailableEmail = (stockInfo) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Stock Disponible! - DANGSTORE</title>
  </head>
  <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f7f8fc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); overflow: hidden;">
      
      <!-- Header con gradiente verde -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px;">
          DANGSTORE
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">
          ¡Ya puedes hacer tus pedidos!
        </p>
      </div>
      
      <!-- Contenido principal -->
      <div style="padding: 40px 30px;">
        <div style="text-align: center;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            ¡Buenas Noticias! 🛍️
          </h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            El stock de la tienda ha sido reactivado y ahora puedes realizar tus pedidos nuevamente.
          </p>
          
          <!-- Información de stock -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; border-radius: 12px; padding: 30px; margin: 30px 0;">
            <div style="margin-bottom: 20px;">
              <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                Disponibilidad
              </p>
              <p style="font-size: 32px; font-weight: 700; color: #15803d; margin: 0;">
                ✓ ACTIVO
              </p>
            </div>
            
            ${stockInfo.catalogMaxStock ? `
            <div style="background-color: white; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <p style="color: #374151; font-size: 14px; margin: 0 0 5px 0; font-weight: 500;">
                📦 Productos del Catálogo
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                Stock máximo: <strong>${stockInfo.catalogMaxStock} unidades</strong>
              </p>
            </div>
            ` : ''}
            
            ${stockInfo.customOrdersMaxStock ? `
            <div style="background-color: white; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <p style="color: #374151; font-size: 14px; margin: 0 0 5px 0; font-weight: 500;">
                🎨 Encargos Personalizados
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                Stock máximo: <strong>${stockInfo.customOrdersMaxStock} unidades</strong>
              </p>
            </div>
            ` : ''}
            
            ${stockInfo.defaultMaxStock ? `
            <div style="background-color: white; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <p style="color: #374151; font-size: 14px; margin: 0 0 5px 0; font-weight: 500;">
                🌐 Límite Global
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                Pedidos disponibles: <strong>${stockInfo.defaultMaxStock}</strong>
              </p>
            </div>
            ` : ''}
          </div>
          
          <!-- Call to action -->
          <div style="margin: 35px 0;">
            <a href="${config.appUrl || 'https://tuapp.com'}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
              Ver Productos Disponibles 🛒
            </a>
          </div>
          
          <!-- Consejo -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 25px 0; text-align: left;">
            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
              💡 <strong>Consejo:</strong> Los productos más populares se agotan rápido. ¡No esperes más!
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; margin-top: 30px; line-height: 1.4;">
            Si tienes alguna pregunta, no dudes en contactarnos.<br>
            ¡Gracias por tu preferencia! 💜
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

/**
 * Envía notificación de stock disponible a múltiples usuarios
 */
const sendStockAvailableNotification = async (userEmails, stockInfo) => {
  try {
    console.log('=== ENVIANDO NOTIFICACIONES DE STOCK ===');
    console.log(`📧 Total de destinatarios: ${userEmails.length}`);
    
    const results = {
      sent: [],
      failed: []
    };

    // Enviar emails en paralelo (máximo 10 a la vez para no saturar)
    const batchSize = 10;
    for (let i = 0; i < userEmails.length; i += batchSize) {
      const batch = userEmails.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (email) => {
          try {
            await sendEmail({
              to: email,
              subject: '🎉 ¡Ya puedes hacer tus pedidos en DANGSTORE!',
              html: HTMLStockAvailableEmail(stockInfo)
            });
            results.sent.push(email);
            console.log(`✅ Email enviado a: ${email}`);
          } catch (error) {
            results.failed.push({ email, error: error.message });
            console.error(`❌ Error enviando a ${email}:`, error.message);
          }
        })
      );
      
      // Pequeña pausa entre lotes para no saturar la API
      if (i + batchSize < userEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('=== RESUMEN DE ENVÍO ===');
    console.log(`✅ Enviados exitosamente: ${results.sent.length}`);
    console.log(`❌ Fallidos: ${results.failed.length}`);
    console.log('========================\n');

    return results;
  } catch (error) {
    console.error('❌ ERROR GENERAL EN ENVÍO MASIVO:', error);
    throw error;
  }
};

// Exportamos las funciones
export {
  sendEmail,
  HTMLRecoveryEmail,
  HTMLStockAvailableEmail,
  sendStockAvailableNotification
};