"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
    children,
    variant = "default",
    size = "sm",
    className = "",
}: BadgeProps) {
    const variants = {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        outline: "border border-border bg-transparent",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </span>
    );
}
