"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function Card({ children, className = "", padding = "md" }: CardProps) {
    const paddingStyles = {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
    };

    return (
        <div
            className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${paddingStyles[padding]} ${className}`}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
    return (
        <h3 className={`text-lg font-semibold text-foreground ${className}`}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({
    children,
    className = "",
}: CardDescriptionProps) {
    return (
        <p className={`mt-1 text-sm text-muted-foreground ${className}`}>
            {children}
        </p>
    );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
    return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
    return (
        <div className={`mt-4 flex items-center gap-2 ${className}`}>{children}</div>
    );
}
