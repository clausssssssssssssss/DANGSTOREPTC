import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000/api';


export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch('/api/catalog');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  return { products, loading, error };
}
