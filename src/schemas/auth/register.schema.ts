import { z } from 'zod';

export const registerRequestSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[0-9]/, 'Password must include a number')
    .regex(/[^A-Za-z0-9\s]/, 'Password must include a special character'),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  id: z.uuid(),
  name: z.string().min(3),
  email: z.email(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
