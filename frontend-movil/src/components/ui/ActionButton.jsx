import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { sharedStyles } from '../SharedStyles';

const ActionButton = ({ onPress, title, style }) => {
  return (
    <TouchableOpacity 
      style={[sharedStyles.actionButton, style]} 
      onPress={onPress}
    >
      <Text style={sharedStyles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
