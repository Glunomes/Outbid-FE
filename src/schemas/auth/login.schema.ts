import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
