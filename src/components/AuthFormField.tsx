import type { UseFormRegisterReturn } from 'react-hook-form';

type AuthFormFieldProps = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password';
  autoComplete?: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

export const AuthFormField = ({
  id,
  label,
  type,
  autoComplete,
  registration,
  error,
}: AuthFormFieldProps) => {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...registration}
      />
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
