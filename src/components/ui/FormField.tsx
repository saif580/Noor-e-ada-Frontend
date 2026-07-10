import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function FormField({ id, label, error, hint, className = '', ...inputProps }: FormFieldProps) {
  const fieldId = id ?? inputProps.name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;
  const isPassword = inputProps.type === 'password';
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const inputType = isPassword && isPasswordVisible ? 'text' : inputProps.type;

  return (
    <label className={`form-field ${className}`.trim()} htmlFor={fieldId}>
      <span>{label}</span>
      <div className={isPassword ? 'form-field-control form-field-control-password' : 'form-field-control'}>
        <input
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? descriptionId : undefined}
          {...inputProps}
          type={inputType}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            aria-label={isPasswordVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            onClick={() => setPasswordVisible(prev => !prev)}
          >
            {isPasswordVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {(error || hint) && (
        <small id={descriptionId} className={error ? 'form-error' : undefined}>
          {error ?? hint}
        </small>
      )}
    </label>
  );
}
