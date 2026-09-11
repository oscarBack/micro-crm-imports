import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

export const getDb = (locals: APIContext["locals"]) => drizzle(locals.runtime.env.DB, { schema });
