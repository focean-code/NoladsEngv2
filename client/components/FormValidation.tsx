/**
 * Enhanced Form Validation System
 * Comprehensive validation with visual feedback and accessibility
 */

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Validation types
export type ValidationRule = {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
};

export type FieldValidation = {
  value: string;
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  errors: string[];
  isFocused: boolean;
};

// Validation rules
export const VALIDATION_RULES = {
  required: (message = 'This field is required'): ValidationRule => ({
    type: 'required',
    message
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    type: 'email',
    message
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `Must be at least ${length} characters`
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `Must be no more than ${length} characters`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message
  }),
  
  custom: (validator: (value: string) => boolean, message: string): ValidationRule => ({
    type: 'custom',
    validator,
    message
  })
};

// Export validators for backward compatibility
export const validators = VALIDATION_RULES;

// Compose multiple validators
export const composeValidators = (...rules: ValidationRule[]): ValidationRule[] => {
  return rules;
};

// FormField component for backward compatibility
export const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}> = ({ label, children, error, required, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

// Validation functions
const validateField = (value: string, rules: ValidationRule[]): string[] => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    let isValid = true;
    
    switch (rule.type) {
      case 'required':
        isValid = value.trim().length > 0;
        break;
        
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
        
      case 'minLength':
        isValid = value.length >= (rule.value || 0);
        break;
        
      case 'maxLength':
        isValid = value.length <= (rule.value || Infinity);
        break;
        
      case 'pattern':
        isValid = (rule.value as RegExp).test(value);
        break;
        
      case 'custom':
        isValid = rule.validator ? rule.validator(value) : true;
        break;
    }
    
    if (!isValid) {
      errors.push(rule.message);
    }
  }
  
  return errors;
};

