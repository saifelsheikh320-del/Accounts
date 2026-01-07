import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema, insertProductSchema, insertPartnerSchema, createTransactionRequestSchema, insertSettingsSchema } from "@shared/schema";

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
    res.status(204).end();
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
    res.status(204).end();
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

  // === TRANSACTIONS ===
  app.get(api.transactions.list.path, async (req, res) => {
    const txs = await storage.getTransactions(
      req.query.type as string
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
    
    // Fetch related info (simple implementation, ideally storage returns joined data)
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

  // SEED DATA
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUsers();
  if (users.length === 0) {
    // Create Admin
    await storage.createUser({
      username: "admin",
      password: "password123", // In a real app, hash this!
      role: "admin",
      fullName: "System Administrator",
      isActive: true
    });

    // Create Sample Products
    await storage.createProduct({
      name: "Wireless Mouse",
      sku: "MS-001",
      quantity: 50,
      costPrice: "10.00",
      sellingPrice: "25.00",
      category: "Electronics"
    });
    await storage.createProduct({
      name: "Mechanical Keyboard",
      sku: "KB-002",
      quantity: 20,
      costPrice: "40.00",
      sellingPrice: "89.99",
      category: "Electronics"
    });
    await storage.createProduct({
      name: "USB-C Cable",
      sku: "CB-003",
      quantity: 100,
      costPrice: "2.00",
      sellingPrice: "9.99",
      category: "Accessories"
    });

    // Create Sample Partners
    await storage.createPartner({
      name: "Walk-in Customer",
      type: "customer",
      email: "guest@store.com"
    });
    await storage.createPartner({
      name: "Tech Supplier Inc.",
      type: "supplier",
      email: "orders@techsupplier.com"
    });
  }
}
