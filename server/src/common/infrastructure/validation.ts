import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../errors';

export async function validateDto<T extends object>(dtoClass: ClassConstructor<T>, payload: unknown): Promise<T> {
  const dto = plainToInstance(dtoClass, payload);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return dto;
}
