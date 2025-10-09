import mongoose from 'mongoose';
import DeliveryPoint from './src/models/DeliveryPoint.js';
import dotenv from 'dotenv';

dotenv.config();

const deliveryPointsData = [
  {
    nombre: "Centro Comercial Metrocentro",
    direccion: "Boulevard de los Héroes, San Salvador",
    coordenadas: {
      lat: 13.6981,
      lng: -89.1919
    },
    descripcion: "Punto de entrega principal en Metrocentro",
    referencia: "Frente a tienda deportiva",
    horarioAtencion: "Lunes a Domingo 9:00 AM - 9:00 PM",
    activo: true
  },
  {
    nombre: "Plaza Mundo",
    direccion: "Final Boulevard del Hipódromo, San Salvador",
    coordenadas: {
      lat: 13.7158,
      lng: -89.1524
    },
    descripcion: "Punto de entrega en Plaza Mundo",
    referencia: "Entrada principal, módulo 15",
    horarioAtencion: "Lunes a Domingo 10:00 AM - 8:00 PM",
    activo: true
  },
  {
    nombre: "Centro Comercial Galerías",
    direccion: "Colonia Escalón, San Salvador",
    coordenadas: {
      lat: 13.7069,
      lng: -89.2405
    },
    descripcion: "Punto de entrega en Galerías Escalón",
    referencia: "Planta baja, cerca de Starbucks",
    horarioAtencion: "Lunes a Domingo 9:00 AM - 10:00 PM",
    activo: true
  },
  {
    nombre: "Universidad Centroamericana (UCA)",
    direccion: "Boulevard Los Próceres, San Salvador",
    coordenadas: {
      lat: 13.7220,
      lng: -89.2435
    },
    descripcion: "Punto de entrega en UCA",
    referencia: "Entrada principal, oficina de servicios",
    horarioAtencion: "Lunes a Viernes 8:00 AM - 5:00 PM",
    activo: true
  },
  {
    nombre: "Centro Histórico",
    direccion: "Centro Histórico, San Salvador",
    coordenadas: {
      lat: 13.6989,
      lng: -89.1914
    },
    descripcion: "Punto de entrega en Centro Histórico",
    referencia: "Plaza Libertad, oficina de turismo",
    horarioAtencion: "Lunes a Sábado 9:00 AM - 6:00 PM",
    activo: true
  }
];

async function seedDeliveryPoints() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dangstore');
    console.log('Conectado a MongoDB');

    // Limpiar puntos de entrega existentes (opcional)
    await DeliveryPoint.deleteMany({});
    console.log('Puntos de entrega existentes eliminados');

    // Insertar nuevos puntos de entrega
    const deliveryPoints = await DeliveryPoint.insertMany(deliveryPointsData);
    console.log(`${deliveryPoints.length} puntos de entrega creados exitosamente:`);
    
    deliveryPoints.forEach(point => {
      console.log(`- ${point.nombre}: ${point.direccion}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding delivery points:', error);
    process.exit(1);
  }
}

seedDeliveryPoints();
