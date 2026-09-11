import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const accountRoles = ["admin", "client"] as const;
export type AccountRole = (typeof accountRoles)[number];

export const subOrderStatuses = ["Pending", "Confirmed", "Shipped", "Delivered"] as const;
export type SubOrderStatus = (typeof subOrderStatuses)[number];

const withAuditColumns = () => ({
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  version: integer("version").notNull().default(1),
});

export const providers = sqliteTable(
  "providers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    ...withAuditColumns(),
  },
  (table) => [
    uniqueIndex("providers_email_unique").on(table.email),
    index("providers_name_idx").on(table.name),
    index("providers_updated_at_idx").on(table.updatedAt),
  ],
);

export const clients = sqliteTable(
  "clients",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id"),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    ...withAuditColumns(),
  },
  (table) => [
    uniqueIndex("clients_email_unique").on(table.email),
    uniqueIndex("clients_clerk_user_id_unique").on(table.clerkUserId),
    index("clients_name_idx").on(table.name),
    index("clients_updated_at_idx").on(table.updatedAt),
  ],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id"),
    clientId: text("client_id").references(() => clients.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    email: text("email").notNull(),
    role: text("role", { enum: accountRoles }).notNull(),
    ...withAuditColumns(),
  },
  (table) => [
    uniqueIndex("accounts_email_unique").on(table.email),
    uniqueIndex("accounts_clerk_user_id_unique").on(table.clerkUserId),
    index("accounts_role_idx").on(table.role),
    index("accounts_client_id_idx").on(table.clientId),
    check("accounts_role_check", sql`${table.role} IN ('admin', 'client')`),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "restrict", onUpdate: "cascade" }),
    externalRef: text("external_ref").notNull(),
    orderedAt: text("ordered_at").notNull(),
    ...withAuditColumns(),
  },
  (table) => [
    uniqueIndex("orders_external_ref_unique").on(table.externalRef),
    index("orders_provider_ordered_idx").on(table.providerId, table.orderedAt),
    index("orders_updated_at_idx").on(table.updatedAt),
  ],
);

export const subOrders = sqliteTable(
  "sub_orders",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict", onUpdate: "cascade" }),
    totalCents: integer("total_cents").notNull().default(0),
    ...withAuditColumns(),
  },
  (table) => [
    index("sub_orders_order_id_idx").on(table.orderId),
    index("sub_orders_client_id_idx").on(table.clientId),
    index("sub_orders_updated_at_idx").on(table.updatedAt),
  ],
);

export const subOrderProviders = sqliteTable(
  "sub_order_providers",
  {
    subOrderId: text("sub_order_id")
      .notNull()
      .references(() => subOrders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "restrict", onUpdate: "cascade" }),
    status: text("status", { enum: subOrderStatuses }).notNull().default("Pending"),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    version: integer("version").notNull().default(1),
  },
  (table) => [
    primaryKey({ columns: [table.subOrderId, table.providerId] }),
    index("sub_order_providers_status_idx").on(table.status),
    check(
      "sub_order_providers_status_check",
      sql`${table.status} IN ('Pending', 'Confirmed', 'Shipped', 'Delivered')`,
    ),
  ],
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    ...withAuditColumns(),
  },
  (table) => [
    uniqueIndex("products_provider_sku_unique").on(table.providerId, table.sku),
    index("products_provider_name_idx").on(table.providerId, table.name),
  ],
);

export const subOrderItems = sqliteTable(
  "sub_order_items",
  {
    id: text("id").primaryKey(),
    subOrderId: text("sub_order_id")
      .notNull()
      .references(() => subOrders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    optionsJson: text("options_json").notNull().default("{}"),
    quantity: integer("quantity").notNull().default(1),
    unitPriceCents: integer("unit_price_cents").notNull().default(0),
    ...withAuditColumns(),
  },
  (table) => [
    index("sub_order_items_sub_order_idx").on(table.subOrderId),
    index("sub_order_items_product_idx").on(table.productId),
  ],
);

export const deadlines = sqliteTable(
  "deadlines",
  {
    id: text("id").primaryKey(),
    subOrderId: text("sub_order_id")
      .notNull()
      .references(() => subOrders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    kind: text("kind").notNull(),
    dueAt: text("due_at").notNull(),
    completedAt: text("completed_at"),
    ...withAuditColumns(),
  },
  (table) => [index("deadlines_sub_order_due_idx").on(table.subOrderId, table.dueAt)],
);

export const extraCharges = sqliteTable(
  "extra_charges",
  {
    id: text("id").primaryKey(),
    subOrderId: text("sub_order_id")
      .notNull()
      .references(() => subOrders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    kind: text("kind").notNull(),
    amountCents: integer("amount_cents").notNull().default(0),
    ...withAuditColumns(),
  },
  (table) => [index("extra_charges_sub_order_idx").on(table.subOrderId)],
);
