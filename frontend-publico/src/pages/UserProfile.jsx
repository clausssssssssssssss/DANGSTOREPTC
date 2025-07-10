import React, { useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { User, Heart, ShoppingCart, Gift, LogOut } from "lucide-react";
import './UserProfile.css'

const UserProfile = () => {
  const token = "aquí_va_tu_token"; // O usa context o redux para traerlo
  const {
    user,
    orders,
    favorites,
    updateProfile,
    changePassword,
    toggleFavorite,
    statusMessage,
    loading,
  } = useProfile(token);

  const [activeSection, setActiveSection] = useState("personal");

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Hola, {user?.name}</h2>

      <nav>
        <button onClick={() => setActiveSection("personal")}>Perfil</button>
        <button onClick={() => setActiveSection("orders")}>Pedidos</button>
        <button onClick={() => setActiveSection("favorites")}>Favoritos</button>
      </nav>

      {activeSection === "personal" && (
        <div>
          <p>Nombre: {user?.name}</p>
          <p>Teléfono: {user?.telephone}</p>
          <p>Correo: {user?.email}</p>
          <button
            onClick={() =>
              updateProfile({
                name: "Nuevo Nombre",
                telephone: "12345678",
                birthdate: "2000-01-01",
              })
            }
          >
            Actualizar perfil
          </button>
        </div>
      )}

      {activeSection === "orders" && (
        <div>
          <h3>Pedidos:</h3>
          {orders.map((order) => (
            <div key={order._id}>
              <p>Pedido: {order._id}</p>
            </div>
          ))}
        </div>
      )}

      {activeSection === "favorites" && (
        <div>
          <h3>Favoritos:</h3>
          {favorites.map((fav) => (
            <div key={fav._id}>
              <p>{fav.name}</p>
              <button onClick={() => toggleFavorite(fav._id)}>
                Quitar de favoritos
              </button>
            </div>
          ))}
        </div>
      )}

      {statusMessage && <div>{statusMessage}</div>}
    </div>
  );
};

export default UserProfile;
