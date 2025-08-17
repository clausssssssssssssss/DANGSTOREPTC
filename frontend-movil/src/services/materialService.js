const toFormData = async (data) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'image' && value && typeof value === 'object' && value.uri) {
      form.append('image', value);
    } else {
      form.append(key, String(value));
    }
  });
  return form;
};

export const createMaterial = async (baseUrl, payload) => {
  const formData = await toFormData(payload);
  const res = await fetch(`${baseUrl}/material`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error creando material');
  }
  return res.json();
};

export const getMaterials = async (baseUrl) => {
  const res = await fetch(`${baseUrl}/material`);
  if (!res.ok) throw new Error('Error obteniendo materiales');
  return res.json();
};

export const searchMaterials = async (baseUrl, query) => {
  const res = await fetch(`${baseUrl}/material/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Error buscando materiales');
  return res.json();
};

export const updateMaterial = async (baseUrl, id, payload) => {
  const formData = await toFormData(payload);
  const res = await fetch(`${baseUrl}/material/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error actualizando material');
  }
  return res.json();
};

export const deleteMaterial = async (baseUrl, id) => {
  const res = await fetch(`${baseUrl}/material/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error eliminando material');
  try {
    return await res.json();
  } catch (_e) {
    return { ok: true };
  }
};


