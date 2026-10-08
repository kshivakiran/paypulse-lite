import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Task 2.1 — Zod validation middleware factory.
 * Validates req.body against a Zod schema before the request reaches the controller.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join(', ');
      return next({ statusCode: 400, message: messages, isOperational: true });
    }
    req.body = result.data;
    next();
  };
};

// --- Validation Schemas ---

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.')
    .trim(),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.')
    .max(255)
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters.')
    .max(128, 'Password cannot exceed 128 characters.'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export const transferSchema = z.object({
  receiverEmail: z
    .string({ required_error: 'Receiver email is required.' })
    .email('Please provide a valid receiver email address.')
    .trim()
    .toLowerCase(),
  amount: z
    .number({ required_error: 'Amount is required.', invalid_type_error: 'Amount must be a number.' })
    .positive('Amount must be greater than zero.')
    .max(100000, 'Maximum transfer amount is $100,000.')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places.'),
  referenceNote: z
    .string()
    .max(250, 'Note cannot exceed 250 characters.')
    .optional(),
});
