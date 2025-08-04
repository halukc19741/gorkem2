import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, date, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const banks = pgTable("banks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code"),
  contactInfo: text("contact_info"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const currencies = pgTable("currencies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  isActive: boolean("is_active").default(true),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  rate: decimal("rate", { precision: 12, scale: 6 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const guaranteeLetters = pgTable("guarantee_letters", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bankId: uuid("bank_id").notNull().references(() => banks.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  letterType: text("letter_type").notNull(), // teminat, avans, kesin-teminat, gecici-teminat
  contractAmount: decimal("contract_amount", { precision: 15, scale: 2 }).notNull(),
  letterPercentage: decimal("letter_percentage", { precision: 5, scale: 2 }).notNull(),
  letterAmount: decimal("letter_amount", { precision: 15, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  letterDate: date("letter_date").notNull(),
  expiryDate: date("expiry_date"),
  status: text("status").notNull().default("aktif"), // aktif, beklemede, kapali, iptal
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  guaranteeLetters: many(guaranteeLetters),
}));

export const banksRelations = relations(banks, ({ many }) => ({
  guaranteeLetters: many(guaranteeLetters),
}));

export const guaranteeLettersRelations = relations(guaranteeLetters, ({ one }) => ({
  bank: one(banks, {
    fields: [guaranteeLetters.bankId],
    references: [banks.id],
  }),
  project: one(projects, {
    fields: [guaranteeLetters.projectId],
    references: [projects.id],
  }),
}));

// Schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertBankSchema = createInsertSchema(banks).omit({
  id: true,
  createdAt: true,
});

export const insertCurrencySchema = createInsertSchema(currencies).omit({
  id: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  updatedAt: true,
});

export const insertGuaranteeLetterSchema = createInsertSchema(guaranteeLetters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Bank = typeof banks.$inferSelect;
export type InsertBank = z.infer<typeof insertBankSchema>;

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;

export type GuaranteeLetter = typeof guaranteeLetters.$inferSelect;
export type InsertGuaranteeLetter = z.infer<typeof insertGuaranteeLetterSchema>;

// Extended types with relations
export type GuaranteeLetterWithRelations = GuaranteeLetter & {
  bank: Bank;
  project: Project;
};
