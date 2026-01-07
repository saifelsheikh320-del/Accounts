
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Initializing database tables...");

  // Users
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employee' NOT NULL,
      full_name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Partners
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS partners (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Products
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER DEFAULT 0 NOT NULL,
      cost_price NUMERIC(10, 2) DEFAULT '0' NOT NULL,
      selling_price NUMERIC(10, 2) DEFAULT '0' NOT NULL,
      min_stock_level INTEGER DEFAULT 5,
      category TEXT,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Transactions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      partner_id INTEGER,
      user_id INTEGER NOT NULL,
      total_amount NUMERIC(10, 2) NOT NULL,
      status TEXT DEFAULT 'completed' NOT NULL,
      notes TEXT,
      transaction_date TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Transaction Items
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      cost NUMERIC(10, 2) NOT NULL
    );
  `);

  // Settings
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      store_name TEXT DEFAULT 'My Store',
      currency TEXT DEFAULT 'USD',
      address TEXT,
      phone TEXT,
      theme TEXT DEFAULT 'light',
      remote_url TEXT
    );
  `);

  // Employees
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      position TEXT,
      salary NUMERIC(10, 2) DEFAULT '0' NOT NULL,
      phone TEXT,
      email TEXT,
      hire_date DATE,
      is_active BOOLEAN DEFAULT true NOT NULL
    );
  `);

  // Salaries
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS salaries (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      month TEXT NOT NULL,
      payment_date TIMESTAMP DEFAULT NOW() NOT NULL,
      notes TEXT
    );
  `);

  // Accounts
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      parent_account_id INTEGER,
      balance NUMERIC(10, 2) DEFAULT '0' NOT NULL
    );
  `);

  // Journal Entries
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      entry_date TIMESTAMP DEFAULT NOW() NOT NULL,
      reference TEXT
    );
  `);

  // Journal Items
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS journal_items (
      id SERIAL PRIMARY KEY,
      journal_entry_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      debit NUMERIC(10, 2) DEFAULT '0' NOT NULL,
      credit NUMERIC(10, 2) DEFAULT '0' NOT NULL
    );
  `);

  console.log("Database initialized successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
