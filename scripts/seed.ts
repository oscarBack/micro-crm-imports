import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { faker } from "@faker-js/faker";

const run = promisify(execFile);

type SqlValue = number | string | null;

type SqlRow = Record<string, SqlValue>;

const sqlEscape = (value: string) => value.replace(/'/g, "''");

const toSqlValue = (value: SqlValue) => {
  if (value === null) {
    return "NULL";
  }

  if (typeof value === "number") {
    return `${value}`;
  }

  return `'${sqlEscape(value)}'`;
};

const buildUpsertById = (table: string, columns: string[], rows: SqlRow[]) => {
  const updateColumns = columns.filter((column) => column !== "id");

  return rows
    .map((row) => {
      const values = columns.map((column) => toSqlValue(row[column] ?? null)).join(", ");
      const updates = updateColumns.map((column) => `${column} = excluded.${column}`).join(", ");

      return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values}) ON CONFLICT(id) DO UPDATE SET ${updates};`;
    })
    .join("\n");
};

const buildUpsertByComposite = (
  table: string,
  columns: string[],
  conflictColumns: string[],
  rows: SqlRow[],
) => {
  const updateColumns = columns.filter((column) => !conflictColumns.includes(column));

  return rows
    .map((row) => {
      const values = columns.map((column) => toSqlValue(row[column] ?? null)).join(", ");
      const updates = updateColumns.map((column) => `${column} = excluded.${column}`).join(", ");

      return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values}) ON CONFLICT(${conflictColumns.join(", ")}) DO UPDATE SET ${updates};`;
    })
    .join("\n");
};

const now = new Date().toISOString();

faker.seed(20260826);

