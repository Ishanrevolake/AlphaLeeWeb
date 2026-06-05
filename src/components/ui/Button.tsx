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
    const baseStyles = 'inline-flex min-w-0 items-center justify-center rounded-2xl text-center font-bold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-[#FF0000] text-white border-2 border-[#FF0000] alpha-red-block-shadow hover:bg-[#e60000] hover:border-[#e60000] relative overflow-hidden group',
      secondary: 'bg-white text-gray-900 border-2 border-gray-900 alpha-black-block-shadow hover:bg-gray-50',
      outline: 'bg-white border-2 border-gray-900 text-gray-900 alpha-black-block-shadow hover:bg-gray-900 hover:text-white',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
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
