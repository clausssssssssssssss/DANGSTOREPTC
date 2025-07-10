import { useState, useEffect, useCallback } from "react";

export function useProfile(token) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { headers });
      if (!res.ok) throw new Error("Error al obtener perfil");
      const data = await res.json();
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/profile/orders", { headers });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/profile/favorites", { headers });
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const updateProfile = async ({ name, telephone, birthdate }) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ name, telephone, birthdate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
      setStatusMessage("Perfil actualizado");
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const changePassword = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers,
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatusMessage("Contraseña actualizada");
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const res = await fetch(`/api/profile/favorites/${productId}`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      await fetchFavorites();
      setStatusMessage(data.message);
    } catch (err) {
      setStatusMessage("Error al actualizar favoritos");
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchOrders();
      fetchFavorites();
    }
  }, [token, fetchProfile, fetchOrders, fetchFavorites]);

  return {
    user,
    orders,
    favorites,
    loading,
    error,
    statusMessage,
    fetchProfile,
    fetchOrders,
    fetchFavorites,
    updateProfile,
    changePassword,
    toggleFavorite,
    setStatusMessage,
  };
}
