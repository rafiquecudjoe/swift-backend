import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config({ path: path.join(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (process.env.NODE_ENV === 'test') {
  const url = process.env.DATABASE_URL;
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const dbName = pathParts[pathParts.length - 1];

    if (!dbName.endsWith('_test')) {
      pathParts[pathParts.length - 1] = `${dbName}_test`;
      urlObj.pathname = pathParts.join('/');
      process.env.DATABASE_URL = urlObj.toString();
    }
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
