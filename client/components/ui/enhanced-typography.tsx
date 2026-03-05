
import React from 'react';
import { cn } from '@/lib/utils';

const headingVariants = {
  h1: 'font-sans text-4xl md:text-6xl font-bold tracking-tight leading-tight',
  h2: 'font-sans text-3xl md:text-4xl font-semibold tracking-tight',
  h3: 'font-sans text-2xl md:text-3xl font-medium tracking-tight',
  h4: 'font-sans text-xl md:text-2xl font-medium',
};

const paragraphVariants = {
  default: 'font-sans text-base text-slate-700 dark:text-slate-300 leading-relaxed',
  lead: 'font-sans text-lg text-slate-600 dark:text-slate-400 leading-relaxed',
  small: 'font-sans text-sm text-slate-500 dark:text-slate-400',
};

const otherVariants = {
  display: 'font-serif text-5xl md:text-7xl font-semibold text-center leading-tight',
  quote: 'font-serif text-xl leading-relaxed border-l-4 border-blue-500 pl-6 italic',
  code: 'font-mono text-sm bg-slate-100 dark:bg-slate-800 rounded px-2 py-1',
};

type TypographyProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export const H1 = React.forwardRef<HTMLHeadingElement, TypographyProps<'h1'>>(({ className, ...props }, ref) => (
  <h1 ref={ref} className={cn(headingVariants.h1, className)} {...props} />
));
H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, TypographyProps<'h2'>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn(headingVariants.h2, className)} {...props} />
));
H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, TypographyProps<'h3'>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn(headingVariants.h3, className)} {...props} />
));
H3.displayName = 'H3';

export const H4 = React.forwardRef<HTMLHeadingElement, TypographyProps<'h4'>>(({ className, ...props }, ref) => (
  <h4 ref={ref} className={cn(headingVariants.h4, className)} {...props} />
));
H4.displayName = 'H4';

export const P = React.forwardRef<HTMLParagraphElement, TypographyProps<'p'> & { variant?: keyof typeof paragraphVariants }>(
  ({ className, variant = 'default', ...props }, ref) => (
    <p ref={ref} className={cn(paragraphVariants[variant], className)} {...props} />
  )
);
P.displayName = 'P';

export const Display = React.forwardRef<HTMLHeadingElement, TypographyProps<'h1'>>(({ className, ...props }, ref) => (
  <h1 ref={ref} className={cn(otherVariants.display, className)} {...props} />
));
Display.displayName = 'Display';

export const Quote = React.forwardRef<HTMLQuoteElement, TypographyProps<'blockquote'>>(({ className, ...props }, ref) => (
  <blockquote ref={ref} className={cn(otherVariants.quote, className)} {...props} />
));
Quote.displayName = 'Quote';

export const Code = React.forwardRef<HTMLElement, TypographyProps<'code'>>(({ className, ...props }, ref) => (
  <code ref={ref} className={cn(otherVariants.code, className)} {...props} />
));
Code.displayName = 'Code';
