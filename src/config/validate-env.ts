import * as joi from 'joi';

export function validateEnvironment() {
  const envSchema = joi
    .object({
      NODE_ENV: joi
        .string()
        .valid('development', 'production', 'test')
        .default('development'),
      PORT: joi.number().default(3000),
      DATABASE_URL: joi.string().required(),
      JWT_SECRET: joi.string().required(),
      JWT_EXPIRES_IN: joi.string().default('24h'),
      JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
    })
    .unknown(); // Allow other env vars

  const { error, value } = envSchema.validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
}
