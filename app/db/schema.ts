import { relations, sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

// Inspiration for autoupdating updatedAt at a later time
// updateCounter: integer('update_counter').default(sql`1`).$onUpdateFn((): SQL => sql`${table.update_counter} + 1`),
// updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),


export const devices = pgTable("devices", {
  id: uuid("uuid").primaryKey().defaultRandom(),
  shortCode: varchar("short_code", { length: 10 }).unique(),
  vendor: varchar("vendor", { length: 255 }),
  model: varchar("model", { length: 255 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  meta: jsonb("meta"),
  projectId: uuid("project_uuid").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const deviceRelations = relations(devices, ({ one }) => ({
  project: one(projects, {
    fields: [devices.projectId],
    references: [projects.id]
  })
}));

export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;

export const projects = pgTable("projects", {
  id: uuid("uuid").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  isDefault: boolean("is_default").default(false),
  ownerId: uuid("owner_uuid").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => {
  return {
    isDefaultUniqueIdx: uniqueIndex("is_default_unique_index").on(table.isDefault).where(sql`is_default = true`)
  }
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const projectRelations = relations(projects, ({ one, many }) => ({
  users: one(users, {
    fields: [projects.ownerId],
    references: [users.id]
  }),
  devices: many(devices),
}));

export const userStatus = pgEnum('user_status', ["active", "inactive", "validating"]);

export const users = pgTable("users", {
  id: uuid("uuid").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  status: userStatus("status"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => {
  return {
    emailIdx: uniqueIndex("email_idx").on(table.email)
  }
});

export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects)
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const wires = pgTable("wires", {
  id: uuid("uuid").primaryKey().defaultRandom(),
  project: uuid("project").references(() => projects.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export type Wire = typeof wires.$inferSelect;
export type NewWire = typeof wires.$inferInsert;

// biome-ignore lint/suspicious/noExplicitAny:
export function fromJson(jsonObj: any): any {
  for (const key in jsonObj) {
    if (typeof jsonObj[key] === 'object' && jsonObj[key] !== null) {
      fromJson(jsonObj[key]);
    } else if (key === 'createdAt' || key === 'updatedAt') {
      jsonObj[key] = jsonObj[key] ? new Date(jsonObj[key]) : null;
    }
  }
  return jsonObj;
}
