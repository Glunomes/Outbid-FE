import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import registrationService from '../services/authService';
import {
  registerRequestSchema,
  type RegisterRequest,
} from '../schemas/auth/register.schema';

export const RegistrationPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleRegistrationSubmit = async (data: RegisterRequest) => {
    try {
      setError('');
      await registrationService.registerUser(data);
      reset();
      navigate('/auth/login', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit(handleRegistrationSubmit)} noValidate>
        <div>
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            type="text"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            {...register('name')}
          />
          {errors.name && (
            <p id="register-name-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="register-email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'register-password-error' : undefined
            }
            {...register('password')}
          />
          {errors.password && (
            <p id="register-password-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
};
