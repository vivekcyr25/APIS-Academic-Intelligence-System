import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils.ts';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, type, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-muted-foreground ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none"
              aria-hidden
            >
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId ?? helperId}
            className={cn(
              'flex h-12 w-full rounded-2xl border border-border/80 bg-muted/40 px-4 py-2 text-sm text-foreground transition-colors duration-200',
              'placeholder:text-muted-foreground/50',
              'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-muted/60',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon ? 'pl-11' : '',
              error ? 'border-destructive/60 focus:ring-destructive/30' : '',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-destructive ml-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-muted-foreground ml-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
