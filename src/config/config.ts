import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize/types';

dotenv.config({ path: './.env' });

export const config = {
  db_host: process.env.DB_HOSTNAME,
  secret: process.env.SECRET,
  db_name: process.env.DB_NAME,
  db_user: process.env.DB_USERNAME,
  db_password: process.env.DB_PASSWORD,
  db_driver: process.env.DB_DRIVER as Dialect,
  db_port: process.env.DB_PORT,
  port: process.env.PORT,
  region: process.env.REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  bucket: process.env.BUCKET,
  image_detail_region: process.env.IMAGE_DETAIL_REGION,
  image_detail_accessKeyId: process.env.IMAGE_DETAIL_AWS_ACCESS_KEY,
  image_detail_secretAccessKey: process.env.IMAGE_DETAIL_SECRET_ACCESS_KEY,
  image_detail_bucket: process.env.IMAGE_DETAIL_BUCKET,
  aws_url: process.env.AWS_URL,
};
