import type { UseFormRegisterReturn } from 'react-hook-form';

type LotFormFieldProps = {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: 'text' | 'datetime-local';
  inputMode?: 'decimal';
  multiline?: boolean;
};

export const LotFormField = ({
  id,
  label,
  registration,
  error,
  type = 'text',
  inputMode,
  multiline = false,
}: LotFormFieldProps) => {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...registration}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...registration}
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
