import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useCart } from './hook/useCart.jsx';
import './Cartitem.css';

const CartItem = ({ product, quantity }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { updateQuantity, removeFromCart } = useCart(userId);

  const handleIncrease = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeFromCart(product.id);
    }
  };

  const handleRemove = () => {
    removeFromCart(product.id);
  };

  return (
    <div className="cart-item">
      <div className="item-info">
        <img 
          src={product.image} 
          alt={product.name} 
          className="item-image" 
        />
        <div className="item-details">
          <h3>{product.name}</h3>
          <p>Precio: ${product.price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="item-actions">
        <div className="quantity-control">
          <button onClick={handleDecrease}>-</button>
          <span>{quantity}</span>
          <button onClick={handleIncrease}>+</button>
        </div>
        
        <button 
          onClick={handleRemove}
          className="remove-btn"
        >
          Eliminar
        </button>
        
        <div className="item-total">
          ${(product.price * quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default CartItem;