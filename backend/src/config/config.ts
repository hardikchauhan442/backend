import dotenv from 'dotenv';

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });
const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  secret: process.env.JWT_SECRET,
  port: process.env.DB_PORT,
  appPort: process.env.PORT,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME,
  CloudFrontUrl: process.env.CLOUDFRONT_DOMAIN,
  appLang: process.env.APP_LANG || 'en',
  CHIPER: process.env.CHIPER,
  ENCRYPTION_KEY: process.env.TERIFF,
  CHIPER_IV: process.env.PLAN,
};

const configs = {
  development: { ...config },
  local: { ...config },
  test: { ...config },
  production: { ...config },
};

const env = configs[process.env.NODE_ENV as keyof typeof configs] || configs.development;

export { env };
