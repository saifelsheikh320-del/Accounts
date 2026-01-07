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
} else if (DATABASE_URL || !IS_DESKTOP) {
    // Remote Cloud Database (PostgreSQL)
    const remoteConn = DATABASE_URL || "postgresql://postgres.wvqxzihkzgltsfhfdbqu:Saifelsheikh320%40@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

    console.log("Connecting to Remote PostgreSQL Database (Cloud Mode)...");
    const pool = new pg.Pool({
        connectionString: remoteConn,
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
    });

    dbInstance = drizzleNodePostgres(pool, { schema });
    clientInstance = pool;
} else {
    // Should never really get here on Vercel due to the above check
    const client = new PGlite("data");
    dbInstance = drizzlePglite(client, { schema });
    clientInstance = client;
    console.log("Connected to Local PGlite Database (Web Testing)");
}

export const db = dbInstance;
export const client = clientInstance;
