import 'dotenv/config';
import { validateEnvironment } from './validate-env';

const validatedEnv = validateEnvironment();

export const config = {
  // App
  nodeEnvironment: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,

  // Database
  databaseUrl: validatedEnv.DATABASE_URL,

  // JWT
  jwtSecret: validatedEnv.JWT_SECRET,
  jwtExpiresIn: validatedEnv.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: validatedEnv.JWT_REFRESH_EXPIRES_IN,

  // Joi validation options
  joiOptions: {
    errors: { wrap: { label: '' } },
    abortEarly: true,
    convert: true,
  },
};
