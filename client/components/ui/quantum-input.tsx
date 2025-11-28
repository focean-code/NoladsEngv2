import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const quantumInputVariants = cva("quantum-input peer", {
  variants: {
    variant: {
      default: "border-plasma-blue/30 focus:border-neon-cyan",
      error: "border-quantum-orange focus:border-quantum-orange",
      success: "border-electric-lime focus:border-electric-lime",
      neural: "border-voltage-purple/50 focus:border-voltage-purple",
    },
    size: {
      sm: "py-2 text-sm",
      default: "py-4 text-base",
      lg: "py-5 text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface QuantumInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof quantumInputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  particles?: boolean;
  hologram?: boolean;
}

const QuantumInput = React.forwardRef<HTMLInputElement, QuantumInputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      label,
      helperText,
      errorText,
      particles = false,
      hologram = false,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = React.useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setHasValue(e.target.value.length > 0);
      },
      [],
    );

    const finalVariant = errorText ? "error" : variant;

    return (
      <div className="relative w-full group">
        {/* Holographic background */}
        {hologram && (
          <div className="absolute inset-0 bg-gradient-to-r from-plasma-blue/10 via-voltage-purple/10 to-neon-cyan/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        )}

        {/* Particle field */}
        {particles && isFocused && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 bg-electric-lime rounded-full animate-float-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Input field */}
        <input
          type={type}
          className={cn(
            quantumInputVariants({ variant: finalVariant, size, className }),
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=""
          {...props}
        />

        {/* Floating label */}
        {label && (
          <label
            className={cn(
              "quantum-label",
              (isFocused || hasValue || props.value) && "quantum-label-active",
              errorText && "text-quantum-orange",
              finalVariant === "success" && "text-electric-lime",
              finalVariant === "neural" && "text-voltage-purple",
            )}
          >
            {label}
          </label>
        )}

        {/* Energy flow line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-plasma-blue via-neon-cyan to-electric-lime transform scale-x-0 transition-transform duration-300 origin-left",
            isFocused && "scale-x-100",
          )}
        />

        {/* Helper/Error text */}
        {(errorText || helperText) && (
          <p
            className={cn(
              "mt-2 text-sm transition-colors duration-200",
              errorText
                ? "text-quantum-orange"
                : "text-hologram-white/60 group-focus-within:text-neon-cyan",
            )}
          >
            {errorText || helperText}
          </p>
        )}

        {/* Glow effect on focus */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none",
            isFocused && !errorText && "shadow-glow-cyan",
            isFocused && errorText && "shadow-glow-orange",
          )}
        />
      </div>
    );
  },
);
QuantumInput.displayName = "QuantumInput";

// Quantum Textarea Component
export interface QuantumTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof quantumInputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  particles?: boolean;
  hologram?: boolean;
}

const QuantumTextarea = React.forwardRef<
  HTMLTextAreaElement,
  QuantumTextareaProps
>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      errorText,
      particles = false,
      hologram = false,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = React.useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        setHasValue(e.target.value.length > 0);
      },
      [],
    );

    const finalVariant = errorText ? "error" : variant;

    return (
      <div className="relative w-full group">
        {/* Holographic background */}
        {hologram && (
          <div className="absolute inset-0 bg-gradient-to-r from-plasma-blue/10 via-voltage-purple/10 to-neon-cyan/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        )}

        {/* Particle field */}
        {particles && isFocused && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 bg-electric-lime rounded-full animate-float-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Textarea field */}
        <textarea
          className={cn(
            "quantum-input peer min-h-24 resize-y",
            quantumInputVariants({ variant: finalVariant, size, className }),
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=""
          {...props}
        />

        {/* Floating label */}
        {label && (
          <label
            className={cn(
              "quantum-label",
              (isFocused || hasValue || props.value) && "quantum-label-active",
              errorText && "text-quantum-orange",
              finalVariant === "success" && "text-electric-lime",
              finalVariant === "neural" && "text-voltage-purple",
            )}
          >
            {label}
          </label>
        )}

        {/* Energy flow line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-plasma-blue via-neon-cyan to-electric-lime transform scale-x-0 transition-transform duration-300 origin-left",
            isFocused && "scale-x-100",
          )}
        />

        {/* Helper/Error text */}
        {(errorText || helperText) && (
          <p
            className={cn(
              "mt-2 text-sm transition-colors duration-200",
              errorText
                ? "text-quantum-orange"
                : "text-hologram-white/60 group-focus-within:text-neon-cyan",
            )}
          >
            {errorText || helperText}
          </p>
        )}

        {/* Glow effect on focus */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none",
            isFocused && !errorText && "shadow-glow-cyan",
            isFocused && errorText && "shadow-glow-orange",
          )}
        />
      </div>
    );
  },
);
QuantumTextarea.displayName = "QuantumTextarea";

// Quantum Select Component
export interface QuantumSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof quantumInputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  options: { value: string; label: string }[];
  hologram?: boolean;
}

const QuantumSelect = React.forwardRef<HTMLSelectElement, QuantumSelectProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      errorText,
      options,
      hologram = false,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = React.useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLSelectElement>) => {
        setIsFocused(false);
        setHasValue(e.target.value.length > 0);
      },
      [],
    );

    const finalVariant = errorText ? "error" : variant;

    return (
      <div className="relative w-full group">
        {/* Holographic background */}
        {hologram && (
          <div className="absolute inset-0 bg-gradient-to-r from-plasma-blue/10 via-voltage-purple/10 to-neon-cyan/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        )}

        {/* Select field */}
        <select
          className={cn(
            quantumInputVariants({ variant: finalVariant, size, className }),
            "appearance-none cursor-pointer bg-neural-black",
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        >
          <option value="" disabled>
            {label ? `Select ${label.toLowerCase()}` : "Select option"}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-neural-black text-hologram-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-neon-cyan transition-transform duration-200 group-focus-within:rotate-180"
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

        {/* Floating label */}
        {label && (
          <label
            className={cn(
              "quantum-label",
              (isFocused || hasValue || props.value) && "quantum-label-active",
              errorText && "text-quantum-orange",
              finalVariant === "success" && "text-electric-lime",
              finalVariant === "neural" && "text-voltage-purple",
            )}
          >
            {label}
          </label>
        )}

        {/* Energy flow line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-plasma-blue via-neon-cyan to-electric-lime transform scale-x-0 transition-transform duration-300 origin-left",
            isFocused && "scale-x-100",
          )}
        />

        {/* Helper/Error text */}
        {(errorText || helperText) && (
          <p
            className={cn(
              "mt-2 text-sm transition-colors duration-200",
              errorText
                ? "text-quantum-orange"
                : "text-hologram-white/60 group-focus-within:text-neon-cyan",
            )}
          >
            {errorText || helperText}
          </p>
        )}

        {/* Glow effect on focus */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none",
            isFocused && !errorText && "shadow-glow-cyan",
            isFocused && errorText && "shadow-glow-orange",
          )}
        />
      </div>
    );
  },
);
QuantumSelect.displayName = "QuantumSelect";

export { QuantumInput, QuantumTextarea, QuantumSelect, quantumInputVariants };
