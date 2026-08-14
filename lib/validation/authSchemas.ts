import { z } from 'zod';

export const signInSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, underscores, and periods'),
  email: z.email('Enter a valid email address').trim().min(1, 'Enter your email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password needs at least one letter')
    .regex(/[0-9]/, 'Password needs at least one number'),
});

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'Enter the 6-digit code'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;

/** Flattens a ZodError into a simple { field: message } map for form display. */
export function fieldErrorsFrom(error: z.ZodError<any>) {
  const flat = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const out: Record<string, string> = {};
  for (const key in flat) {
    const msgs = flat[key];
    if (msgs && msgs.length > 0) out[key] = msgs[0];
  }
  return out;
}