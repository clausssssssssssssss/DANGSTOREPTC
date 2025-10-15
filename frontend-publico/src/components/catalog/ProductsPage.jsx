// src/pages/ProductsPage.jsx
import React from 'react';
import { useProducts } from './hook/useProducts';
import ProductList from './ProductList';

const ProductsPage = () => {
  const { products, loading, error, refetch } = useProducts();
  
  const handleAddToCart = (product) => {
    // Implementación real del carrito
    // Ejemplo de implementación real:
    // addToCart(product);
    // showNotification(`${product.name} agregado al carrito`);
  };

  return (
    <main className="products-page">
      <h1 className="page-title">Catálogo de Productos</h1>
      <ProductList 
        products={products} 
        loading={loading} 
        error={error}
        onAddToCart={handleAddToCart}
        onRefresh={refetch}
      />
    </main>
  );
};

export default ProductsPage;