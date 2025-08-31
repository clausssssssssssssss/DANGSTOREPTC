// Servicio para manejo de materiales del inventario
const API_BASE = 'http://192.168.0.8:4000/api';

// Obtener todos los materiales
export const getMaterials = async (baseUrl = API_BASE) => {
  try {
    const response = await fetch(`${baseUrl}/materials`, {
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
    console.error('Error fetching materials:', error);
    throw error;
  }
};

// Buscar materiales por query
export const searchMaterials = async (baseUrl = API_BASE, query) => {
  try {
    const response = await fetch(`${baseUrl}/materials/search?q=${encodeURIComponent(query)}`, {
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
    console.error('Error searching materials:', error);
    throw error;
  }
};

// Crear nuevo material
export const createMaterial = async (baseUrl = API_BASE, materialData) => {
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
      formData.append('image', materialData.image);
    }

    const response = await fetch(`${baseUrl}/materials`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating material:', error);
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
      formData.append('image', materialData.image);
    }

    const response = await fetch(`${baseUrl}/materials/${materialId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

// Eliminar material
export const deleteMaterial = async (baseUrl = API_BASE, materialId) => {
  try {
    const response = await fetch(`${baseUrl}/materials/${materialId}`, {
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
    console.error('Error deleting material:', error);
    throw error;
  }
};
