import type { ChangeEventHandler } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type FormFieldProps = {
  id: string;
  label: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'datetime-local';
  autoComplete?: string;
  inputMode?: 'decimal';
  step?: string;
  readOnly?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  multiline?: boolean;
};

export const FormField = ({
  id,
  label,
  registration,
  error,
  type = 'text',
  autoComplete,
  inputMode,
  step,
  readOnly = false,
  disabled = false,
  value,
  onChange,
  multiline = false,
}: FormFieldProps) => {
  const errorId = `${id}-error`;
  const commonProps = {
    id,
    readOnly,
    disabled,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          {...commonProps}
          {...(registration ?? {})}
          {...(value === undefined ? {} : { value })}
          {...(onChange ? { onChange } : {})}
        />
      ) : (
        <input
          {...commonProps}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          step={step}
          {...(registration ?? {})}
          {...(value === undefined ? {} : { value })}
          {...(onChange ? { onChange } : {})}
        />
      )}
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
