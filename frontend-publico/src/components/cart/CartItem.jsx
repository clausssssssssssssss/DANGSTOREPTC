import React from 'react';
import { useCart } from './useCart';
import './Cartitem.css';

const CartItem = ({ product, quantity }) => {
  const { addToCart, removeFromCart } = useCart();

  const handleIncrease = () => {
    addToCart(product, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      addToCart(product, quantity - 1);
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