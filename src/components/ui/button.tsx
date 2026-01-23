"use client";

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className = "",
            variant = "primary",
            size = "md",
            loading = false,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg";

        const variants = {
            primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
            secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
            outline:
        "border border-border bg-transparent hover:bg-accent focus:ring-primary",
            ghost: "hover:bg-accent hover:text-accent-foreground focus:ring-accent",
            danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-sm",
            lg: "px-6 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
