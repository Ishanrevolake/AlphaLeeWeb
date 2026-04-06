import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2 w-full">
        <label className="text-sm font-bold text-gray-900 ml-1 tracking-tight">{label}</label>
        <input
          ref={ref}
          className={`px-4 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white placeholder:text-gray-400 font-medium ${
            error ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]' : 'border-gray-200 shadow-sm focus:shadow-md'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-red-500 font-medium ml-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
