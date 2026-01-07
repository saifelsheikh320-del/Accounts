import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users: Admin and Employees
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "employee"] }).notNull().default("employee"),
  fullName: text("full_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partners: Customers and Suppliers
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["customer", "supplier"] }).notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products: Inventory Items
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").unique(),
  barcode: text("barcode").unique(),
  name: text("name").notNull(),
  description: text("description"),
  quantity: integer("quantity").default(0).notNull(),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull().default("0"),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull().default("0"),
  minStockLevel: integer("min_stock_level").default(5),
  category: text("category"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions: Sales, Purchases, Returns
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["sale", "purchase", "sale_return", "purchase_return", "adjustment"] }).notNull(),
  partnerId: integer("partner_id").references(() => partners.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["completed", "voided"] }).default("completed").notNull(),
  notes: text("notes"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
});

// Transaction Items: Line items for each transaction
export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Unit price at time of transaction
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),   // Unit cost at time of transaction
});

// Settings: App config
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").default("My Store"),
  currency: text("currency").default("USD"),
  address: text("address"),
  phone: text("phone"),
  theme: text("theme").default("light"),
});

// === RELATIONS ===
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  partner: one(partners, { fields: [transactions.partnerId], references: [partners.id] }),
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, { fields: [transactionItems.transactionId], references: [transactions.id] }),
  product: one(products, { fields: [transactionItems.productId], references: [products.id] }),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, transactionDate: true });
export const insertTransactionItemSchema = createInsertSchema(transactionItems).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

// Users
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserRequest = Partial<InsertUser>;

// Partners
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type UpdatePartnerRequest = Partial<InsertPartner>;

// Products
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProductRequest = Partial<InsertProduct>;

// Transactions
export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;

// Composite Request for Creating a Transaction (Header + Items)
export const createTransactionRequestSchema = z.object({
  type: z.enum(["sale", "purchase", "sale_return", "purchase_return", "adjustment"]),
  partnerId: z.number().optional(), // Optional for adjustments or walk-in sales
  userId: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number(), // Selling price or Purchase price depending on type
  })),
  notes: z.string().optional(),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionRequestSchema>;

// Responses
export type TransactionResponse = Transaction & { items: TransactionItem[] };

// Reports
export interface DashboardStats {
  totalSales: number;
  totalProfits: number;
  lowStockCount: number;
  recentTransactions: Transaction[];
}

// Settings
export type Settings = typeof settings.$inferSelect;
export type UpdateSettingsRequest = Partial<z.infer<typeof insertSettingsSchema>>;
