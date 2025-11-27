import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-gradient-to-br from-white to-slate-50 px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-black",
        error: "border-red-600 focus:border-red-600 focus:ring-red-600",
        success:
          "border-green-600 focus:border-green-600 focus:ring-green-600",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;
export interface InputProps
  extends InputHTMLProps,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  startIcon?: React.ComponentType<{ className?: string }>;
  endIcon?: React.ComponentType<{ className?: string }>;
}

const ModernInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      label,
      helperText,
      errorMessage,
      startIcon: StartIcon,
      endIcon: EndIcon,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || React.useId();
    const finalVariant = errorMessage ? "error" : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-black mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {StartIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <StartIcon className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant: finalVariant, size, className }),
              StartIcon && "pl-10",
              EndIcon && "pr-10",
              "text-black placeholder:text-gray-500"
            )}
            ref={ref}
            {...props}
          />
          {EndIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <EndIcon className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>
        {(errorMessage || helperText) && (
          <p
            className={cn(
              "mt-2 text-xs",
              errorMessage ? "text-red-500" : "text-slate-500",
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  },
);
ModernInput.displayName = "ModernInput";

// Textarea Component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

const ModernTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      label,
      helperText,
      errorMessage,
      id,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const textareaId = id || React.useId();
    const finalVariant = errorMessage ? "error" : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-black mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          rows={rows}
          className={cn(
            inputVariants({ variant: finalVariant, className }),
            "min-h-20 resize-y text-black placeholder:text-gray-500"
          )}
          ref={ref}
          {...props}
        />
        {(errorMessage || helperText) && (
          <p
            className={cn(
              "mt-2 text-xs",
              errorMessage ? "text-red-500" : "text-slate-500",
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  },
);
ModernTextarea.displayName = "ModernTextarea";

// Select Component
type SelectHTMLProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">;
export interface SelectProps
  extends SelectHTMLProps,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

const ModernSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      errorMessage,
      options,
      placeholder,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || React.useId();
    const finalVariant = errorMessage ? "error" : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-black mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              inputVariants({ variant: finalVariant, size, className }),
              "appearance-none bg-white pr-10 cursor-pointer",
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {(errorMessage || helperText) && (
          <p
            className={cn(
              "mt-2 text-xs",
              errorMessage ? "text-red-500" : "text-slate-500",
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  },
);
ModernSelect.displayName = "ModernSelect";

// Form Field Wrapper
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  ),
);
FormField.displayName = "FormField";

// Input Group Component
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex", className)} {...props} />
  ),
);
InputGroup.displayName = "InputGroup";

// Input Addon Component
export interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  position?: "left" | "right";
}

const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, position = "left", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-3 bg-slate-50 border border-slate-300 text-sm text-slate-500",
        position === "left"
          ? "rounded-l-lg border-r-0"
          : "rounded-r-lg border-l-0",
        className,
      )}
      {...props}
    />
  ),
);
InputAddon.displayName = "InputAddon";

export {
  ModernInput,
  ModernTextarea,
  ModernSelect,
  FormField,
  InputGroup,
  InputAddon,
  inputVariants,
};
