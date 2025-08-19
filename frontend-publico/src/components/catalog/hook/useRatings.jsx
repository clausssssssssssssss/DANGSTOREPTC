import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';

export const useRatings = (productId) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [canRate, setCanRate] = useState(false);
  const [canRateMessage, setCanRateMessage] = useState('Debes iniciar sesión para dejar reseñas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si el usuario puede dejar reseñas
  const checkCanRate = async () => {
    if (!productId || !user) {
      console.log('🔍 No se puede verificar permisos:', { productId, user: !!user });
      setCanRate(false);
      setCanRateMessage('Debes iniciar sesión para dejar reseñas');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Verificando permisos para:', { productId, userId: user.id });
      console.log('🔍 Token disponible:', !!token);
      console.log('🔍 Token length:', token ? token.length : 0);
      
      const response = await fetch(`https://dangstoreptc.onrender.com/api/ratings/can-rate/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Respuesta de permisos:', data);
        setCanRate(data.canRate);
        setCanRateMessage(data.message);
      } else {
        console.log('🔍 Error en respuesta de permisos:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log('🔍 Error data:', errorData);
        setCanRate(false);
        setCanRateMessage(errorData.message || 'Error al verificar permisos');
      }
    } catch (err) {
      console.error('Error verificando permisos:', err);
      setCanRate(false);
      setCanRateMessage('Error al verificar permisos');
    }
  };

  // Cargar reseñas del producto
  const loadRatings = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`https://dangstoreptc.onrender.com/api/ratings/product/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        setAverageRating(data.averageRating || 0);
        setTotalRatings(data.totalRatings || 0);
        
        // Buscar si el usuario ya tiene una reseña
        if (user) {
          console.log('🔍 Buscando reseña del usuario:', {
            userId: user.id,
            ratings: data.ratings,
            userRating: data.ratings?.find(r => r.id_customer === user.id)
          });
          const userRating = data.ratings?.find(r => r.id_customer === user.id);
          setUserRating(userRating || null);
        }
      } else {
        console.error('Error cargando reseñas:', response.status);
      }
    } catch (err) {
      console.error('Error cargando reseñas:', err);
      setError('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  // Agregar o actualizar reseña del usuario
  const submitRating = async (rating, comment) => {
    if (!user || !productId) {
      throw new Error('Debes iniciar sesión para dejar una reseña');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Enviando reseña con token:', !!token);
      
      const method = userRating ? 'PUT' : 'POST';
      const url = userRating 
        ? `https://dangstoreptc.onrender.com/api/ratings/${userRating._id}`
        : `https://dangstoreptc.onrender.com/api/ratings`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_product: productId,
          id_customer: user.id,
          rating,
          comment
        })
      });

      if (response.ok) {
        const newRating = await response.json();
        
        if (userRating) {
          // Actualizar reseña existente
          setRatings(prev => prev.map(r => 
            r._id === userRating._id ? newRating : r
          ));
        } else {
          // Agregar nueva reseña
          setRatings(prev => [...prev, newRating]);
          setTotalRatings(prev => prev + 1);
        }
        
        setUserRating(newRating);
        
        // Recalcular promedio
        const newRatings = userRating 
          ? ratings.map(r => r._id === userRating._id ? newRating : r)
          : [...ratings, newRating];
        
        const newAverage = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
        setAverageRating(newAverage);
        
        // Recargar ratings y estadísticas para asegurar sincronización
        await loadRatings();
        await checkCanRate();
        
        return { success: true, rating: newRating };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la reseña');
      }
    } catch (err) {
      console.error('Error enviando reseña:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar reseña del usuario
  const deleteRating = async () => {
    if (!user || !userRating) {
      throw new Error('No tienes una reseña para eliminar');
    }

    try {
      setLoading(true);
      const response = await fetch(`https://dangstoreptc.onrender.com/api/ratings/${userRating._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Remover reseña de la lista
        setRatings(prev => prev.filter(r => r._id !== userRating._id));
        setUserRating(null);
        setTotalRatings(prev => prev - 1);
        
        // Recalcular promedio
        const newRatings = ratings.filter(r => r._id !== userRating._id);
        const newAverage = newRatings.length > 0 
          ? newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length
          : 0;
        setAverageRating(newAverage);
        
        // Recargar ratings y estadísticas para asegurar sincronización
        await loadRatings();
        await checkCanRate();
        
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la reseña');
      }
    } catch (err) {
      console.error('Error eliminando reseña:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar reseñas cuando cambie el productId
  useEffect(() => {
    if (productId) {
      loadRatings();
      checkCanRate(); // Siempre verificar permisos
    }
  }, [productId, user]);

  return {
    ratings,
    averageRating,
    totalRatings,
    userRating,
    canRate,
    canRateMessage,
    loading,
    error,
    submitRating,
    deleteRating,
    loadRatings,
    checkCanRate
  };
};
