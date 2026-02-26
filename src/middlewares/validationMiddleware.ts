import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

/**
 * Validation middleware factory
 *
 * Usage:
 * router.post('/register', validate(registerUserSchema), asyncHandler(registerUser))
 *
 * Flow:
 * 1. Receives request
 * 2. Validates req.body against schema
 * 3. If valid: attaches validated data to req.body and calls next()
 * 4. If invalid: returns 400 with structured error messages
 */
export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate req.body against the schema
      const validatedData = schema.parse(req.body);

      // If valid, replace req.body with validated (cleaned) data
      // This ensures data is properly typed and transformed
      req.body = validatedData;

      // Move to next middleware/controller
      next();
    } catch (error) {
      // Check if it's a Zod validation error
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly messages
        const formattedErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'), // e.g., "email" or "address.zip"
          message: err.message, // e.g., "Invalid email format"
          code: err.code, // e.g., "invalid_string"
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      // If not a Zod error, pass to error handler
      next(error);
    }
  };
};
