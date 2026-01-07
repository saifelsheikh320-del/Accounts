import { db } from "./db";
import {
  users, products, partners, transactions, transactionItems, settings,
  type User, type InsertUser, type UpdateUserRequest,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Partner, type InsertPartner, type UpdatePartnerRequest,
  type Transaction, type CreateTransactionRequest, type TransactionResponse,
  type Settings, type UpdateSettingsRequest,
  type DashboardStats
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
  getTransactions(type?: string, startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  getTransaction(id: number): Promise<TransactionResponse | undefined>;
  createTransaction(tx: CreateTransactionRequest): Promise<Transaction>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: UpdateSettingsRequest): Promise<Settings>;

  // Reports
  getDashboardStats(): Promise<DashboardStats>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: UpdateUserRequest): Promise<User> {
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

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product> {
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

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const [partner] = await db.insert(partners).values(insertPartner).returning();
    return partner;
  }

  async updatePartner(id: number, updates: UpdatePartnerRequest): Promise<Partner> {
    const [partner] = await db.update(partners).set(updates).where(eq(partners.id, id)).returning();
    return partner;
  }

  async deletePartner(id: number): Promise<void> {
    await db.delete(partners).where(eq(partners.id, id));
  }

  // === TRANSACTIONS ===
  async getTransactions(type?: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    let conditions = [];
    if (type) conditions.push(eq(transactions.type, type as any));
    if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
    if (endDate) conditions.push(lte(transactions.transactionDate, endDate));

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
    return await db.transaction(async (tx) => {
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
        // Get product to check cost and stock
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`Product ${item.productId} not found`);

        // Insert Line Item
        await tx.insert(transactionItems).values({
          transactionId: newTx.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
          cost: product.costPrice, // Record historical cost
        });

        // Update Stock
        let quantityChange = 0;
        if (req.type === 'sale' || req.type === 'purchase_return' || (req.type === 'adjustment' && item.quantity < 0)) {
           quantityChange = -item.quantity;
        } else if (req.type === 'purchase' || req.type === 'sale_return' || (req.type === 'adjustment' && item.quantity > 0)) {
           quantityChange = item.quantity;
        }

        // Only update stock if it's not a quote or some other non-impacting type
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
    
    // Create default settings if none exist
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
    const sales = await db.select({ total: sql<number>`sum(total_amount)` })
      .from(transactions)
      .where(eq(transactions.type, 'sale'));
    
    // Profit calculation is complex (Sales - Cost of Goods Sold), simplified here:
    // Ideally we sum (price - cost) * quantity from transaction_items for sales
    const profits = await db.execute(sql`
      SELECT SUM((ti.price - ti.cost) * ti.quantity) as profit
      FROM transaction_items ti
      JOIN transactions t ON t.id = ti.transaction_id
      WHERE t.type = 'sale'
    `);

    const lowStock = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`quantity <= min_stock_level`);

    const recent = await db.select().from(transactions)
      .orderBy(desc(transactions.transactionDate))
      .limit(5);

    // Top Selling Products
    const topSelling = await db.execute(sql`
      SELECT p.name, SUM(ti.quantity) as quantity
      FROM transaction_items ti
      JOIN transactions t ON t.id = ti.transaction_id
      JOIN products p ON p.id = ti.product_id
      WHERE t.type = 'sale'
      GROUP BY p.name
      ORDER BY quantity DESC
      LIMIT 5
    `);

    return {
      totalSales: Number(sales[0]?.total || 0),
      totalProfits: Number(profits.rows[0]?.profit || 0),
      lowStockCount: Number(lowStock[0]?.count || 0),
      recentTransactions: recent,
      topSellingProducts: topSelling.rows.map(row => ({
        name: row.name as string,
        quantity: Number(row.quantity),
      })),
    };
  }
}

export const storage = new DatabaseStorage();
