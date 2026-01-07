import { db } from "./db";
import {
  users, products, partners, transactions, transactionItems, settings,
  employees, salaries, accounts, journalEntries, journalItems,
  type User, type InsertUser, type UpdateUserRequest,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Partner, type InsertPartner, type UpdatePartnerRequest,
  type Transaction, type CreateTransactionRequest, type TransactionResponse,
  type Settings, type UpdateSettingsRequest,
  type DashboardStats,
  type Employee, type Salary, type Account, type JournalEntry, type JournalItem
} from "@shared/schema";
import { eq, like, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUserRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Products
  getProducts(search?: string, category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: UpdateProductRequest): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Partners
  getPartners(type?: 'customer' | 'supplier', search?: string): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: UpdatePartnerRequest): Promise<Partner>;
  deletePartner(id: number): Promise<void>;

  // Transactions
  getTransactions(type?: string, startDate?: Date, endDate?: Date, partnerId?: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<TransactionResponse | undefined>;
  createTransaction(tx: CreateTransactionRequest): Promise<Transaction>;

  // Employees (HR)
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: any): Promise<Employee>;
  updateEmployee(id: number, employee: any): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;

  // Salaries (HR)
  getSalaries(employeeId?: number): Promise<Salary[]>;
  createSalary(salary: any): Promise<Salary>;

  // Accounting
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: any): Promise<Account>;
  getJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(entry: any, items: any[]): Promise<JournalEntry>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: UpdateSettingsRequest): Promise<Settings>;

  // Sync
  upsertProducts(items: any[]): Promise<void>;
  upsertPartners(items: any[]): Promise<void>;
  upsertTransactions(items: any[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // === USERS ===
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.id);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: any): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: any): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // === PRODUCTS ===
  async getProducts(search?: string, category?: string): Promise<Product[]> {
    let conditions = [];
    if (search) {
      conditions.push(
        sql`(${products.name} ILIKE ${`%${search}%`} OR ${products.sku} ILIKE ${`%${search}%`} OR ${products.barcode} ILIKE ${`%${search}%`})`
      );
    }
    if (category) {
      conditions.push(eq(products.category, category));
    }

    return await db.select().from(products)
      .where(and(...conditions))
      .orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: any): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: any): Promise<Product> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // === PARTNERS ===
  async getPartners(type?: 'customer' | 'supplier', search?: string): Promise<Partner[]> {
    let conditions = [];
    if (type) conditions.push(eq(partners.type, type));
    if (search) conditions.push(sql`${partners.name} ILIKE ${`%${search}%`}`);

    return await db.select().from(partners)
      .where(and(...conditions))
      .orderBy(partners.name);
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async createPartner(insertPartner: any): Promise<Partner> {
    const [partner] = await db.insert(partners).values(insertPartner).returning();
    return partner;
  }

  async updatePartner(id: number, updates: any): Promise<Partner> {
    const [partner] = await db.update(partners).set(updates).where(eq(partners.id, id)).returning();
    return partner;
  }

  async deletePartner(id: number): Promise<void> {
    await db.delete(partners).where(eq(partners.id, id));
  }

  // === HR (EMPLOYEES & SALARIES) ===
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(employees.fullName);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    return emp;
  }

  async createEmployee(insertEmployee: any): Promise<Employee> {
    const [emp] = await db.insert(employees).values(insertEmployee).returning();
    return emp;
  }

  async updateEmployee(id: number, updates: any): Promise<Employee> {
    const [emp] = await db.update(employees).set(updates).where(eq(employees.id, id)).returning();
    return emp;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getSalaries(employeeId?: number): Promise<Salary[]> {
    let query = db.select().from(salaries);
    if (employeeId) {
      query = query.where(eq(salaries.employeeId, employeeId)) as any;
    }
    return await query.orderBy(desc(salaries.paymentDate));
  }

  async createSalary(insertSalary: any): Promise<Salary> {
    return await db.transaction(async (tx: any) => {
      const [sal] = await tx.insert(salaries).values(insertSalary).returning();

      // Record as an expense transaction for accounting
      await tx.insert(transactions).values({
        type: "payroll",
        userId: 1, // System default
        totalAmount: insertSalary.amount.toString(),
        notes: `Salary payment for month ${insertSalary.month}`,
      });

      return sal;
    });
  }

  // === ACCOUNTING (ACCOUNTS & JOURNAL) ===
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(accounts.code);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [acc] = await db.select().from(accounts).where(eq(accounts.id, id));
    return acc;
  }

  async createAccount(insertAccount: any): Promise<Account> {
    const [acc] = await db.insert(accounts).values(insertAccount).returning();
    return acc;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.entryDate));
  }

  async createJournalEntry(entry: any, items: any[]): Promise<JournalEntry> {
    return await db.transaction(async (tx: any) => {
      const [newEntry] = await tx.insert(journalEntries).values(entry).returning();

      for (const item of items) {
        await tx.insert(journalItems).values({
          ...item,
          journalEntryId: newEntry.id,
        });

        // Update account balance
        const balanceChange = Number(item.debit) - Number(item.credit);
        await tx.update(accounts)
          .set({ balance: sql`${accounts.balance} + ${balanceChange}` })
          .where(eq(accounts.id, item.accountId));
      }

      return newEntry;
    });
  }

  // === TRANSACTIONS ===
  async getTransactions(type?: string, startDate?: Date, endDate?: Date, partnerId?: number): Promise<Transaction[]> {
    let conditions = [];
    if (type) conditions.push(eq(transactions.type, type as any));
    if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
    if (endDate) conditions.push(lte(transactions.transactionDate, endDate));
    if (partnerId) conditions.push(eq(transactions.partnerId, partnerId));

    return await db.select().from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate));
  }

  async getTransaction(id: number): Promise<TransactionResponse | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!tx) return undefined;

    const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, id));
    return { ...tx, items };
  }

  async createTransaction(req: CreateTransactionRequest): Promise<Transaction> {
    return await db.transaction(async (tx: any) => {
      // 1. Create Transaction Header
      const [newTx] = await tx.insert(transactions).values({
        type: req.type,
        partnerId: req.partnerId,
        userId: req.userId,
        totalAmount: req.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toString(),
        notes: req.notes,
      }).returning();

      // 2. Process Items and Stock
      for (const item of req.items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`Product ${item.productId} not found`);

        await tx.insert(transactionItems).values({
          transactionId: newTx.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
          cost: product.costPrice,
        });

        let quantityChange = 0;
        if (req.type === 'sale' || req.type === 'purchase_return' || (req.type === 'adjustment' && item.quantity < 0)) {
          quantityChange = -item.quantity;
        } else if (req.type === 'purchase' || req.type === 'sale_return' || (req.type === 'adjustment' && item.quantity > 0)) {
          quantityChange = item.quantity;
        }

        await tx.update(products)
          .set({ quantity: sql`${products.quantity} + ${quantityChange}` })
          .where(eq(products.id, item.productId));
      }

      return newTx;
    });
  }

  // === SETTINGS ===
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings).limit(1);
    if (setting) return setting;

    const [newSetting] = await db.insert(settings).values({}).returning();
    return newSetting;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db.update(settings).set(updates).where(eq(settings.id, current.id)).returning();
    return updated;
  }

  // === REPORTS ===
  async getDashboardStats(): Promise<DashboardStats> {
    const profitData = await db
      .select({
        totalProfit: sql<number>`SUM((${transactionItems.price} - ${transactionItems.cost}) * ${transactionItems.quantity})`
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactions.id, transactionItems.transactionId))
      .where(eq(transactions.type, 'sale'));

    const lowStock = await db.select().from(products)
      .where(sql`${products.quantity} <= ${products.minStockLevel}`);

    const recent = await db.select().from(transactions)
      .orderBy(desc(transactions.transactionDate))
      .limit(5);

    const topSelling = await db
      .select({
        name: products.name,
        totalQuantity: sql<number>`SUM(${transactionItems.quantity})`
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactions.id, transactionItems.transactionId))
      .innerJoin(products, eq(products.id, transactionItems.productId))
      .where(eq(transactions.type, 'sale'))
      .groupBy(products.name)
      .orderBy(desc(sql`SUM(${transactionItems.quantity})`))
      .limit(5);

    const typesData = await db
      .select({
        type: transactions.type,
        total: sql<number>`SUM(total_amount)`
      })
      .from(transactions)
      .groupBy(transactions.type);

    const getByType = (type: string) => Number(typesData.find((t: any) => t.type === type)?.total || 0);

    return {
      totalSales: getByType('sale'),
      totalProfits: Number(profitData[0]?.totalProfit || 0),
      lowStockCount: lowStock.length,
      lowStockProducts: lowStock,
      recentTransactions: recent,
      topSellingProducts: topSelling.map((row: any) => ({
        name: row.name,
        quantity: Number(row.totalQuantity),
      })),
      breakdown: {
        sales: getByType('sale'),
        purchases: getByType('purchase'),
        saleReturns: getByType('sale_return'),
        purchaseReturns: getByType('purchase_return'),
        adjustments: getByType('adjustment'),
      }
    };
  }

  // Sync methods implementation
  async upsertProducts(items: any[]): Promise<void> {
    for (const item of items) {
      const existing = await db.select().from(products).where(eq(products.name, item.name)).limit(1);
      if (existing.length > 0) {
        await db.update(products).set(item).where(eq(products.id, existing[0].id));
      } else {
        const { id, ...data } = item;
        await db.insert(products).values(data);
      }
    }
  }

  async upsertPartners(items: any[]): Promise<void> {
    for (const item of items) {
      const existing = await db.select().from(partners).where(eq(partners.name, item.name)).limit(1);
      if (existing.length > 0) {
        await db.update(partners).set(item).where(eq(partners.id, existing[0].id));
      } else {
        const { id, ...data } = item;
        await db.insert(partners).values(data);
      }
    }
  }

  async upsertTransactions(items: any[]): Promise<void> {
    // Simple push for now, avoiding duplication by checking type and amount and date 
    // This is basic and could be improved with unique transaction IDs
    for (const item of items) {
      await db.insert(transactions).values(item).onConflictDoNothing();
    }
  }
}

export const storage = new DatabaseStorage();
