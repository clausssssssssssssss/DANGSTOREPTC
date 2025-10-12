// src/components/Ventas/VentasMetasConfig.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VentasMetasConfig = ({ metaActual, onGuardarMeta }) => {
  const [nuevaMeta, setNuevaMeta] = useState(metaActual.toString());
  const [editando, setEditando] = useState(false);

  const handleGuardar = () => {
    const monto = parseFloat(nuevaMeta);
    
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido mayor a 0');
      return;
    }

    Alert.alert(
      'Confirmar cambio',
      `¿Deseas cambiar la meta semanal de $${metaActual.toFixed(2)} a $${monto.toFixed(2)}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            onGuardarMeta(monto);
            setEditando(false);
          },
        },
      ]
    );
  };

  const handleCancelar = () => {
    setNuevaMeta(metaActual.toString());
    setEditando(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="flag" size={24} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Meta Semanal</Text>
      </View>

      {/* Descripción */}
      <Text style={styles.descripcion}>
        Configura tu objetivo de ventas semanal. Esta meta se usa para calcular tu progreso en el dashboard.
      </Text>

      {/* Card de Meta Actual */}
      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Meta Actual</Text>
        
        {!editando ? (
          <View style={styles.metaDisplay}>
            <Text style={styles.metaMonto}>${metaActual.toFixed(2)}</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditando(true)}
            >
              <Ionicons name="pencil" size={20} color="white" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={styles.input}
                value={nuevaMeta}
                onChangeText={setNuevaMeta}
                keyboardType="decimal-pad"
                placeholder="0.00"
                autoFocus
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelar}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleGuardar}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Sugerencias rápidas */}
      {editando && (
        <View style={styles.quickOptions}>
          <Text style={styles.quickOptionsTitle}>Sugerencias rápidas:</Text>
          <View style={styles.quickButtonsRow}>
            {[50, 100, 200, 500].map((valor) => (
              <TouchableOpacity
                key={valor}
                style={styles.quickButton}
                onPress={() => setNuevaMeta(valor.toString())}
              >
                <Text style={styles.quickButtonText}>${valor}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <Text style={styles.infoText}>
          Puedes cambiar tu meta en cualquier momento. Los cambios se reflejarán inmediatamente en el dashboard.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  metaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  metaDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaMonto: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  editContainer: {
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputPrefix: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  quickOptions: {
    marginBottom: 20,
  },
  quickOptionsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default VentasMetasConfig;