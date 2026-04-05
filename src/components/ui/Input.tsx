import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1 w-full">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <input
          ref={ref}
          className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-red-500 tracking-tight">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
