import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlertStyles } from '../styles/AlertStyles';

const { width, height } = Dimensions.get('window');

const Alert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  onConfirm, 
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  showCancel = false,
  icon = null
}) => {
  if (!visible) return null;

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={40} color="#10B981" />;
      case 'error':
        return <Ionicons name="close-circle" size={40} color="#EF4444" />;
      case 'warning':
        return <Ionicons name="warning" size={40} color="#F59E0B" />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={40} color="#3B82F6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#F0FDF4';
      case 'error':
        return '#FEF2F2';
      case 'warning':
        return '#FFFBEB';
      case 'info':
      default:
        return '#F0F9FF';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#BBF7D0';
      case 'error':
        return '#FECACA';
      case 'warning':
        return '#FED7AA';
      case 'info':
      default:
        return '#BAE6FD';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={AlertStyles.overlay}>
        <View style={[
          AlertStyles.container,
          { 
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor()
          }
        ]}>
          {/* Icono */}
          <View style={AlertStyles.iconContainer}>
            {getIcon()}
          </View>

          {/* Título */}
          <Text style={AlertStyles.title}>{title}</Text>

          {/* Mensaje */}
          <Text style={AlertStyles.message}>{message}</Text>

          {/* Botones */}
          <View style={AlertStyles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[AlertStyles.button, AlertStyles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={AlertStyles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                AlertStyles.button, 
                AlertStyles.confirmButton,
                { backgroundColor: type === 'error' ? '#EF4444' : '#8B5CF6' }
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={AlertStyles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Alert;
