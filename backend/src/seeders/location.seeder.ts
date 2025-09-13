import { pool } from '@app/config/db';
import { readFileSync } from 'fs';
import format from 'pg-format';
import { join } from 'path';

// Countries
// Countries
export async function insertCountries(countries: any[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const values = countries.map((c) => [
      c.id,
      c.name,
      c.iso3,
      c.iso2,
      c.numeric_code,
      c.phone_code,
      c.capital,
      c.currency,
      c.currency_name,
      c.currency_symbol,
      c.tld,
      c.native,
      c.region,
      c.region_id,
      c.subregion,
      c.subregion_id,
      c.nationality,
      c.latitude,
      c.longitude,
      c.emoji,
      c.emojiU,
      JSON.stringify(c.translations),
      JSON.stringify(c.timezones),
    ]);

    const sql = format(
      `
      INSERT INTO countries (
        id, name, iso3, iso2, numeric_code, phone_code, capital,
        currency, currency_name, currency_symbol, tld,
        native, region, region_id, subregion, subregion_id,
        nationality, latitude, longitude, emoji, emojiU,
        translations, timezones
      )
      VALUES %L
      ON CONFLICT (id) DO NOTHING
    `,
      values
    );

    await client.query(sql);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// States
export async function insertStates(states: any[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const values = states.map((s) => [s.id, s.name, s.country_id, s.country_code, s.country_name, s.state_code, s.type, s.latitude, s.longitude]);

    const sql = format(
      `
      INSERT INTO states (
        id, name, country_id, country_code, country_name,
        state_code, type, latitude, longitude
      )
      VALUES %L
      ON CONFLICT (id) DO NOTHING
    `,
      values
    );

    await client.query(sql);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Cities
export async function insertCities(cities: any[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const values = cities.map((c) => [
      c.id,
      c.name,
      c.state_id,
      c.state_code,
      c.state_name,
      c.country_id,
      c.country_code,
      c.country_name,
      c.latitude,
      c.longitude,
      c.wikiDataId,
    ]);

    const sql = format(
      `
      INSERT INTO cities (
        id, name, state_id, state_code, state_name,
        country_id, country_code, country_name,
        latitude, longitude, wikiDataId
      )
      VALUES %L
      ON CONFLICT (id) DO NOTHING
    `,
      values
    );

    await client.query(sql);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Seeder runner
export async function runSeeder() {
  try {
    const countryJson = JSON.parse(readFileSync(join(__dirname, './json/country.json'), 'utf-8'));
    const stateJson = JSON.parse(readFileSync(join(__dirname, './json/states.json'), 'utf-8'));
    const cityJson = JSON.parse(readFileSync(join(__dirname, './json/city.json'), 'utf-8'));

    console.log('Seeding countries…');
    await insertCountries(countryJson);

    console.log('Seeding states…');
    await insertStates(stateJson);

    console.log('Seeding cities…');
    await insertCities(cityJson);

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}
