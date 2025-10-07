import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { sharedStyles } from '../components/SharedStyles';
import ActionButton from '../components/ui/ActionButton';

const NuevaCategoria = () => {
  const [nombre, setNombre] = useState('');

  const handleCrearCategoria = () => {
    // Implementar lógica para crear categoría
    console.log('Crear categoría:', nombre);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre de la categoría"
        value={nombre}
        onChangeText={setNombre}
      />
      <ActionButton 
        title="Crear Categoría"
        onPress={handleCrearCategoria}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  }
});

export default NuevaCategoria;
