import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres.wvqxzihkzgltsfhfdbqu:Saifelsheikh320%40@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
  },
});
