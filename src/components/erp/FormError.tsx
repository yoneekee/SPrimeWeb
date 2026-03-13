/**
 * FormError — Inline field-level error message component.
 * Renders a small red text below an input when validation fails.
 * 
 * Props:
 *   message?: string — The error message to display (from react-hook-form)
 * 
 * Usage:
 *   <FormError message={errors.fieldName?.message} />
 */
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError = ({ message, className }: FormErrorProps) => {
  if (!message) return null;
  return (
    <p className={cn("text-[10px] text-destructive mt-0.5 font-medium", className)}>
      {message}
    </p>
  );
};
