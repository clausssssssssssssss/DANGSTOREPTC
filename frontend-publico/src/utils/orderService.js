const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const checkout = async () => {
  try {
    const res = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw errorData.message || `Error: ${res.status}`;
    }

    return await res.json();
  } catch (error) {
    throw error.message || 'Error en checkout';
  }
};

export const getHistory = async () => {
  try {
    const res = await fetch(`${API_URL}/orders/history`);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw errorData.message || `Error: ${res.status}`;
    }

    return await res.json();
  } catch (error) {
    throw error.message || 'Error en getHistory';
  }
};
