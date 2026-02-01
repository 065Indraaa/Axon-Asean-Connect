import React from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed h-12 px-6 text-sm tracking-wide";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    secondary: "bg-surface text-white hover:bg-border border border-border",
    outline: "bg-transparent text-white border border-border hover:border-white/40",
    ghost: "bg-transparent text-secondary hover:text-white"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, rightElement, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-xs font-medium text-secondary uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <input 
          className={`w-full bg-surface text-white border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-neutral-700 ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-surface border border-border rounded-2xl p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Header: React.FC<{ title: string; onBack?: () => void; rightAction?: React.ReactNode }> = ({ title, onBack, rightAction }) => {
  return (
    <div className="flex items-center justify-between py-4 mb-2 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-surface rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      {rightAction}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'neutral' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    neutral: 'bg-white/5 text-secondary border-white/10'
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${styles[variant]}`}>
      {children}
    </span>
  );
};