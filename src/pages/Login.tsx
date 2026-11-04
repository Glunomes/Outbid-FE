import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import registrationService from '../services/authService';
import {
  loginRequestSchema,
  type LoginRequest,
} from '../schemas/auth/login.schema';

export const LoginPage = () => {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleLoginSubmit = async (data: LoginRequest) => {
    try {
      setError('');
      await registrationService.login(data);
      reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit(handleLoginSubmit)} noValidate>
        <div>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="login-email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'login-password-error' : undefined
            }
            {...register('password')}
          />
          {errors.password && (
            <p id="login-password-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};
