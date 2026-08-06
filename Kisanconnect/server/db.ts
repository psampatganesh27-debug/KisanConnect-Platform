import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export async function getDb(): Promise<Pool> {
  if (pool) return pool;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from .env file");
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for external Postgres connections
  });

  const client = await pool.connect();
  
  try {
    // Initialize tables using PostgreSQL syntax
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        pin TEXT NOT NULL,
        name TEXT NOT NULL,
        village TEXT NOT NULL,
        district TEXT DEFAULT 'Central District',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS equipment_listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        owner_name TEXT NOT NULL,
        owner_phone TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        rate_per_unit REAL NOT NULL,
        unit_type TEXT NOT NULL,
        village TEXT NOT NULL,
        district TEXT NOT NULL,
        is_available INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS labor_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        requester_name TEXT NOT NULL,
        requester_phone TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        offered_rate REAL NOT NULL,
        unit_type TEXT NOT NULL,
        work_date TEXT NOT NULL,
        village TEXT NOT NULL,
        district TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER,
        request_id INTEGER,
        requester_phone TEXT NOT NULL,
        provider_phone TEXT NOT NULL,
        service_title TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'confirmed',
        booking_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial seed is needed
    const { rows } = await client.query("SELECT COUNT(*) as count FROM users");
    const count = parseInt(rows[0].count, 10);

    if (count === 0) {
      await seedInitialData(client);
    }
  } finally {
    client.release();
  }

  return pool;
}

export function saveDb() {
  // PostgreSQL saves automatically. We keep this empty so server.ts doesn't crash.
  return;
}

async function seedInitialData(client: any) {
  // Same seed data, but executed asynchronously
  await client.query(`
    INSERT INTO users (phone, pin, name, village, district)
    VALUES 
    ('9876543210', '1234', 'Ramesh Kumar', 'Rampur', 'Karnal'),
    ('9123456789', '1234', 'Suresh Patel', 'Sonpur', 'Anand'),
    ('9988776655', '1234', 'Balwinder Singh', 'Gopalpur', 'Ludhiana'),
    ('9443322110', '1234', 'Harish Chandra', 'Sundargarh', 'Sundargarh'),
    ('9776655443', '1234', 'Vijay Reddy', 'Bhimavaram', 'West Godavari');
  `);

  await client.query(`
    INSERT INTO equipment_listings (user_id, owner_name, owner_phone, category, title, description, rate_per_unit, unit_type, village, district, is_available)
    VALUES
    (1, 'Ramesh Kumar', '9876543210', 'tractor', 'Mahindra 575 DI Tractor (50 HP) with Rotavator', 'Available with operator. Great for deep ploughing and field preparation.', 850, 'hour', 'Rampur', 'Karnal', 1),
    (5, 'Vijay Reddy', '9776655443', 'sprayer', 'High-Pressure Motorized Sprayer Rig', 'Effective pesticide and fungicide crop spraying.', 350, 'acre', 'Bhimavaram', 'West Godavari', 1),
    (2, 'Suresh Patel', '9123456789', 'harvester', 'Class Crop Harvester (High Efficiency)', 'Ideal for Wheat & Paddy harvest. Fast processing with minimal grain loss.', 1800, 'acre', 'Sonpur', 'Anand', 1),
    (3, 'Balwinder Singh', '9988776655', 'labor', 'Team of 8 Skilled Paddy Transplanting Laborers', 'Experienced crew for paddy seedling transplantation and weeding.', 600, 'day', 'Gopalpur', 'Ludhiana', 1),
    (1, 'Ramesh Kumar', '9876543210', 'drone', 'Agricultural Spraying Drone (10L capacity)', 'Precision pesticide & fertilizer spraying in 15 minutes per acre.', 450, 'acre', 'Rampur', 'Karnal', 1),
    (4, 'Harish Chandra', '9443322110', 'tiller', 'Heavy Duty Power Tiller 15 HP', 'Ideal for small fields and inter-cultivation.', 500, 'hour', 'Sundargarh', 'Sundargarh', 1),
    (4, 'Harish Chandra', '9443322110', 'tractor', 'John Deere 5310 4WD Heavy Tractor', 'Heavy haulage and deep subsoiling equipment.', 1200, 'hour', 'Devgarh', 'Devgarh', 1);
  `);

  await client.query(`
    INSERT INTO labor_requests (user_id, requester_name, requester_phone, category, title, description, offered_rate, unit_type, work_date, village, district, status)
    VALUES
    (1, 'Ramesh Kumar', '9876543210', 'labor', 'Need 5 Workers for Cotton Picking', 'Full day work starting 7 AM. Tea & lunch provided.', 550, 'day', '2026-08-05', 'Rampur', 'Karnal', 'open'),
    (5, 'Vijay Reddy', '9776655443', 'seeder', 'Need Automatic Seed Planter for Maize', '2 acres sowing requirement. Field leveled and ready.', 950, 'acre', '2026-08-06', 'Kishanpur', 'Karnal', 'open'),
    (2, 'Suresh Patel', '9123456789', 'tractor', 'Need Rotavator Tractor for 3 Acres Land Prep', 'Immediate requirement for vegetable farm bed creation.', 900, 'hour', '2026-08-05', 'Sonpur', 'Anand', 'open'),
    (3, 'Balwinder Singh', '9988776655', 'harvester', 'Need Paddy Harvester for 5 Acres land', 'Field is dry and ready for harvesting next morning.', 1750, 'acre', '2026-08-06', 'Gopalpur', 'Ludhiana', 'open'),
    (4, 'Harish Chandra', '9443322110', 'irrigation', 'Need 10 HP Diesel Water Pump Set', 'Emergency irrigation pump needed for paddy field.', 300, 'day', '2026-08-07', 'Sundargarh', 'Sundargarh', 'open');
  `);
}

// Helper functions converted to Async Promises for PostgreSQL
export async function dbQueryAll(sqlStr: string, params: any[] = []): Promise<any[]> {
  if (!pool) throw new Error('Database not initialized');
  
  // Auto-convert SQLite '?' placeholders to PostgreSQL '$1, $2' format
  let pgSql = sqlStr;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  
  const { rows } = await pool.query(pgSql, params);
  return rows;
}

export async function dbQueryOne(sqlStr: string, params: any[] = []): Promise<any | null> {
  const rows = await dbQueryAll(sqlStr, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function dbExec(sqlStr: string, params: any[] = []): Promise<void> {
  await dbQueryAll(sqlStr, params);
}