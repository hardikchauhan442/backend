import { pool } from '@app/config/db';

export async function createLocationTable() {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    iso3 CHAR(3),
    iso2 CHAR(2),
    numeric_code CHAR(3),
    phone_code VARCHAR(20),
    capital VARCHAR(150),
    currency VARCHAR(50),
    currency_name VARCHAR(100),
    currency_symbol VARCHAR(10),
    tld VARCHAR(10),
    native VARCHAR(150),
    region VARCHAR(150),
    region_id INT,
    subregion VARCHAR(150),
    subregion_id INT,
    nationality VARCHAR(150),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    emoji VARCHAR(10),
    emojiU VARCHAR(20),
    translations JSONB,
    timezones JSONB
);

 CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    country_id INT REFERENCES countries(id) ON DELETE CASCADE,
    country_code CHAR(2),
    country_name VARCHAR(150),
    state_code VARCHAR(10),
    type VARCHAR(50),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);


 CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    state_id INT REFERENCES states(id) ON DELETE CASCADE,
    state_code VARCHAR(10),
    state_name VARCHAR(150),
    country_id INT REFERENCES countries(id) ON DELETE CASCADE,
    country_code CHAR(2),
    country_name VARCHAR(150),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    wikiDataId VARCHAR(50)
);
`;
  await pool.query(sql);
}
