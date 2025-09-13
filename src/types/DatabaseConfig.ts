export type DatabaseDialect = 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';

export interface DatabaseConfig {
  database: string | undefined;
  username: string | undefined;
  password: string | undefined;
  dialect: DatabaseDialect;
  host?: string;
  port: number;
  secret?: string;
  appPort?: string;
  CloudFrontUrl: string | undefined;
  appLang: string;
  CHIPER?: string;
  ENCRYPTION_KEY?: string;
  CHIPER_IV?: string;
}
