import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const kineticButtonVariants = cva(
  "relative overflow-hidden rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "holo-button-primary",
        secondary: "holo-button-secondary",
        cta: "holo-button-cta",
        quantum:
          "bg-gradient-to-r from-voltage-purple to-neon-cyan text-hologram-white font-semibold hover:from-neon-cyan hover:to-electric-lime",
        neural:
          "bg-neural-black border-2 border-plasma-blue text-plasma-blue hover:bg-plasma-blue hover:text-hologram-white",
        hologram:
          "bg-transparent border border-neon-cyan text-neon-cyan backdrop-blur-md hover:bg-neon-cyan hover:text-neural-black",
        energy: "bg-plasma-blue text-hologram-white hover:bg-neon-cyan",
        magnetic:
          "bg-gradient-to-br from-voltage-purple to-plasma-blue text-hologram-white hover:from-neon-cyan hover:to-electric-lime",
      },
      size: {
        sm: "px-4 py-2 text-sm rounded-lg",
        default: "px-8 py-4 text-base",
        lg: "px-10 py-5 text-lg rounded-2xl",
        xl: "px-12 py-6 text-xl rounded-2xl",
        icon: "w-12 h-12 rounded-xl",
      },
      glow: {
        none: "",
        subtle: "",
        intense: "",
        pulse: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      glow: "subtle",
    },
  },
);

export interface KineticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof kineticButtonVariants> {
  asChild?: boolean;
  particles?: boolean;
  hologramFlicker?: boolean;
}

const KineticButton = React.forwardRef<HTMLButtonElement, KineticButtonProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      asChild = false,
      particles = false,
      hologramFlicker = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          kineticButtonVariants({ variant, size, glow, className }),
          hologramFlicker && "animate-hologram-flicker",
        )}
        ref={ref}
        {...props}
      >
        {/* Holographic shimmer effect */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-hologram-white/30 to-transparent -skew-x-12 transform -translate-x-full hover:translate-x-full transition-transform duration-700" />
        </div>

        {/* Particle field effect */}
        {particles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="particle particle-glow absolute animate-float-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>

        {/* Energy flow border */}
        <div className="absolute inset-0 rounded-inherit border-2 border-transparent bg-gradient-to-r from-plasma-blue via-neon-cyan to-electric-lime opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10" />
      </Comp>
    );
  },
);
KineticButton.displayName = "KineticButton";

// Specialized button variants
const QuantumButton = React.forwardRef<
  HTMLButtonElement,
  Omit<KineticButtonProps, "variant">
>(({ className, ...props }, ref) => (
  <KineticButton
    variant="quantum"
    className={cn("relative group", className)}
    ref={ref}
    {...props}
  >
    {/* Quantum field effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-voltage-purple via-transparent to-neon-cyan opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-inherit" />
    {props.children}
  </KineticButton>
));
QuantumButton.displayName = "QuantumButton";

const MagneticButton = React.forwardRef<
  HTMLButtonElement,
  Omit<KineticButtonProps, "variant">
>(({ className, onMouseMove, ...props }, ref) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useImperativeHandle(ref, () => buttonRef.current!);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / 10;
      const deltaY = (e.clientY - centerY) / 10;

      buttonRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;

      onMouseMove?.(e);
    },
    [onMouseMove],
  );

  const handleMouseLeave = React.useCallback(() => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = "translate(0px, 0px) scale(1)";
  }, []);

  return (
    <KineticButton
      variant="magnetic"
      className={cn("transition-transform duration-300", className)}
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
});
MagneticButton.displayName = "MagneticButton";

const EnergyButton = React.forwardRef<
  HTMLButtonElement,
  Omit<KineticButtonProps, "variant"> & {
    intensity?: "low" | "medium" | "high";
  }
>(({ className, intensity = "medium", ...props }, ref) => {
  const intensityClasses = {
    low: "hover:shadow-glow-blue",
    medium: "hover:shadow-glow-cyan animate-energy-pulse",
    high: "hover:shadow-glow-lime animate-energy-pulse shadow-glow-purple",
  };

  return (
    <KineticButton
      variant="energy"
      className={cn(intensityClasses[intensity], className)}
      ref={ref}
      particles={intensity === "high"}
      {...props}
    />
  );
});
EnergyButton.displayName = "EnergyButton";

export {
  KineticButton,
  QuantumButton,
  MagneticButton,
  EnergyButton,
  kineticButtonVariants,
};
