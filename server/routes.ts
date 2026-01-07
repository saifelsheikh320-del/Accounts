import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq, like, and, desc, sql, gte, lte } from "drizzle-orm";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  insertUserSchema, insertProductSchema, insertPartnerSchema,
  createTransactionRequestSchema, insertSettingsSchema,
  insertEmployeeSchema, insertSalarySchema, insertAccountSchema
} from "@shared/schema";

let isInitialized = false; // Prevent multiple inits in serverless

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === USERS ===
  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = insertUserSchema.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.put(api.users.update.path, async (req, res) => {
    try {
      const input = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), input);
      res.json(user);
    } catch (e) {
      return res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete(api.users.delete.path, async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.status(204).send();
  });

  // === EMPLOYEES (HR) ===
  app.get(api.employees.list.path, async (req, res) => {
    const emps = await storage.getEmployees();
    res.json(emps);
  });

  app.post(api.employees.create.path, async (req, res) => {
    try {
      const input = insertEmployeeSchema.parse(req.body);
      const emp = await storage.createEmployee(input);
      res.status(201).json(emp);
    } catch (e) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.put(api.employees.update.path, async (req, res) => {
    try {
      const input = insertEmployeeSchema.partial().parse(req.body);
      const emp = await storage.updateEmployee(Number(req.params.id), input);
      res.json(emp);
    } catch (e) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete(api.employees.delete.path, async (req, res) => {
    await storage.deleteEmployee(Number(req.params.id));
    res.status(204).send();
  });

  // === SALARIES (HR) ===
  app.get(api.salaries.list.path, async (req, res) => {
    const sals = await storage.getSalaries(req.query.employeeId ? Number(req.query.employeeId) : undefined);
    res.json(sals);
  });

  app.post(api.salaries.create.path, async (req, res) => {
    try {
      const input = insertSalarySchema.parse(req.body);
      const sal = await storage.createSalary(input);
      res.status(201).json(sal);
    } catch (e) {
      res.status(400).json({ message: "Invalid salary data" });
    }
  });

  // === ACCOUNTING (ACCOUNTS) ===
  app.get(api.accounts.list.path, async (req, res) => {
    const accs = await storage.getAccounts();
    res.json(accs);
  });

  app.post(api.accounts.create.path, async (req, res) => {
    try {
      const input = insertAccountSchema.parse(req.body);
      const acc = await storage.createAccount(input);
      res.status(201).json(acc);
    } catch (e) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  // === JOURNAL ENTRIES ===
  app.get(api.journalEntries.list.path, async (req, res) => {
    const entries = await storage.getJournalEntries();
    res.json(entries);
  });

  app.post(api.journalEntries.create.path, async (req, res) => {
    try {
      const { items, ...entry } = req.body;
      const result = await storage.createJournalEntry(entry, items);
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ message: "Journal entry failed" });
    }
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts(
      req.query.search as string,
      req.query.category as string
    );
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (e) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const input = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      res.json(product);
    } catch (e) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // === PARTNERS ===
  app.get(api.partners.list.path, async (req, res) => {
    const partners = await storage.getPartners(
      req.query.type as 'customer' | 'supplier',
      req.query.search as string
    );
    res.json(partners);
  });

  app.post(api.partners.create.path, async (req, res) => {
    try {
      const input = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(input);
      res.status(201).json(partner);
    } catch (e) {
      res.status(400).json({ message: "Invalid partner data" });
    }
  });

  app.put(api.partners.update.path, async (req, res) => {
    try {
      const input = insertPartnerSchema.partial().parse(req.body);
      const partner = await storage.updatePartner(Number(req.params.id), input);
      res.json(partner);
    } catch (e) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete(api.partners.delete.path, async (req, res) => {
    await storage.deletePartner(Number(req.params.id));
    res.status(204).send();
  });

  // === TRANSACTIONS ===
  app.get(api.transactions.list.path, async (req, res) => {
    const txs = await storage.getTransactions(
      req.query.type as string,
      req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      req.query.partnerId ? Number(req.query.partnerId) : undefined
    );
    res.json(txs);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = createTransactionRequestSchema.parse(req.body);
      const tx = await storage.createTransaction(input);
      res.status(201).json(tx);
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Transaction failed" });
    }
  });

  app.get(api.transactions.get.path, async (req, res) => {
    const tx = await storage.getTransaction(Number(req.params.id));
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    const partner = tx.partnerId ? await storage.getPartner(tx.partnerId) : undefined;
    const user = await storage.getUser(tx.userId);

    res.json({ transaction: tx, items: tx.items, partner, user });
  });

  // === SETTINGS ===
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    const updated = await storage.updateSettings(req.body);
    res.json(updated);
  });

  // === REPORTS ===
  app.get(api.reports.dashboard.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // === AUTHENTICATION ===
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const cleanUsername = username?.toLowerCase().trim();
      const cleanPassword = password?.trim();

      // === EMERGENCY FIX: Force Allow admin/admin ===
      if (cleanUsername === "admin" && cleanPassword === "admin") {
        let user;
        try {
          user = await storage.getUserByUsername("admin");
          if (!user) {
            user = await storage.createUser({
              username: "admin",
              password: "admin",
              role: "admin",
              fullName: "مدير النظام",
              isActive: true
            });
          } else {
            const updates: any = {};
            if (user.password !== "admin") updates.password = "admin";
            if (!user.isActive) updates.isActive = true;

            if (Object.keys(updates).length > 0) {
              user = await storage.updateUser(user.id, updates);
            }
          }
        } catch (dbError) {
          console.error("DB Error during admin auto-fix:", dbError);
          // Even if DB fails, let them in if it's admin/admin (emergency fallback)
          return res.json({ id: 0, username: "admin", role: "admin", fullName: "مدير النظام (وضع الطوارئ)", isActive: true });
        }

        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }

      // Standard check for other users
      let user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "User account is disabled" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Run schema initialization and seeding
  const shouldInit = process.env.IS_ELECTRON === 'true' || process.env.NODE_ENV === 'production' || process.env.VERCEL;

  if (shouldInit && !isInitialized) {
    isInitialized = true;
    // Do not await in serverless to prevent timeout on cold start
    // The DB will catch up in the background or sub-sequent calls
    initializeSchema().then(() => seedDatabase()).catch(err => {
      console.error("Delayed DB Init Error:", err);
      isInitialized = false; // Allow retry on next request if it failed
    });
  }

  // === DEBUG / HEALTH ===
  app.get("/api/health", async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({
        status: "ok",
        initialized: isInitialized,
        mode: process.env.VERCEL ? "vercel" : "server"
      });
    } catch (e) {
      res.status(500).json({ status: "error", message: (e as Error).message });
    }
  });

  // === SYNC ===
  app.post(api.sync.process.path, async (req, res) => {
    try {
      const { products: remoteProducts, partners: remotePartners, transactions: remoteTxs } = req.body;

      // 1. Process Incoming (Upsert)
      if (remoteProducts) await storage.upsertProducts(remoteProducts);
      if (remotePartners) await storage.upsertPartners(remotePartners);
      if (remoteTxs) await storage.upsertTransactions(remoteTxs);

      // 2. Prepare Current State to Send Back (for Two-Way Sync)
      const currentProducts = await storage.getProducts();
      const currentPartners = await storage.getPartners();
      const currentTxs = await storage.getTransactions();

      res.json({
        success: true,
        receivedCount: {
          products: remoteProducts?.length || 0,
          partners: remotePartners?.length || 0,
          transactions: remoteTxs?.length || 0,
        },
        currentState: {
          products: currentProducts,
          partners: currentPartners,
          transactions: currentTxs
        }
      });
    } catch (e) {
      console.error("Sync Process Error:", e);
      res.status(500).json({ message: "Sync failed" });
    }
  });

  return httpServer;
}

async function seedDatabase() {
  try {
    const users = await storage.getUsers();

    // Check if admin exists and update password if needed
    const adminUser = users.find(u => u.username === "admin");
    if (adminUser) {
      if (adminUser.password !== "admin") {
        await storage.updateUser(adminUser.id, { password: "admin" });
        console.log("✅ Admin password updated to 'admin'");
      }
    }

    if (users.length === 0) {
      const admin = await storage.createUser({
        username: "admin",
        password: "admin",
        role: "admin",
        fullName: "مدير النظام",
        isActive: true
      });

      const mouse = await storage.createProduct({
        name: "ماوس لاسلكي",
        sku: "MS-001",
        quantity: 50,
        costPrice: "10.00",
        sellingPrice: "25.00",
        category: "إلكترونيات",
        isActive: true
      });
      const keyboard = await storage.createProduct({
        name: "لوحة مفاتيح ميكانيكية",
        sku: "KB-002",
        quantity: 20,
        costPrice: "40.00",
        sellingPrice: "89.99",
        category: "إلكترونيات",
        isActive: true
      });

      const customer = await storage.createPartner({
        name: "عميل نقدي",
        type: "customer",
        email: "guest@store.com",
        isActive: true
      });

      // === Accounting Seed ===
      const cashAccount = await storage.createAccount({
        code: "1101",
        name: "الصندوق (نقدي)",
        type: "asset",
        balance: "5000"
      });

      await storage.createAccount({
        code: "4101",
        name: "مصروفات الرواتب",
        type: "expense",
        balance: "0"
      });

      // === HR Seed ===
      await storage.createEmployee({
        fullName: "أحمد محمد",
        position: "محاسب",
        salary: "3500",
        phone: "0123456789",
        isActive: true
      });

      await storage.createTransaction({
        type: "sale",
        partnerId: customer.id,
        userId: admin.id,
        notes: "فاتورة تجريبية #1",
        items: [
          { productId: mouse.id, quantity: 2, price: Number(mouse.sellingPrice) }
        ]
      });

      console.log("✅ Seed data created successfully");
    } else {
      console.log("ℹ️ Database already seeded, skipping...");
    }
  } catch (error) {
    console.error("⚠️ Seed error (non-critical):", error instanceof Error ? error.message : error);
  }
}

async function initializeSchema() {
  console.log("🛠️ Initializing Local Database Schema...");
  try {
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

    console.log("✅ Local Database Schema Initialized Successfully");
  } catch (error) {
    console.error("⚠️ Failed to initialize local schema:", error);
  }
}
