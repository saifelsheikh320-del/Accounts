import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import * as schema from "@shared/schema";

let dbInstance: any;
let clientInstance: any;

// Force Supabase connection for testing
const DATABASE_URL = process.env.DATABASE_URL;
const IS_DESKTOP = process.env.IS_ELECTRON === "true";

if (IS_DESKTOP) {
    // In desktop mode, we ALWAYS use a local persistent DB
    // This allows for true offline-first functionality
    const client = new PGlite("smart_accountant_db");
    dbInstance = drizzlePglite(client, { schema });
    clientInstance = client;
    console.log("Connected to Local Desktop Database (Offline-First)");
} else if (DATABASE_URL) {
    // Remote Cloud Database (PostgreSQL)
    const pool = new pg.Pool({
        connectionString: DATABASE_URL,
    });
    dbInstance = drizzleNodePostgres(pool, { schema });
    clientInstance = pool;
    console.log("Connected to Remote PostgreSQL Database (Cloud Mode)");
} else {
    // Local ephemeral Database for web testing
    const client = new PGlite("data");
    dbInstance = drizzlePglite(client, { schema });
    clientInstance = client;
    console.log("Connected to Local PGlite Database (Web Testing)");
}

export const db = dbInstance;
export const client = clientInstance;

