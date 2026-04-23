"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-[0_8px_30px_rgb(255,0,0,0.3)] hover:shadow-[0_8px_30px_rgb(255,0,0,0.5)] border border-primary/50 relative overflow-hidden group',
      secondary: 'bg-white/80 backdrop-blur-md text-gray-900 border border-gray-200/60 hover:bg-white shadow-sm hover:shadow',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg w-full',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
