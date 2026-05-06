import { ValidationError as ClassValidationError } from 'class-validator';
import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(errors: ClassValidationError[]) {
    super('Validation failed', 422, 'VALIDATION_ERROR', errors);
  }
}
