import React from 'react';
import ValidationMessage from './ValidationMessage';

const InputField = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  label,
  required = false,
  min,
  max,
  step,
  maxLength,
  icon,
  error,
  success,
  validationState,
  className = "",
  disabled = false,
  autoComplete,
  ...props
}) => {
  const getInputClassName = () => {
    let classes = 'input';
    
    if (icon) classes += ' with-icon';
    if (validationState === 'error') classes += ' error';
    if (validationState === 'success') classes += ' success';
    if (className) classes += ` ${className}`;
    
    return classes;
  };

  const getInputGroupClassName = () => {
    let classes = 'input-group';
    
    if (validationState === 'error') classes += ' error';
    if (validationState === 'success') classes += ' success';
    
    return classes;
  };

  return (
    <div className={getInputGroupClassName()}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {icon && (
          <div className="input-icon">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          disabled={disabled}
          autoComplete={autoComplete}
          className={getInputClassName()}
          placeholder={placeholder}
          {...props}
        />
      </div>
      
      <ValidationMessage 
        type={validationState === 'error' ? 'error' : 'success'} 
        message={error || success} 
        show={!!(error || success)} 
      />
    </div>
  );
};

export default InputField;
