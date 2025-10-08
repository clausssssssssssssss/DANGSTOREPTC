// services/metasService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const METAS_KEY = '@metas_semanales';

export const metasService = {
  // Obtener la meta semanal actual
  getMetaSemanal: async () => {
    try {
      const meta = await AsyncStorage.getItem(METAS_KEY);
      if (meta !== null) {
        const parsed = JSON.parse(meta);
        return parsed.monto || 50; // Default 50 si no hay nada guardado
      }
      return 50; // Meta por defecto
    } catch (error) {
      console.error('Error obteniendo meta semanal:', error);
      return 50;
    }
  },

  // Guardar nueva meta semanal
  setMetaSemanal: async (monto) => {
    try {
      const metaData = {
        monto: parseFloat(monto),
        fechaActualizacion: new Date().toISOString(),
      };
      await AsyncStorage.setItem(METAS_KEY, JSON.stringify(metaData));
      return true;
    } catch (error) {
      console.error('Error guardando meta semanal:', error);
      return false;
    }
  },

  // Obtener historial de metas (opcional para futuro)
  getHistorialMetas: async () => {
    try {
      const historial = await AsyncStorage.getItem('@historial_metas');
      return historial ? JSON.parse(historial) : [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  },

  // Agregar al historial cuando se cambia la meta
  agregarAlHistorial: async (metaAnterior, metaNueva) => {
    try {
      const historial = await metasService.getHistorialMetas();
      historial.unshift({
        metaAnterior,
        metaNueva,
        fecha: new Date().toISOString(),
      });
      
      // Mantener solo los últimos 10 cambios
      const historialLimitado = historial.slice(0, 10);
      await AsyncStorage.setItem('@historial_metas', JSON.stringify(historialLimitado));
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  },
};