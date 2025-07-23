/*export const formatCardNumber = (value) => {
  return (
    value
      .replace(/\s+/g, "")
      .replace(/[^0-9]/gi, "")
      .match(/.{1,4}/g)
      ?.join(" ") || value
  );
};*/


export const formatCardNumber = (value) => {
  const cleanedValue = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");

  // Validar que el número de tarjeta tenga exactamente 16 dígitos
  if (cleanedValue.length !== 16) {
    return value; // Devolver el valor original si no cumple con la condición
  }

  return cleanedValue.match(/.{1,4}/g)?.join(" ") || value;
};

export const unformatCardNumber = (value) => {
  // Eliminar espacios y asegurarse de que sean exactamente 16 dígitos
  const cleanedValue = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
  
  return cleanedValue.length === 16 ? cleanedValue : value;
};
