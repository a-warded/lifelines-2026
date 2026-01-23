"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        { label, error, helper, options, placeholder, className = "", id, ...props },
        ref
    ) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`w-full rounded-lg border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                        error
                            ? "border-red-500 focus:border-red-500"
                            : "border-border focus:border-primary"
                    } ${className}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                {helper && !error && (
                    <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
