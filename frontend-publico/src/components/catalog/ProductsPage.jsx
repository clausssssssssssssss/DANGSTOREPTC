// src/pages/ProductsPage.jsx
import React from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductList from '../components/ProductList/ProductList';

const ProductsPage = () => {
  const { products, loading, error, refetch } = useProducts();
  
  const handleAddToCart = (product) => {
    // Implementación real del carrito
    console.log('Producto agregado al carrito:', product);
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