# 📚 MANUAL DE USUARIOS - DANGSTORE FRONTEND PÚBLICO

## 🏠 **ÍNDICE**
1. [Introducción](#introducción)
2. [Acceso a la Aplicación](#acceso-a-la-aplicación)
3. [Navegación Principal](#navegación-principal)
4. [Funcionalidades Principales](#funcionalidades-principales)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Catálogo de Productos](#catálogo-de-productos)
7. [Carrito de Compras](#carrito-de-compras)
8. [Encargos Personalizados](#encargos-personalizados)
9. [Perfil de Usuario](#perfil-de-usuario)
10. [Contacto y Soporte](#contacto-y-soporte)
11. [Solución de Problemas](#solución-de-problemas)
12. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 **INTRODUCCIÓN**

**DANGSTORE** es una plataforma web que permite a los usuarios explorar, comprar y personalizar productos artesanales como llaveros y cuadros hechos con Hama Beads. Esta aplicación está diseñada para ofrecer una experiencia de usuario intuitiva y amigable.

### **Características Principales:**
- ✨ Catálogo de productos con filtros avanzados
- 🛒 Sistema de carrito de compras
- 🔐 Autenticación de usuarios segura
- 🎨 Encargos personalizados
- ❤️ Sistema de favoritos
- 📱 Diseño responsive para todos los dispositivos

---

## 🌐 **ACCESO A LA APLICACIÓN**

### **URL de Acceso:**
- **URL Principal:** [Tu dominio principal]
- **URL de Autenticación:** `/auth`
- **URL del Catálogo:** `/catalogo`

### **Requisitos del Sistema:**
- **Navegador:** Chrome, Firefox, Safari, Edge (versiones recientes)
- **Dispositivo:** Computadora, tablet o smartphone
- **Conexión:** Internet estable

---

## 🧭 **NAVEGACIÓN PRINCIPAL**

### **Barra de Navegación Superior:**
La barra de navegación se encuentra en la parte superior de todas las páginas y contiene:

- **🏠 Logo DANGSTORE** - Enlace a la página principal
- **🔍 Buscador** - Búsqueda rápida de productos
- **🛍️ Catálogo** - Acceso al catálogo de productos
- **🎨 Encargo** - Solicitud de productos personalizados
- **📞 Contacto** - Información de contacto y soporte
- **ℹ️ Acerca** - Información sobre la empresa
- **🛒 Carrito** - Acceso al carrito de compras
- **👤 Perfil** - Gestión de cuenta de usuario

### **Menú Móvil:**
En dispositivos móviles, el menú se convierte en un botón hamburguesa (☰) que despliega todas las opciones de navegación.

---

## 🔐 **SISTEMA DE AUTENTICACIÓN**

### **Acceso a la Autenticación:**
- Haz clic en **"Perfil"** en la barra de navegación
- O navega directamente a `/auth`

### **Inicio de Sesión:**
1. **Ingresa tu email** en el campo correspondiente
2. **Ingresa tu contraseña**
3. **Opcional:** Marca "Recordarme" para mantener la sesión activa
4. **Haz clic en "Iniciar Sesión"**

### **Registro de Nueva Cuenta:**
1. **Haz clic en "Regístrate"** desde la pantalla de login
2. **Completa los campos:**
   - Nombre completo
   - Correo electrónico
   - Número de teléfono
   - Contraseña (mínimo 6 caracteres)
3. **Haz clic en "Registrarse"**

### **Recuperación de Contraseña:**
1. **Haz clic en "¿Olvidaste tu contraseña?"**
2. **Ingresa tu correo electrónico**
3. **Revisa tu email** para el código de verificación
4. **Ingresa el código de 4 dígitos**
5. **Crea una nueva contraseña**

### **Mensajes de Error Comunes:**
- **"Credenciales incorrectas"** - Email o contraseña incorrectos
- **"Por favor completa todos los campos"** - Campos obligatorios vacíos
- **"Error de conexión"** - Problema de conectividad

---

## 🛍️ **CATÁLOGO DE PRODUCTOS**

### **Acceso al Catálogo:**
- Haz clic en **"Catálogo"** en la barra de navegación
- O navega a `/catalogo`

### **Funcionalidades del Catálogo:**

#### **Búsqueda y Filtros:**
- **🔍 Barra de búsqueda:** Escribe el nombre del producto
- **🏷️ Filtro por categoría:** Llaveros, Piñatas, Cuadros
- **💰 Rango de precios:** Desliza para ajustar precio mínimo y máximo
- **🔄 Botón de refrescar:** Actualiza la lista de productos

#### **Visualización de Productos:**
- **Vista de cuadrícula** con imágenes de productos
- **Información del producto:** Nombre, precio, categoría
- **Botones de acción:**
  - ❤️ **Favorito** - Agregar/quitar de favoritos
  - 🛒 **Agregar al carrito** - Añadir producto al carrito

#### **Productos Populares:**
- Sección destacada con productos más populares
- Acceso rápido a llaveros especiales (Batman, Corazón, Zelda)

### **Detalle del Producto:**
- **Haz clic en cualquier producto** para ver detalles
- **Modal con información completa:**
  - Imagen ampliada
  - Descripción detallada
  - Precio
  - Botones de acción

---

## 🛒 **CARRITO DE COMPRAS**

### **Acceso al Carrito:**
- Haz clic en el **ícono del carrito** en la barra de navegación
- O navega a `/carrito`

### **Gestión del Carrito:**

#### **Ver Productos:**
- Lista de productos agregados
- Cantidad de cada producto
- Precio unitario y total por producto
- Precio total del carrito

#### **Modificar Cantidades:**
- **Botón +** para aumentar cantidad
- **Botón -** para disminuir cantidad
- **Campo de texto** para ingresar cantidad directamente

#### **Eliminar Productos:**
- **Botón 🗑️** para eliminar producto individual
- **Botón "Vaciar carrito"** para eliminar todos los productos

#### **Proceder al Pago:**
1. **Verifica los productos** en tu carrito
2. **Haz clic en "Proceder al Pago"**
3. **Completa el formulario de pago**
4. **Confirma tu compra**

### **Estados del Carrito:**
- **Carrito vacío:** Mensaje informativo con enlace al catálogo
- **Productos agregados:** Lista completa con opciones de gestión
- **Procesando pago:** Pantalla de carga durante el proceso

---

## 🎨 **ENCARGOS PERSONALIZADOS**

### **Acceso a Encargos:**
- Haz clic en **"Encargo"** en la barra de navegación
- O navega a `/encargo`

### **Crear un Encargo Personalizado:**

#### **Paso 1: Subir Imagen**
1. **Haz clic en la zona de subida** (ícono de nube)
2. **Selecciona una imagen** desde tu dispositivo
3. **Formatos soportados:** JPG, PNG, GIF
4. **Tamaño recomendado:** Mínimo 200x200 píxeles

#### **Paso 2: Seleccionar Tipo de Producto**
- **Llavero personalizado**
- **Cuadro personalizado**

#### **Paso 3: Descripción**
- **Describe tu idea** o lo que quieres que se cree
- **Menciona colores** o detalles específicos
- **Agrega cualquier referencia** o inspiración

#### **Paso 4: Enviar Encargo**
1. **Revisa toda la información**
2. **Haz clic en "Enviar Encargo"**
3. **Confirma tu solicitud**

### **Gestión de Imágenes:**
- **Vista previa** de la imagen subida
- **Botón X** para eliminar y cambiar imagen
- **Miniatura** para confirmar selección

### **Seguimiento del Encargo:**
- **Estado "Enviado"** - Encargo recibido
- **Estado "Cotizado"** - Precio y tiempo estimado
- **Notificaciones** en tu perfil de usuario

---

## 👤 **PERFIL DE USUARIO**

### **Acceso al Perfil:**
- Haz clic en **"Perfil"** en la barra de navegación
- O navega a `/perfil`

### **Secciones del Perfil:**

#### **📋 Datos Personales:**
- **Ver información:** Nombre, email, teléfono
- **Editar datos:** Actualizar información personal
- **Guardar cambios:** Confirmar modificaciones

#### **🛒 Historial de Pedidos:**
- **Lista de compras** realizadas
- **Estado de cada pedido:** En proceso, Enviado, Entregado
- **Detalles del pedido:** Productos, fechas, totales

#### **❤️ Productos Favoritos:**
- **Lista de favoritos** guardados
- **Agregar al carrito** desde favoritos
- **Eliminar de favoritos**

#### **🔐 Cambio de Contraseña:**
- **Contraseña actual** (requerida)
- **Nueva contraseña** (mínimo 6 caracteres)
- **Confirmar nueva contraseña**
- **Guardar cambios**

#### **📋 Cotizaciones:**
- **Encargos cotizados** con precios
- **Aceptar o rechazar** cotizaciones
- **Notificaciones** de nuevas cotizaciones

#### **🚪 Cerrar Sesión:**
- **Botón de logout** con confirmación
- **Redirección** a la página principal

### **Indicadores Visuales:**
- **Punto rojo** en perfil cuando hay nuevas cotizaciones
- **Contador de productos** en carrito y favoritos
- **Estados de carga** durante operaciones

---

## 📞 **CONTACTO Y SOPORTE**

### **Acceso al Contacto:**
- Haz clic en **"Contacto"** en la barra de navegación
- O navega a `/contacto`

### **Información de Contacto:**

#### **📧 Correo Electrónico:**
- **Email:** soportedangstore@gmail.com
- **Respuesta:** En 24-48 horas hábiles

#### **🕒 Horarios de Atención:**
- **Lunes a Viernes:** 9:00 AM - 6:00 PM
- **Sábados:** 10:00 AM - 2:00 PM
- **Domingos:** Cerrado

#### **📱 Redes Sociales:**
- **Instagram:** @dangstore.sv
- **Seguimiento** de novedades y productos

### **Formulario de Contacto:**
1. **Nombre completo** (requerido)
2. **Correo electrónico** (requerido)
3. **Mensaje** (requerido)
4. **Enviar mensaje**

### **Tipos de Consultas:**
- **Información de productos**
- **Problemas con pedidos**
- **Sugerencias y comentarios**
- **Soporte técnico**

---

## 🏠 **PÁGINA PRINCIPAL (ACERCA)**

### **Acceso a la Página Principal:**
- Haz clic en el **logo DANGSTORE**
- O navega a `/` o `/acerca`

### **Contenido de la Página:**

#### **🎥 Video de Presentación:**
- **Video corporativo** de DANGSTORE
- **Proceso creativo** de los productos
- **Controles de reproducción** disponibles

#### **🏢 Información de la Empresa:**
- **¿Quiénes somos?** - Descripción de la empresa
- **¿Qué hacemos?** - Servicios y productos
- **Misión y valores** de DANGSTORE

#### **🛍️ Productos Destacados:**
- **Llaveros artesanales** con Hama Beads
- **Cuadros personalizados** únicos
- **Proceso de creación** artesanal

#### **🎨 Características de los Productos:**
- **Materiales de calidad** Hama Beads
- **Diseños únicos** y personalizados
- **Artesanía hecha a mano** con dedicación

---

## ⚠️ **SOLUCIÓN DE PROBLEMAS**

### **Problemas Comunes y Soluciones:**

#### **🔐 No Puedo Iniciar Sesión:**
- **Verifica credenciales:** Email y contraseña correctos
- **Revisa conexión:** Internet estable
- **Limpia caché:** Borra datos del navegador
- **Contacta soporte:** Si el problema persiste

#### **🛒 Productos No Se Agregan al Carrito:**
- **Verifica sesión:** Debes estar logueado
- **Revisa stock:** Producto disponible
- **Limpia carrito:** Elimina productos antiguos
- **Recarga página:** Actualiza la aplicación

#### **📱 Problemas en Dispositivos Móviles:**
- **Actualiza navegador:** Versión más reciente
- **Verifica pantalla:** Orientación correcta
- **Limpia caché:** Datos del navegador móvil

#### **🖼️ No Puedo Subir Imágenes:**
- **Verifica formato:** JPG, PNG, GIF
- **Tamaño de archivo:** Máximo 5MB
- **Permisos:** Acceso a archivos del dispositivo
- **Navegador:** Chrome o Firefox recomendados

#### **💳 Problemas con el Pago:**
- **Verifica datos:** Información completa
- **Revisa tarjeta:** Válida y con fondos
- **Contacta banco:** Si hay bloqueos
- **Soporte técnico:** Para errores persistentes

### **Mensajes de Error Comunes:**
- **"Error de conexión"** - Problema de internet
- **"Sesión expirada"** - Vuelve a iniciar sesión
- **"Producto no disponible"** - Sin stock
- **"Datos inválidos"** - Revisa información ingresada

---

## ❓ **PREGUNTAS FRECUENTES**

### **🔐 Cuenta y Autenticación:**

**¿Puedo tener múltiples cuentas con el mismo email?**
No, cada email solo puede estar asociado a una cuenta.

**¿Qué hago si olvidé mi contraseña?**
Usa la opción "¿Olvidaste tu contraseña?" y sigue el proceso de recuperación.

**¿Puedo cambiar mi email de contacto?**
Sí, desde tu perfil en la sección "Datos Personales".

### **🛍️ Productos y Compras:**

**¿Los productos están en stock?**
El catálogo muestra solo productos disponibles. Si no aparece, no hay stock.

**¿Puedo cancelar un pedido?**
Los pedidos se pueden cancelar antes de ser procesados. Contacta soporte.

**¿Cuál es el tiempo de entrega?**
Varía según el producto. Productos estándar: 3-5 días, personalizados: 7-14 días.

### **🎨 Encargos Personalizados:**

**¿Qué tipos de imágenes puedo usar?**
JPG, PNG, GIF. Evita imágenes con copyright o contenido inapropiado.

**¿Cuánto cuesta un encargo personalizado?**
El precio se cotiza individualmente según complejidad y materiales.

**¿Puedo modificar un encargo después de enviarlo?**
Solo antes de que sea cotizado. Contacta soporte para cambios.

### **💳 Pagos y Facturación:**

**¿Qué métodos de pago aceptan?**
Tarjetas de crédito/débito, transferencias bancarias.

**¿Es seguro pagar en línea?**
Sí, utilizamos protocolos de seguridad SSL para proteger tus datos.

**¿Puedo solicitar factura?**
Sí, solicítala al momento de la compra o contacta soporte.

### **📞 Soporte y Atención:**

**¿Cuál es el tiempo de respuesta del soporte?**
Respondemos en 24-48 horas hábiles.

**¿Puedo contactar por WhatsApp?**
Por ahora solo por email y redes sociales.

**¿Atienden los fines de semana?**
Solo sábados de 10:00 AM a 2:00 PM.

---

## 📱 **USO EN DISPOSITIVOS MÓVILES**

### **Características Móviles:**

#### **🔄 Diseño Responsive:**
- **Adaptación automática** a diferentes tamaños de pantalla
- **Navegación optimizada** para dispositivos táctiles
- **Botones de tamaño adecuado** para dedos

#### **📱 Funciones Táctiles:**
- **Deslizar** para navegar entre secciones
- **Toque largo** para opciones adicionales
- **Zoom** en imágenes de productos

#### **📱 Menú Móvil:**
- **Botón hamburguesa** (☰) para acceder al menú
- **Navegación desplegable** con todas las opciones
- **Cierre automático** al seleccionar una opción

### **Optimizaciones Móviles:**
- **Carga rápida** en conexiones lentas
- **Imágenes optimizadas** para móviles
- **Formularios adaptados** a pantallas pequeñas

---

## 🔒 **SEGURIDAD Y PRIVACIDAD**

### **Protección de Datos:**
- **Conexión segura** HTTPS en todas las páginas
- **Datos encriptados** durante la transmisión
- **Sesiones seguras** con tokens JWT

### **Privacidad del Usuario:**
- **Información personal** protegida y no compartida
- **Cookies mínimas** solo para funcionalidad esencial
- **Opciones de privacidad** en el perfil de usuario

### **Recomendaciones de Seguridad:**
- **Cierra sesión** en dispositivos compartidos
- **No compartas** tus credenciales
- **Usa contraseñas fuertes** y únicas
- **Reporta** actividades sospechosas

---

## 📞 **CONTACTO DE EMERGENCIA**

### **Problemas Críticos:**
- **No puedo acceder a mi cuenta**
- **Error en el sistema de pagos**
- **Problema de seguridad**

### **Contacto Inmediato:**
- **Email:** soportedangstore@gmail.com
- **Asunto:** URGENTE - [Descripción del problema]
- **Respuesta:** En 2-4 horas

---

## 📝 **NOTAS IMPORTANTES**

### **Horarios de Operación:**
- **Lunes a Viernes:** 9:00 AM - 6:00 PM
- **Sábados:** 10:00 AM - 2:00 PM
- **Domingos:** Cerrado

### **Mantenimiento del Sistema:**
- **Actualizaciones programadas** en horarios de baja actividad
- **Notificaciones previas** para mantenimientos importantes
- **Tiempo de inactividad** mínimo durante actualizaciones

### **Políticas de Uso:**
- **Uso responsable** de la plataforma
- **Respeto** a otros usuarios
- **Cumplimiento** de términos y condiciones

---

## 🎉 **CONCLUSIÓN**

Este manual cubre todas las funcionalidades principales de DANGSTORE. Si tienes alguna pregunta adicional o necesitas ayuda específica, no dudes en contactar a nuestro equipo de soporte.

**¡Gracias por elegir DANGSTORE para tus productos artesanales!**

---

*Última actualización: [Fecha actual]*
*Versión del manual: 1.0*
*DANGSTORE - Tu estilo en llavero* 🎨🔑
