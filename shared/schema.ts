import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users: Admin and Software access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "employee"] }).notNull().default("employee"),
  fullName: text("full_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employees: HR Module
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  position: text("position"),
  salary: numeric("salary", { precision: 10, scale: 2 }).notNull().default("0"),
  phone: text("phone"),
  email: text("email"),
  hireDate: date("hire_date"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Salaries: HR Module
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  month: text("month").notNull(), // Format: YYYY-MM
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  notes: text("notes"),
});

// Accounts: Accounting Module (Chart of Accounts)
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., "1101", "4101"
  name: text("name").notNull(),
  type: text("type", { enum: ["asset", "liability", "equity", "revenue", "expense"] }).notNull(),
  parentAccountId: integer("parent_account_id"), // For hierarchies
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("0"),
});

// Journal Entries: Accounting Module
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  reference: text("reference"), // Invoice # or PO #
});

// Journal Entry Details: Debits and Credits
export const journalItems = pgTable("journal_items", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  debit: numeric("debit", { precision: 10, scale: 2 }).notNull().default("0"),
  credit: numeric("credit", { precision: 10, scale: 2 }).notNull().default("0"),
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
  type: text("type", { enum: ["sale", "purchase", "sale_return", "purchase_return", "adjustment", "payroll", "expense"] }).notNull(),
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
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
});

// Settings: App config
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").default("My Store"),
  currency: text("currency").default("USD"),
  address: text("address"),
  phone: text("phone"),
  theme: text("theme").default("light"),
  remoteUrl: text("remote_url"), // URL of the cloud instance to sync with
});

// === RELATIONS ===
export const employeesRelations = relations(employees, ({ many }) => ({
  salaries: many(salaries),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  employee: one(employees, { fields: [salaries.employeeId], references: [employees.id] }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  items: many(journalItems),
}));

export const journalItemsRelations = relations(journalItems, ({ one }) => ({
  entry: one(journalEntries, { fields: [journalItems.journalEntryId], references: [journalEntries.id] }),
  account: one(accounts, { fields: [journalItems.accountId], references: [accounts.id] }),
}));

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
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertSalarySchema = createInsertSchema(salaries).omit({ id: true, paymentDate: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, entryDate: true });
export const insertJournalItemSchema = createInsertSchema(journalItems).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserRequest = Partial<InsertUser>;

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type UpdatePartnerRequest = Partial<InsertPartner>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProductRequest = Partial<InsertProduct>;

export type Employee = typeof employees.$inferSelect;
export type Salary = typeof salaries.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type JournalItem = typeof journalItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;

// Composite Request for Creating a Transaction
export const createTransactionRequestSchema = z.object({
  type: z.enum(["sale", "purchase", "sale_return", "purchase_return", "adjustment", "payroll", "expense"]),
  partnerId: z.number().optional(),
  userId: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number(),
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
  lowStockProducts: Product[];
  recentTransactions: Transaction[];
  topSellingProducts: { name: string; quantity: number }[];
  breakdown: {
    sales: number;
    purchases: number;
    saleReturns: number;
    purchaseReturns: number;
    adjustments: number;
  };
}

// Settings
export type Settings = typeof settings.$inferSelect;
export type UpdateSettingsRequest = Partial<z.infer<typeof insertSettingsSchema>>;