const providers = [
  {
    id: "provider_001",
    name: "Seoul Merch Hub",
    contact_name: faker.person.fullName(),
    email: "contact@seoulhub.example",
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "provider_002",
    name: "Incheon Goods Lab",
    contact_name: faker.person.fullName(),
    email: "contact@incheongoods.example",
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const clients = [
  {
    id: "client_001",
    clerk_user_id: null,
    email: faker.internet.email({ firstName: "ana", lastName: "lee", provider: "example.com" }).toLowerCase(),
    name: "Ana Lee",
    phone: faker.phone.number(),
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "client_002",
    clerk_user_id: null,
    email: faker.internet
      .email({ firstName: "bruno", lastName: "kim", provider: "example.com" })
      .toLowerCase(),
    name: "Bruno Kim",
    phone: faker.phone.number(),
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "client_003",
    clerk_user_id: null,
    email: faker.internet
      .email({ firstName: "camila", lastName: "park", provider: "example.com" })
      .toLowerCase(),
    name: "Camila Park",
    phone: faker.phone.number(),
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const accounts: SqlRow[] = clients.map((client, index) => ({
  id: `account_00${index + 1}`,
  clerk_user_id: null,
  client_id: client.id,
  email: client.email,
  role: "client",
  created_at: now,
  updated_at: now,
  version: 1,
}));

accounts.push({
  id: "account_admin_001",
  clerk_user_id: "clerk_admin_seed",
  client_id: null,
  email: "admin@microcrm.example",
  role: "admin",
  created_at: now,
  updated_at: now,
  version: 1,
});

const orders = [
  {
    id: "order_001",
    provider_id: "provider_001",
    external_ref: "SOUL-2026-001",
    ordered_at: new Date("2026-08-10T00:00:00.000Z").toISOString(),
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "order_002",
    provider_id: "provider_002",
    external_ref: "INCH-2026-002",
    ordered_at: new Date("2026-08-12T00:00:00.000Z").toISOString(),
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const subOrders = [
  {
    id: "sub_001",
    order_id: "order_001",
    client_id: "client_001",
    total_cents: 15200,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "sub_002",
    order_id: "order_001",
    client_id: "client_002",
    total_cents: 20900,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "sub_003",
    order_id: "order_002",
    client_id: "client_003",
    total_cents: 9800,
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const subOrderProviders = [
  {
    sub_order_id: "sub_001",
    provider_id: "provider_001",
    status: "Pending",
    updated_at: now,
    version: 1,
  },
  {
    sub_order_id: "sub_002",
    provider_id: "provider_001",
    status: "Confirmed",
    updated_at: now,
    version: 1,
  },
  {
    sub_order_id: "sub_003",
    provider_id: "provider_002",
    status: "Shipped",
    updated_at: now,
    version: 1,
  },
];

const products = [
  {
    id: "product_001",
    provider_id: "provider_001",
    sku: "KR-TS-001",
    name: "K-POP Tee",
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "product_002",
    provider_id: "provider_001",
    sku: "KR-BG-002",
    name: "Collector Bag",
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "product_003",
    provider_id: "provider_002",
    sku: "KR-HD-003",
    name: "Limited Hoodie",
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const subOrderItems = [
  {
    id: "item_001",
    sub_order_id: "sub_001",
    product_id: "product_001",
    product_name_snapshot: "K-POP Tee",
    options_json: JSON.stringify({ size: "M", color: "Black" }),
    quantity: 1,
    unit_price_cents: 4200,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "item_002",
    sub_order_id: "sub_002",
    product_id: "product_002",
    product_name_snapshot: "Collector Bag",
    options_json: JSON.stringify({ style: "Glossy" }),
    quantity: 2,
    unit_price_cents: 7500,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "item_003",
    sub_order_id: "sub_003",
    product_id: "product_003",
    product_name_snapshot: "Limited Hoodie",
    options_json: JSON.stringify({ size: "L" }),
    quantity: 1,
    unit_price_cents: 9200,
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const deadlines = [
  {
    id: "deadline_001",
    sub_order_id: "sub_001",
    kind: "payment",
    due_at: new Date("2026-08-29T00:00:00.000Z").toISOString(),
    completed_at: null,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "deadline_002",
    sub_order_id: "sub_002",
    kind: "confirmation",
    due_at: new Date("2026-08-31T00:00:00.000Z").toISOString(),
    completed_at: null,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "deadline_003",
    sub_order_id: "sub_003",
    kind: "delivery",
    due_at: new Date("2026-09-10T00:00:00.000Z").toISOString(),
    completed_at: null,
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const extraCharges = [
  {
    id: "charge_001",
    sub_order_id: "sub_001",
    kind: "domestic_shipping",
    amount_cents: 1200,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "charge_002",
    sub_order_id: "sub_002",
    kind: "tax",
    amount_cents: 1800,
    created_at: now,
    updated_at: now,
    version: 1,
  },
  {
    id: "charge_003",
    sub_order_id: "sub_003",
    kind: "late_fee",
    amount_cents: 600,
    created_at: now,
    updated_at: now,
    version: 1,
  },
];

const sqlStatements = [
  "PRAGMA foreign_keys = ON;",
  buildUpsertById(
    "providers",
    ["id", "name", "contact_name", "email", "phone", "address", "created_at", "updated_at", "version"],
    providers,
  ),
  buildUpsertById(
    "clients",
    ["id", "clerk_user_id", "email", "name", "phone", "created_at", "updated_at", "version"],
    clients,
  ),
  buildUpsertById(
    "accounts",
    ["id", "clerk_user_id", "client_id", "email", "role", "created_at", "updated_at", "version"],
    accounts,
  ),
  buildUpsertById(
    "orders",
    ["id", "provider_id", "external_ref", "ordered_at", "created_at", "updated_at", "version"],
    orders,
  ),
  buildUpsertById(
    "sub_orders",
    ["id", "order_id", "client_id", "total_cents", "created_at", "updated_at", "version"],
    subOrders,
  ),
  buildUpsertByComposite(
    "sub_order_providers",
    ["sub_order_id", "provider_id", "status", "updated_at", "version"],
    ["sub_order_id", "provider_id"],
    subOrderProviders,
  ),
  buildUpsertById(
    "products",
    ["id", "provider_id", "sku", "name", "created_at", "updated_at", "version"],
    products,
  ),
  buildUpsertById(
    "sub_order_items",
    [
      "id",
      "sub_order_id",
      "product_id",
      "product_name_snapshot",
      "options_json",
      "quantity",
      "unit_price_cents",
      "created_at",
      "updated_at",
      "version",
    ],
    subOrderItems,
  ),
  buildUpsertById(
    "deadlines",
    [
      "id",
      "sub_order_id",
      "kind",
      "due_at",
      "completed_at",
      "created_at",
      "updated_at",
      "version",
    ],
    deadlines,
  ),
  buildUpsertById(
    "extra_charges",
    ["id", "sub_order_id", "kind", "amount_cents", "created_at", "updated_at", "version"],
    extraCharges,
  ),
];

const sqlPayload = `${sqlStatements.join("\n")}\n`;

const tempDirectory = await mkdtemp(join(tmpdir(), "micro-crm-imports-seed-"));
const sqlPath = join(tempDirectory, "seed.sql");

await writeFile(sqlPath, sqlPayload, "utf8");

try {
  const { stderr, stdout } = await run(
    "pnpm",
    ["exec", "wrangler", "d1", "execute", "micro_crm_imports", "--local", "--file", sqlPath],
    {
      env: process.env,
      cwd: process.cwd(),
    },
  );

  if (stdout) {
    process.stdout.write(stdout);
  }

  if (stderr) {
    process.stderr.write(stderr);
  }

  process.stdout.write("Local D1 seed completed.\n");
} catch (error) {
  process.stderr.write("Failed to seed local D1.\n");
  throw error;
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
