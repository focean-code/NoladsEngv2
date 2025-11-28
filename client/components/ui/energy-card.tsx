import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const energyCardVariants = cva("energy-card", {
  variants: {
    variant: {
      default: "border-plasma-blue/30",
      premium: "energy-card-premium border-electric-lime/50",
      neural: "border-voltage-purple/40 bg-neural-black/60",
      quantum:
        "border-neon-cyan/40 bg-gradient-to-br from-plasma-blue/5 to-voltage-purple/5",
      holographic:
        "holographic-panel border-hologram-white/20 bg-hologram-white/5",
      pulse: "energy-card-pulse border-plasma-blue/60",
    },
    size: {
      sm: "p-4 rounded-2xl",
      default: "p-6 rounded-3xl",
      lg: "p-8 rounded-3xl",
      xl: "p-10 rounded-3xl",
    },
    glow: {
      none: "",
      subtle: "hover:shadow-glow-blue",
      medium: "hover:shadow-glow-cyan",
      intense: "shadow-glow-purple hover:shadow-glow-lime",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    glow: "subtle",
  },
});

export interface EnergyCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof energyCardVariants> {
  particles?: boolean;
  neuralNetwork?: boolean;
  magneticField?: boolean;
  energyFlow?: boolean;
}

const EnergyCard = React.forwardRef<HTMLDivElement, EnergyCardProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      particles = false,
      neuralNetwork = false,
      magneticField = false,
      energyFlow = false,
      children,
      ...props
    },
    ref,
  ) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => cardRef.current!);

    // Magnetic field effect
    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!magneticField || !cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / 50;
        const deltaY = (e.clientY - centerY) / 50;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg) scale3d(1.02, 1.02, 1.02)`;
      },
      [magneticField],
    );

    const handleMouseLeave = React.useCallback(() => {
      if (!magneticField || !cardRef.current) return;
      cardRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }, [magneticField]);

    return (
      <div
        className={cn(
          energyCardVariants({ variant, size, glow, className }),
          magneticField && "magnetic-element transform-gpu",
          energyFlow && "relative overflow-hidden",
        )}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Neural Network Background */}
        {neuralNetwork && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="neural-bg">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="neural-node animate-pulse-node"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`conn-${i}`}
                  className="neural-connection animate-flow-connection"
                  style={{
                    left: `${Math.random() * 80}%`,
                    top: `${Math.random() * 80}%`,
                    width: `${20 + Math.random() * 60}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Particle Field */}
        {particles && (
          <div className="particle-field absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="particle particle-glow animate-float-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Energy Flow Lines */}
        {energyFlow && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="energy-flow-line absolute"
                style={{
                  top: `${25 + i * 25}%`,
                  width: "100%",
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Magnetic Field Indicator */}
        {magneticField && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-electric-lime rounded-full animate-pulse" />
        )}

        {/* Card Content */}
        <div className="relative z-10">{children}</div>

        {/* Holographic Border Effect */}
        <div className="absolute inset-0 rounded-inherit border border-transparent bg-gradient-to-r from-plasma-blue via-neon-cyan to-electric-lime opacity-0 hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
      </div>
    );
  },
);
EnergyCard.displayName = "EnergyCard";

// Card Components
const EnergyCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 pb-4", className)}
    {...props}
  />
));
EnergyCardHeader.displayName = "EnergyCardHeader";

const EnergyCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    quantum?: boolean;
    glow?: boolean;
  }
>(({ className, quantum = false, glow = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-heading text-2xl font-semibold leading-tight tracking-tight text-hologram-white",
      quantum && "quantum-text",
      glow && "text-glow",
      className,
    )}
    {...props}
  />
));
EnergyCardTitle.displayName = "EnergyCardTitle";

const EnergyCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-base text-hologram-white/70 leading-relaxed",
      className,
    )}
    {...props}
  />
));
EnergyCardDescription.displayName = "EnergyCardDescription";

const EnergyCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pb-4", className)} {...props} />
));
EnergyCardContent.displayName = "EnergyCardContent";

const EnergyCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
EnergyCardFooter.displayName = "EnergyCardFooter";

// Specialized Card Variants
const QuantumCard = React.forwardRef<
  HTMLDivElement,
  Omit<EnergyCardProps, "variant">
>(({ className, ...props }, ref) => (
  <EnergyCard
    variant="quantum"
    className={cn("group relative", className)}
    particles
    neuralNetwork
    ref={ref}
    {...props}
  >
    {/* Quantum interference pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-photon-pink/10 via-transparent to-voltage-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-inherit" />
    {props.children}
  </EnergyCard>
));
QuantumCard.displayName = "QuantumCard";

const NeuralCard = React.forwardRef<
  HTMLDivElement,
  Omit<EnergyCardProps, "variant">
>(({ className, ...props }, ref) => (
  <EnergyCard
    variant="neural"
    className={cn("overflow-hidden", className)}
    neuralNetwork
    energyFlow
    ref={ref}
    {...props}
  />
));
NeuralCard.displayName = "NeuralCard";

const HolographicCard = React.forwardRef<
  HTMLDivElement,
  Omit<EnergyCardProps, "variant">
>(({ className, ...props }, ref) => (
  <EnergyCard
    variant="holographic"
    className={cn("backdrop-blur-xl", className)}
    magneticField
    ref={ref}
    {...props}
  >
    {/* Holographic shimmer */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-hologram-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    {props.children}
  </EnergyCard>
));
HolographicCard.displayName = "HolographicCard";

export {
  EnergyCard,
  EnergyCardHeader,
  EnergyCardFooter,
  EnergyCardTitle,
  EnergyCardDescription,
  EnergyCardContent,
  QuantumCard,
  NeuralCard,
  HolographicCard,
  energyCardVariants,
};
