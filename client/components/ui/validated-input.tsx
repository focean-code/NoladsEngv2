import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isValid?: boolean;
  helperText?: string;
  required?: boolean;
  onValidation?: (isValid: boolean, error?: string) => void;
  validator?: (value: string) => { isValid: boolean; error?: string };
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  isValid,
  helperText,
  required = false,
  onValidation,
  validator,
  className,
  id,
  ...props
}) => {
  const [internalError, setInternalError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isInternalValid, setIsInternalValid] = useState<boolean | undefined>();

  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = error || internalError;
  const showValid = (isValid ?? isInternalValid) && touched && !hasError;

  useEffect(() => {
    if (validator && props.value && touched) {
      const result = validator(String(props.value));
      setInternalError(result.error || '');
      setIsInternalValid(result.isValid);
      onValidation?.(result.isValid, result.error);
    }
  }, [props.value, validator, onValidation, touched]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    props.onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-sm font-semibold text-black"
      >
        {label}
        {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <input
          {...props}
          id={inputId}
          onBlur={handleBlur}
          className={cn(
            'w-full px-4 py-3 border rounded-lg transition-colors bg-gradient-to-br from-white to-slate-50 text-black placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-black',
            'disabled:bg-slate-100 disabled:text-gray-500',
            hasError && 'border-red-600 focus:ring-red-600 focus:border-red-600',
            showValid && 'border-green-600 focus:ring-green-600 focus:border-green-600',
            !hasError && !showValid && 'border-black',
            className
          )}
          aria-invalid={!!hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : undefined
          }
        />
        
        {/* Validation Icons */}
        {touched && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {hasError && (
              <AlertCircle 
                className="w-5 h-5 text-red-500" 
                aria-hidden="true"
              />
            )}
            {showValid && (
              <CheckCircle 
                className="w-5 h-5 text-green-500" 
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {hasError}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <p 
          id={`${inputId}-helper`}
          className="text-sm text-gray-700"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  isValid?: boolean;
  helperText?: string;
  required?: boolean;
  onValidation?: (isValid: boolean, error?: string) => void;
  validator?: (value: string) => { isValid: boolean; error?: string };
}

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  label,
  error,
  isValid,
  helperText,
  required = false,
  onValidation,
  validator,
  className,
  id,
  ...props
}) => {
  const [internalError, setInternalError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isInternalValid, setIsInternalValid] = useState<boolean | undefined>();

  const inputId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = error || internalError;
  const showValid = (isValid ?? isInternalValid) && touched && !hasError;

  useEffect(() => {
    if (validator && props.value && touched) {
      const result = validator(String(props.value));
      setInternalError(result.error || '');
      setIsInternalValid(result.isValid);
      onValidation?.(result.isValid, result.error);
    }
  }, [props.value, validator, onValidation, touched]);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true);
    props.onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-sm font-semibold text-black"
      >
        {label}
        {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <textarea
          {...props}
          id={inputId}
          onBlur={handleBlur}
          className={cn(
            'w-full px-4 py-3 border rounded-lg transition-colors resize-vertical bg-gradient-to-br from-white to-slate-50 text-black placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-black',
            'disabled:bg-slate-100 disabled:text-gray-500',
            hasError && 'border-red-600 focus:ring-red-600 focus:border-red-600',
            showValid && 'border-green-600 focus:ring-green-600 focus:border-green-600',
            !hasError && !showValid && 'border-black',
            className
          )}
          aria-invalid={!!hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : undefined
          }
        />
      </div>

      {/* Error Message */}
      {hasError && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {hasError}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <p 
          id={`${inputId}-helper`}
          className="text-sm text-gray-700"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};