"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      primary: "bg-nvfc-primary text-white hover:bg-nvfc-accent hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-nvfc-accent",
      secondary: "bg-nvfc-secondary text-nvfc-dark hover:bg-yellow-500 hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-nvfc-secondary",
      ghost: "border-2 border-nvfc-primary text-nvfc-primary hover:bg-nvfc-primary hover:text-white hover:shadow-lg focus:ring-nvfc-primary",
      outline: "border-2 border-gray-300 text-gray-700 hover:border-nvfc-primary hover:text-nvfc-primary hover:shadow focus:ring-nvfc-primary",
      danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-red-500",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && "cursor-wait",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
