import { z } from 'zod';
import {
  insertUserSchema, users,
  insertProductSchema, products,
  insertPartnerSchema, partners,
  insertSettingsSchema, settings,
  createTransactionRequestSchema,
  transactions,
  insertEmployeeSchema, employees,
  insertSalarySchema, salaries,
  insertAccountSchema, accounts,
  insertJournalEntrySchema, journalEntries,
  insertJournalItemSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === USERS ===
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === EMPLOYEES (HR) ===
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees',
      responses: {
        200: z.array(z.custom<typeof employees.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/employees/:id',
      responses: {
        200: z.custom<typeof employees.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees',
      input: insertEmployeeSchema,
      responses: {
        201: z.custom<typeof employees.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/employees/:id',
      input: insertEmployeeSchema.partial(),
      responses: {
        200: z.custom<typeof employees.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/employees/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === SALARIES (HR) ===
  salaries: {
    list: {
      method: 'GET' as const,
      path: '/api/salaries',
      input: z.object({
        employeeId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof salaries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/salaries',
      input: insertSalarySchema,
      responses: {
        201: z.custom<typeof salaries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // === ACCOUNTING (CHART OF ACCOUNTS) ===
  accounts: {
    list: {
      method: 'GET' as const,
      path: '/api/accounts',
      responses: {
        200: z.array(z.custom<typeof accounts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/accounts',
      input: insertAccountSchema,
      responses: {
        201: z.custom<typeof accounts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // === JOURNAL ENTRIES ===
  journalEntries: {
    list: {
      method: 'GET' as const,
      path: '/api/journal-entries',
      responses: {
        200: z.array(z.custom<typeof journalEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/journal-entries',
      input: z.object({
        description: z.string(),
        entryDate: z.string().optional(),
        reference: z.string().optional(),
        items: z.array(z.object({
          accountId: z.number(),
          debit: z.number(),
          credit: z.number(),
        })),
      }),
      responses: {
        201: z.custom<typeof journalEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // === PRODUCTS ===
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      input: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === PARTNERS (Customers/Suppliers) ===
  partners: {
    list: {
      method: 'GET' as const,
      path: '/api/partners',
      input: z.object({
        type: z.enum(['customer', 'supplier']).optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof partners.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/partners/:id',
      responses: {
        200: z.custom<typeof partners.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/partners',
      input: insertPartnerSchema,
      responses: {
        201: z.custom<typeof partners.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/partners/:id',
      input: insertPartnerSchema.partial(),
      responses: {
        200: z.custom<typeof partners.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/partners/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === TRANSACTIONS ===
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      input: z.object({
        type: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions',
      input: createTransactionRequestSchema,
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/transactions/:id',
      responses: {
        200: z.object({
          transaction: z.custom<typeof transactions.$inferSelect>(),
          items: z.array(z.any()), // Items structure
          partner: z.any().optional(),
          user: z.any().optional(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },

  // === SETTINGS ===
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },

  // === REPORTS ===
  reports: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/reports/dashboard',
      responses: {
        200: z.object({
          totalSales: z.number(),
          totalProfits: z.number(),
          lowStockCount: z.number(),
          lowStockProducts: z.array(z.custom<typeof products.$inferSelect>()),
          recentTransactions: z.array(z.custom<typeof transactions.$inferSelect>()),
          topSellingProducts: z.array(z.object({ name: z.string(), quantity: z.number() })),
          breakdown: z.object({
            sales: z.number(),
            purchases: z.number(),
            saleReturns: z.number(),
            purchaseReturns: z.number(),
            adjustments: z.number(),
          }),
        }),
      },
    },
  },

  // === SYNC ===
  sync: {
    status: {
      method: 'GET' as const,
      path: '/api/sync/status',
      responses: {
        200: z.object({
          lastSync: z.string().optional(),
          status: z.string(),
        }),
      },
    },
    process: {
      method: 'POST' as const,
      path: '/api/sync/process',
      input: z.object({
        products: z.array(z.any()),
        partners: z.array(z.any()),
        transactions: z.array(z.any()),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          receivedCount: z.object({
            products: z.number(),
            partners: z.number(),
            transactions: z.number(),
          }),
        }),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
