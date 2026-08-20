// lib/validation/uploadSchema.ts
import { z } from 'zod';
export { fieldErrorsFrom } from './zodHelpers';

export const uploadDetailsSchema = z.object({
  title: z.string().trim().min(3, 'Title needs at least 3 characters').max(80, 'Title is too long'),
  description: z.string().trim().max(280, 'Description is too long').optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(8, 'Up to 8 tags').default([]),
});

export type UploadDetailsFormValues = z.infer<typeof uploadDetailsSchema>;