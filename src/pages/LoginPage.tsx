import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import registrationService from '../services/authService';
import { AuthFormField } from '../components/AuthFormField';
import {
  loginRequestSchema,
  type LoginRequest,
} from '../schemas/auth/login.schema';

export const LoginPage = () => {
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const sessionExpired =
    typeof location.state === 'object' &&
    location.state !== null &&
    'sessionExpired' in location.state &&
    location.state.sessionExpired === true;

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
      if (sessionExpired) {
        navigate(location.pathname, { replace: true, state: null });
      }
      navigate('/lots');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div>
      {sessionExpired && (
        <p role="status">Your session has expired. Please sign in again.</p>
      )}
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit(handleLoginSubmit)} noValidate>
        <AuthFormField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />
        <AuthFormField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password?.message}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};
