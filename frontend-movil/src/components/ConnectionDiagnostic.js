// components/ConnectionDiagnostic.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const ConnectionDiagnostic = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const testEndpoints = async () => {
    const endpoints = [
      { url: 'http://192.168.0.9:4000/api/health', name: 'Health Check' },
      { url: 'http://192.168.0.9:4000/api/products', name: 'Products API' },
      { url: 'http://10.0.2.2:4000/api/health', name: 'Health Check (Android Emulator)' },
      { url: 'http://10.0.2.2:4000/api/products', name: 'Products API (Android Emulator)' },
      { url: 'http://localhost:4000/api/health', name: 'Health Check (iOS Simulator)' },
      { url: 'http://localhost:4000/api/products', name: 'Products API (iOS Simulator)' },
    ];

    const newResults = [];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await axios.get(endpoint.url, { timeout: 5000 });
        const responseTime = Date.now() - startTime;
        
        newResults.push({
          ...endpoint,
          status: '✅ CONEXIÓN EXITOSA',
          time: `${responseTime}ms`,
          data: response.data ? `Datos recibidos: ${JSON.stringify(response.data).substring(0, 100)}...` : 'Sin datos'
        });
      } catch (error) {
        newResults.push({
          ...endpoint,
          status: '❌ ERROR',
          time: 'N/A',
          data: `Error: ${error.message}`
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Probando conexiones...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Diagnóstico de Conexión</Text>
      <Text style={styles.subtitle}>Resultados de las pruebas de conexión:</Text>
      
      {results.map((result, index) => (
        <View key={index} style={styles.resultCard}>
          <Text style={styles.endpointName}>{result.name}</Text>
          <Text style={styles.url}>{result.url}</Text>
          <Text style={result.status.includes('✅') ? styles.success : styles.error}>
            {result.status}
          </Text>
          <Text style={styles.details}>Tiempo: {result.time}</Text>
          <Text style={styles.details}>{result.data}</Text>
        </View>
      ))}
      
      <Button title="Volver a probar" onPress={testEndpoints} />
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Posibles soluciones:</Text>
        <Text style={styles.tip}>1. Verifica que el servidor esté ejecutándose en el puerto 4000</Text>
        <Text style={styles.tip}>2. Asegúrate de que la IP 192.168.0.9 sea la correcta para tu red</Text>
        <Text style={styles.tip}>3. Si usas emulador Android, prueba con 10.0.2.2</Text>
        <Text style={styles.tip}>4. Si usas emulador iOS, prueba con localhost</Text>
        <Text style={styles.tip}>5. Verifica que el firewall no esté bloqueando el puerto 4000</Text>
        <Text style={styles.tip}>6. Asegúrate de que el dispositivo y servidor estén en la misma red</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center'
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  endpointName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  success: {
    color: 'green',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    fontWeight: 'bold'
  },
  details: {
    fontSize: 12,
    marginTop: 4
  },
  tipsContainer: {
    marginTop: 20,
    backgroundColor: '#e8f4f8',
    padding: 16,
    borderRadius: 8
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  tip: {
    fontSize: 14,
    marginBottom: 8
  }
});

export default ConnectionDiagnostic;