import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border bg-white text-slate-950 shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-slate-200",
        elevated: "border-slate-200 shadow-md",
        interactive:
          "border-slate-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300",
        featured:
          "border-blue-200 bg-gradient-to-br from-blue-50 to-white ring-1 ring-blue-100",
        gradient: "bg-gradient-to-br from-white to-slate-50 border-slate-200",
        outline: "border-2 border-slate-200 bg-transparent",
        ghost: "border-transparent bg-slate-50/50",
      },
      padding: {
        none: "p-0",
        sm: "p-3.5",
        default: "p-5",
        lg: "p-7",
        xl: "p-8",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-lg",
        default: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      rounded: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean;
  loading?: boolean;
}

const ModernCard = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      rounded,
      hover = false,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding, rounded, className }),
        hover && "hover:shadow-md hover:-translate-y-0.5",
        loading && "animate-pulse",
      )}
      {...props}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  ),
);
ModernCard.displayName = "ModernCard";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Card Grid Component
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: "sm" | "default" | "lg";
}

const CardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  ({ className, cols = 3, gap = "default", ...props }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    };

    const gridGap = {
      sm: "gap-3.5",
      default: "gap-5",
      lg: "gap-7",
    };

    return (
      <div
        ref={ref}
        className={cn("grid", gridCols[cols], gridGap[gap], className)}
        {...props}
      />
    );
  },
);
CardGrid.displayName = "CardGrid";

// Service Card Component
export interface ServiceCardProps extends CardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features?: string[];
  action?: React.ReactNode;
  size?: 'default' | 'compact';
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  (
    { icon: Icon, title, description, features, action, size = 'default', className, ...props },
    ref,
  ) => (
    <ModernCard
      ref={ref}
      variant="interactive"
      padding={size === 'compact' ? 'sm' : undefined}
      className={cn("group bg-blue-900 text-white", className)}
      {...props}
    >
      <CardHeader className="text-white">
        <div className={cn(
          "rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors",
          size === 'compact' ? 'w-8 h-8 mb-2' : 'w-10 h-10 mb-3.5',
        )}>
          <Icon className={cn("text-blue-600", size === 'compact' ? 'w-4 h-4' : 'w-5 h-5')} />
        </div>
        <CardTitle className={cn("text-yellow-400", size === 'compact' ? 'text-lg' : undefined)}>{title}</CardTitle>
        <CardDescription className="text-blue-200">
          {description}
        </CardDescription>
      </CardHeader>
      {Array.isArray(features) && features.length > 0 && (
        <CardContent className="text-white">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-yellow-300 mb-2">Key Features:</h4>
            <ul className={cn(size === 'compact' ? 'space-y-1' : 'space-y-1.5')}>
              {features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-1.5 text-sm">
                  <div className={cn("rounded-full bg-yellow-400 mt-2 flex-shrink-0", size === 'compact' ? 'w-1 h-1' : 'w-1 h-1')} />
                  <span className="text-white">{feature}</span>
                </li>
              ))}
              {features.length > 3 && (
                <li className="text-sm text-blue-200 italic">
                  +{features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      )}
      {action && <CardFooter className={cn(size === 'compact' ? 'pt-3' : undefined)}>{action}</CardFooter>}
    </ModernCard>
  ),
);
ServiceCard.displayName = "ServiceCard";

// Product Card Component
export interface ProductCardProps extends CardProps {
  image?: string;
  title: string;
  price?: string;
  description: string;
  badge?: string;
  action?: React.ReactNode;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    { image, title, price, description, badge, action, className, ...props },
    ref,
  ) => (
    <ModernCard
      ref={ref}
      variant="interactive"
      padding="none"
      className={cn("overflow-hidden group", className)}
      {...props}
    >
      {image && (
        <div className="relative h-40 bg-slate-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {badge && (
            <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              {badge}
            </div>
          )}
        </div>
      )}
      <div className="p-5 bg-blue-900">
        <CardHeader className="pb-1.5">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base text-yellow-300">{title}</CardTitle>
            {price && (
              <span className="text-base font-bold text-blue-600">{price}</span>
            )}
          </div>
          <CardDescription className="text-white">
            {description}
          </CardDescription>
        </CardHeader>
        {action && <CardFooter className="pt-3.5">{action}</CardFooter>}
      </div>
    </ModernCard>
  ),
);
ProductCard.displayName = "ProductCard";

export {
  ModernCard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardGrid,
  ServiceCard,
  ProductCard,
  cardVariants,
};
