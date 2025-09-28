import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import storeConfigService from '../services/storeConfigService';
import { StockLimitesStyles } from '../components/styles/StockLimitesStyles';
import AlertComponent from '../components/ui/Alert';

const StockLimites = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);

  // Estados para los campos del formulario
  const [isOrderLimitActive, setIsOrderLimitActive] = useState(true);
  const [weeklyMaxOrders, setWeeklyMaxOrders] = useState('');
  const [isGlobalStockLimitActive, setIsGlobalStockLimitActive] = useState(true);
  const [defaultMaxStock, setDefaultMaxStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [lowStockEnabled, setLowStockEnabled] = useState(true);
  const [orderLimitReachedEnabled, setOrderLimitReachedEnabled] = useState(true);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const showAlert = (title, message, type = 'info', options = {}) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm: options.onConfirm || (() => setAlert(prev => ({ ...prev, visible: false }))),
      onCancel: options.onCancel || (() => setAlert(prev => ({ ...prev, visible: false }))),
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: options.showCancel || false,
    });
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      // Primero probar la autenticación
      console.log('🔐 Probando autenticación...');
      try {
        await storeConfigService.testAuth();
        console.log('✅ Autenticación exitosa');
      } catch (authError) {
        console.error('❌ Error de autenticación:', authError);
        showAlert('Error de Autenticación', 'No tienes permisos para acceder a esta configuración. Por favor, inicia sesión como administrador.', 'error');
        return;
      }
      
      // Si la autenticación es exitosa, cargar la configuración
      console.log('📋 Cargando configuración...');
      const response = await storeConfigService.getStoreConfig();
      console.log('Respuesta del servidor:', response);
      
      if (response.success) {
        const fetchedConfig = response.data;
        setConfig(fetchedConfig);
        setIsOrderLimitActive(fetchedConfig.orderLimits.isOrderLimitActive);
        setWeeklyMaxOrders(fetchedConfig.orderLimits.weeklyMaxOrders?.toString() || '');
        setIsGlobalStockLimitActive(fetchedConfig.stockLimits.isGlobalStockLimitActive);
        setDefaultMaxStock(fetchedConfig.stockLimits.defaultMaxStock?.toString() || '');
        setLowStockThreshold(fetchedConfig.stockLimits.lowStockThreshold?.toString() || '');
        setLowStockEnabled(fetchedConfig.notifications.lowStockEnabled);
        setOrderLimitReachedEnabled(fetchedConfig.notifications.orderLimitReachedEnabled);
        console.log('✅ Configuración cargada exitosamente:', fetchedConfig);
      } else {
        throw new Error(response.message || 'Error cargando configuración');
      }
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      showAlert('Error', `No se pudo cargar la configuración de la tienda: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      const configData = {
        orderLimits: {
          isOrderLimitActive,
          weeklyMaxOrders: parseInt(weeklyMaxOrders) || 0,
        },
        stockLimits: {
          isGlobalStockLimitActive,
          defaultMaxStock: parseInt(defaultMaxStock) || 0,
          lowStockThreshold: parseInt(lowStockThreshold) || 0,
        },
        notifications: {
          lowStockEnabled,
          orderLimitReachedEnabled,
        },
      };

      console.log('Enviando configuración:', configData);
      const response = await storeConfigService.updateStoreConfig(configData);
      console.log('Respuesta del servidor:', response);
      
      if (response.success) {
        showAlert('Éxito', 'Configuración guardada correctamente.', 'success');
        setConfig(response.data);
        console.log('Configuración actualizada exitosamente');
      } else {
        throw new Error(response.message || 'Error guardando configuración');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showAlert('Error', `No se pudo guardar la configuración de la tienda: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={StockLimitesStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={StockLimitesStyles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <View style={StockLimitesStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={StockLimitesStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={StockLimitesStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={StockLimitesStyles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView style={StockLimitesStyles.scrollViewContent}>
        {/* Sección de Límites de Pedidos */}
        <View style={StockLimitesStyles.section}>
          <Text style={StockLimitesStyles.sectionTitle}>Límites de Pedidos Semanales</Text>
          <View style={StockLimitesStyles.settingItem}>
            <Text style={StockLimitesStyles.settingLabel}>Activar Límite de Pedidos</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#8B5CF6' }}
              thumbColor={isOrderLimitActive ? '#F4F3F4' : '#F4F3F4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsOrderLimitActive}
              value={isOrderLimitActive}
            />
          </View>
          {isOrderLimitActive && (
            <View style={StockLimitesStyles.inputGroup}>
              <Text style={StockLimitesStyles.inputLabel}>Máximo de Pedidos por Semana</Text>
              <TextInput
                style={StockLimitesStyles.input}
                keyboardType="numeric"
                value={weeklyMaxOrders}
                onChangeText={setWeeklyMaxOrders}
                placeholder="Ej: 15"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={StockLimitesStyles.currentOrdersText}>
                Pedidos actuales esta semana: {config?.orderLimits?.currentWeekOrders || 0}
              </Text>
            </View>
          )}
        </View>

        {/* Sección de Límites de Stock Global */}
        <View style={StockLimitesStyles.section}>
          <Text style={StockLimitesStyles.sectionTitle}>Límites de Stock Global</Text>
          <View style={StockLimitesStyles.settingItem}>
            <Text style={StockLimitesStyles.settingLabel}>Activar Límite de Stock Global</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#8B5CF6' }}
              thumbColor={isGlobalStockLimitActive ? '#F4F3F4' : '#F4F3F4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsGlobalStockLimitActive}
              value={isGlobalStockLimitActive}
            />
          </View>
          {isGlobalStockLimitActive && (
            <>
              <View style={StockLimitesStyles.inputGroup}>
                <Text style={StockLimitesStyles.inputLabel}>Stock Máximo por Defecto</Text>
                <TextInput
                  style={StockLimitesStyles.input}
                  keyboardType="numeric"
                  value={defaultMaxStock}
                  onChangeText={setDefaultMaxStock}
                  placeholder="Ej: 100"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={StockLimitesStyles.inputGroup}>
                <Text style={StockLimitesStyles.inputLabel}>Umbral de Stock Bajo</Text>
                <TextInput
                  style={StockLimitesStyles.input}
                  keyboardType="numeric"
                  value={lowStockThreshold}
                  onChangeText={setLowStockThreshold}
                  placeholder="Ej: 5"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </>
          )}
        </View>

        {/* Sección de Notificaciones */}
        <View style={StockLimitesStyles.section}>
          <Text style={StockLimitesStyles.sectionTitle}>Notificaciones</Text>
          <View style={StockLimitesStyles.settingItem}>
            <Text style={StockLimitesStyles.settingLabel}>Notificar Stock Bajo</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#8B5CF6' }}
              thumbColor={lowStockEnabled ? '#F4F3F4' : '#F4F3F4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setLowStockEnabled}
              value={lowStockEnabled}
            />
          </View>
          <View style={StockLimitesStyles.settingItem}>
            <Text style={StockLimitesStyles.settingLabel}>Notificar Límite de Pedidos Alcanzado</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#8B5CF6' }}
              thumbColor={orderLimitReachedEnabled ? '#F4F3F4' : '#F4F3F4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setOrderLimitReachedEnabled}
              value={orderLimitReachedEnabled}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[StockLimitesStyles.saveButton, saving && StockLimitesStyles.saveButtonDisabled]}
          onPress={saveConfig}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={StockLimitesStyles.saveButtonText}>Guardar Configuración</Text>
          )}
        </TouchableOpacity>

              </ScrollView>

              {/* Componente de alerta unificado */}
              <AlertComponent
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onConfirm={alert.onConfirm}
                onCancel={alert.onCancel}
                confirmText={alert.confirmText}
                cancelText={alert.cancelText}
                showCancel={alert.showCancel}
              />
            </View>
          );
        };

        export default StockLimites;
