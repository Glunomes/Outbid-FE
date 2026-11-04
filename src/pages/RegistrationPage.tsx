import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import registrationService from '../services/authService';
import { AuthFormField } from '../components/AuthFormField';
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
        <AuthFormField
          id="register-name"
          label="Name"
          type="text"
          registration={register('name')}
          error={errors.name?.message}
        />
        <AuthFormField
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />
        <AuthFormField
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password?.message}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
};