// Enhanced Input Component
interface EnhancedInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  rules?: ValidationRule[];
  disabled?: boolean;
  className?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  autoComplete?: string;
  required?: boolean;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  rules = [],
  disabled = false,
  className = '',
  helperText,
  showPasswordToggle = false,
  autoComplete,
  required = false
}) => {
  const [fieldState, setFieldState] = useState<FieldValidation>({
    value,
    isValid: true,
    isTouched: false,
    isDirty: false,
    errors: [],
    isFocused: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Update field state when value changes
  useEffect(() => {
    setFieldState(prev => ({
      ...prev,
      value,
      isDirty: value !== ''
    }));
  }, [value]);

  // Validate on value change with debounce
  useEffect(() => {
    if (fieldState.isTouched && rules.length > 0) {
      setIsValidating(true);
      const timeoutId = setTimeout(() => {
        const errors = validateField(value, rules);
        setFieldState(prev => ({
          ...prev,
          isValid: errors.length === 0,
          errors
        }));
        setIsValidating(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [value, fieldState.isTouched, rules]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setFieldState(prev => ({ ...prev, isTouched: true }));
    onBlur?.();
  };

  const handleFocus = () => {
    setFieldState(prev => ({ ...prev, isFocused: true }));
    onFocus?.();
  };

  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
    
    if (fieldState.isTouched && fieldState.isDirty) {
      if (fieldState.isValid) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      } else {
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      }
    }
    
    return null;
  };

  const getStatusColor = () => {
    if (isValidating) return 'border-blue-500';
    if (fieldState.isTouched && fieldState.isDirty) {
      return fieldState.isValid ? 'border-green-500' : 'border-red-500';
    }
    return fieldState.isFocused ? 'border-blue-500' : 'border-slate-300';
  };

  const getStatusBg = () => {
    if (isValidating) return 'bg-blue-50';
    if (fieldState.isTouched && fieldState.isDirty) {
      return fieldState.isValid ? 'bg-green-50' : 'bg-red-50';
    }
    return fieldState.isFocused ? 'bg-blue-50' : 'bg-white';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          ref={inputRef}
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            'disabled:bg-slate-100 disabled:cursor-not-allowed',
            'placeholder:text-slate-400',
            getStatusColor(),
            getStatusBg()
          )}
          aria-invalid={fieldState.isTouched && !fieldState.isValid}
          aria-describedby={`${label}-error ${label}-helper`}
        />

        {/* Status Icon */}
        {getStatusIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        )}

        {/* Password Toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p id={`${label}-helper`} className="text-sm text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {helperText}
        </p>
      )}

      {/* Error Messages */}
      {fieldState.isTouched && fieldState.errors.length > 0 && (
        <div id={`${label}-error`} className="space-y-1" role="alert">
          {fieldState.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Success Message */}
      {fieldState.isTouched && fieldState.isDirty && fieldState.isValid && (
        <p className="text-sm text-green-600 flex items-center gap-1 animate-fade-in">
          <CheckCircle className="w-3 h-3" />
          Looks good!
        </p>
      )}
    </div>
  );
};

// Enhanced Textarea Component
interface EnhancedTextareaProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  rules?: ValidationRule[];
  disabled?: boolean;
  className?: string;
  helperText?: string;
  rows?: number;
  required?: boolean;
}

export const EnhancedTextarea: React.FC<EnhancedTextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  rules = [],
  disabled = false,
  className = '',
  helperText,
  rows = 4,
  required = false
}) => {
  const [fieldState, setFieldState] = useState<FieldValidation>({
    value,
    isValid: true,
    isTouched: false,
    isDirty: false,
    errors: [],
    isFocused: false
  });

  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setFieldState(prev => ({
      ...prev,
      value,
      isDirty: value !== ''
    }));
  }, [value]);

  useEffect(() => {
    if (fieldState.isTouched && rules.length > 0) {
      setIsValidating(true);
      const timeoutId = setTimeout(() => {
        const errors = validateField(value, rules);
        setFieldState(prev => ({
          ...prev,
          isValid: errors.length === 0,
          errors
        }));
        setIsValidating(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [value, fieldState.isTouched, rules]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setFieldState(prev => ({ ...prev, isTouched: true }));
    onBlur?.();
  };

  const handleFocus = () => {
    setFieldState(prev => ({ ...prev, isFocused: true }));
    onFocus?.();
  };

  const getStatusColor = () => {
    if (isValidating) return 'border-blue-500';
    if (fieldState.isTouched && fieldState.isDirty) {
      return fieldState.isValid ? 'border-green-500' : 'border-red-500';
    }
    return fieldState.isFocused ? 'border-blue-500' : 'border-slate-300';
  };

  const getStatusBg = () => {
    if (isValidating) return 'bg-blue-50';
    if (fieldState.isTouched && fieldState.isDirty) {
      return fieldState.isValid ? 'bg-green-50' : 'bg-red-50';
    }
    return fieldState.isFocused ? 'bg-blue-50' : 'bg-white';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            'disabled:bg-slate-100 disabled:cursor-not-allowed',
            'placeholder:text-slate-400',
            getStatusColor(),
            getStatusBg()
          )}
          aria-invalid={fieldState.isTouched && !fieldState.isValid}
          aria-describedby={`${label}-error ${label}-helper`}
        />

        {/* Character Counter */}
        {rules.some(rule => rule.type === 'maxLength') && (
          <div className="absolute bottom-2 right-2 text-xs text-slate-400">
            {value.length}/{rules.find(rule => rule.type === 'maxLength')?.value || 0}
          </div>
        )}
      </div>

      {helperText && (
        <p id={`${label}-helper`} className="text-sm text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {helperText}
        </p>
      )}

      {fieldState.isTouched && fieldState.errors.length > 0 && (
        <div id={`${label}-error`} className="space-y-1" role="alert">
          {fieldState.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          ))}
        </div>
      )}

      {fieldState.isTouched && fieldState.isDirty && fieldState.isValid && (
        <p className="text-sm text-green-600 flex items-center gap-1 animate-fade-in">
          <CheckCircle className="w-3 h-3" />
          Looks good!
        </p>
      )}
    </div>
  );
};

// Form validation hook
export const useFormValidation = (initialValues: Record<string, string>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const setFieldTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field: string, rules: ValidationRule[]) => {
    const fieldErrors = validateField(values[field], rules);
    setErrors(prev => ({ ...prev, [field]: fieldErrors }));
    return fieldErrors.length === 0;
  };

  const validateForm = (validationSchema: Record<string, ValidationRule[]>) => {
    const newErrors: Record<string, string[]> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const fieldErrors = validateField(values[field], validationSchema[field]);
      if (fieldErrors.length > 0) {
        newErrors[field] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    setIsSubmitting
  };
};

export default EnhancedInput;