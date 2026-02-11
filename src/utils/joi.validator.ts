import * as joi from 'joi';
import { config } from '../config/config';

/**
 * Validates data against a Joi schema
 * @param schema - Joi schema
 * @param data - Data to validate
 * @returns Error message or null if valid
 */
export function validateJoiSchema(
  schema: joi.ObjectSchema,
  data: unknown,
): string | null {
  const { error } = schema.validate(data, config.joiOptions);
  return error ? error.message : null;
}
