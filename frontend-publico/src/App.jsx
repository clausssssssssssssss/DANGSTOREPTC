<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import Nav from "./components/Navigation";

// Páginas
import iniciarSesion from './pages/iniciarSesion';
import registro from './pages/registro';
import inicio from './pages/inicio';
import perfil from './pages/perfil';
import recuperarContrasena from './pages/recuperarContrasena';
import recuperarContraseña2 from './pages/recuperarcontraseña2';
import recuperarContraseña3 from './pages/recuperarcontraseña3';
import contacto from './pages/contacto';
import catologo from './pages/catologo';
import encargoPersonalizado from './pages/encargoPersonalizado';
import carritoDeCompras from './pages/carritoDeCompras';
import metododePago from './pages/metodoDePago';


function App() { 

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<inicio />} />
        <Route path="/iniciarSesion" element={<iniciarSesion />} />
        <Route path="/registro" element={<registro />} />
        <Route path="/perfil" element={<perfil />} />
        
      </Routes>
      </Router>
    </>
  );
};


export default App;
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import NavBar from './components/navBar';
import Footer from './components/Footer';
import ProductsPage from './components/ProductsPage';
import Catalogo from './components/Catalogojsx';
import ProductList from './components/ProductList';
import CartItem from './components/Cartitem';
import useAuth from './hooks/useAuth';
import useCart from './hooks/useCart';
import useProducts from './hooks/useProducts';
import './App.css';

function App() {
  const { user, login, logout, register } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { products, loading, error } = useProducts();

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={logout} />
        <NavBar cartCount={cart.length} />
        
        <main className="main-content">
          <Routes>
            {/* Página principal */}
            <Route path="/" element={<ProductsPage products={products} loading={loading} error={error} />} />
            
            {/* Catálogo */}
            <Route path="/catalogo" element={<Catalogo products={products} addToCart={addToCart} />} />
            
            {/* Lista de productos */}
            <Route path="/productos" element={<ProductList products={products} loading={loading} error={error} />} />
            
            {/* Carrito */}
            <Route 
              path="/carrito" 
              element={
                <div className="cart-container">
                  <h2>Tu Carrito</h2>
                  {cart.length === 0 ? (
                    <p>Tu carrito está vacío</p>
                  ) : (
                    cart.map(item => (
                      <CartItem 
                        key={item.id} 
                        item={item} 
                        onRemove={removeFromCart} 
                      />
                    ))
                  )}
                  <button onClick={clearCart} className="clear-cart-btn">
                    Vaciar Carrito
                  </button>
                </div>
              } 
            />
            
        
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
>>>>>>> 6c4db560ea00ef3da40ad1034b29f8c1eb918ee1
