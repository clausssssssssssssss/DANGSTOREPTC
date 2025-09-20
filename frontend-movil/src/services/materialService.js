// Servicio para manejo de materiales del inventario
import { API_CONFIG, ENDPOINTS } from '../config/api';

const API_BASE = API_CONFIG.BASE_URL;

// Obtener todos los materiales
export const getMaterials = async (baseUrl = API_BASE) => {
  try {
    const response = await fetch(`${baseUrl}${ENDPOINTS.MATERIALS}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Buscar materiales por query
export const searchMaterials = async (baseUrl = API_BASE, query) => {
  try {
    const response = await fetch(`${baseUrl}${ENDPOINTS.MATERIALS}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo material (con o sin imagen)
export const createMaterial = async (baseUrl = API_BASE, materialData) => {
  try {
    // Si no hay imagen, usar endpoint específico sin imagen
    if (!materialData.image) {
      const response = await fetch(`${baseUrl}${ENDPOINTS.MATERIALS}/without-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `, message: ${errorData.message || 'Error desconocido'}`;
        } catch (parseError) {
          // Error al parsear respuesta del servidor
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    }

    // Si hay imagen, usar FormData con endpoint normal
    console.log('Creando FormData con imagen:', materialData.image);
    const formData = new FormData();
    
    // Agregar campos básicos
    formData.append('name', materialData.name);
    formData.append('type', materialData.type);
    formData.append('quantity', materialData.quantity.toString());
    formData.append('investment', materialData.investment.toString());
    formData.append('dateOfEntry', materialData.dateOfEntry);
    
    // Agregar imagen
    formData.append('image', {
      uri: materialData.image,
      type: 'image/jpeg',
      name: 'material.jpg',
    });

    const response = await fetch(`${baseUrl}${ENDPOINTS.MATERIALS}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += `, message: ${errorData.message || 'Error desconocido'}`;
        } catch (parseError) {
          // Error al parsear respuesta del servidor
        }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Actualizar material existente
export const updateMaterial = async (baseUrl = API_BASE, materialId, materialData) => {
  try {
    const formData = new FormData();
    
    // Agregar campos básicos
    formData.append('name', materialData.name);
    formData.append('type', materialData.type);
    formData.append('quantity', materialData.quantity.toString());
    formData.append('investment', materialData.investment.toString());
    formData.append('dateOfEntry', materialData.dateOfEntry);
    
    // Agregar imagen si existe
    if (materialData.image) {
      formData.append('image', {
        uri: materialData.image,
        type: 'image/jpeg',
        name: 'material.jpg',
      });
    }

    const response = await fetch(`${baseUrl}${ENDPOINTS.MATERIALS}/${materialId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Eliminar material
export const deleteMaterial = async (baseUrl = API_BASE, materialId) => {
  try {
    const response = await fetch(`${baseUrl}${ENDPOINTS.MATERIALS}/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
