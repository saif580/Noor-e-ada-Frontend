import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function FormField({ id, label, error, hint, className = '', ...inputProps }: FormFieldProps) {
  const fieldId = id ?? inputProps.name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;

  return (
    <label className={`form-field ${className}`.trim()} htmlFor={fieldId}>
      <span>{label}</span>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? descriptionId : undefined}
        {...inputProps}
      />
      {(error || hint) && (
        <small id={descriptionId} className={error ? 'form-error' : undefined}>
          {error ?? hint}
        </small>
      )}
    </label>
  );
}
