export default function ProductCard({ product, onAddToCart, onClick }) {
  return (
    <div className="product-card" onClick={onClick}>
      <img src={product.image} alt={product.name} className="product-image"/>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>
        <button
          className="add-to-cart-btn"
          onClick={e => { e.stopPropagation(); onAddToCart(); }}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
