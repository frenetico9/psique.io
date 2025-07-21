
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'inverted';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = "rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 shadow-none',
    inverted: 'bg-white text-indigo-600 hover:bg-indigo-50',
  };

  const sizeClasses = {
      md: 'py-2 px-4 font-bold text-sm',
      sm: 'py-1.5 px-3 text-xs font-semibold'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
