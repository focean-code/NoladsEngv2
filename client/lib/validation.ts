import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const phoneSchema = z
  .string()
  .regex(/^(?:\+?[1-9]\d{6,14}|0\d{9,14})$/, 'Please enter a valid phone number');
export const requiredStringSchema = z.string().min(1, 'This field is required');

// Contact form validation
export const contactFormSchema = z.object({
  firstName: requiredStringSchema.min(2, 'First name must be at least 2 characters'),
  lastName: requiredStringSchema.min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  company: requiredStringSchema.min(2, 'Company name must be at least 2 characters'),
  position: z.string().optional(),
  inquiryType: requiredStringSchema,
  project: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  message: requiredStringSchema.min(10, 'Message must be at least 10 characters'),
  newsletter: z.boolean().optional()
});

// Login form validation
export const loginFormSchema = z.object({
  username: requiredStringSchema.min(3, 'Username must be at least 3 characters'),
  password: requiredStringSchema.min(6, 'Password must be at least 6 characters')
});

// Quote form validation
export const quoteFormSchema = z.object({
  projectName: requiredStringSchema.min(3, 'Project name must be at least 3 characters'),
  description: requiredStringSchema.min(10, 'Description must be at least 10 characters'),
  timeline: requiredStringSchema,
  budget: requiredStringSchema,
  requirements: z.array(z.string()).min(1, 'Please select at least one requirement'),
  contactInfo: z.object({
    name: requiredStringSchema,
    email: emailSchema,
    phone: phoneSchema.optional().or(z.literal('')),
    company: requiredStringSchema
  })
});

// Validation helper functions
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown) => {
  try {
    schema.parse(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid input' };
    }
    return { isValid: false, error: 'Validation error' };
  }
};

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    const validData = schema.parse(data);
    return { isValid: true, data: validData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, data: null, errors };
    }
    return { isValid: false, data: null, errors: { general: 'Validation error' } };
  }
};

// Custom validation hooks
export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = (data: unknown) => validateForm(schema, data);
  const validateField = (fieldName: string, value: unknown) => {
    try {
      const fieldSchema = (schema as any).shape[fieldName];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return { isValid: true, error: null };
      }
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0]?.message || 'Invalid input' };
      }
      return { isValid: false, error: 'Validation error' };
    }
  };

  return { validate, validateField };
};
