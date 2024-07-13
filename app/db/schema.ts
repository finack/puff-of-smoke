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
  varchar,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devicesDataSchema = z.object({
  vendor: z
    .object({
      name: z.string().optional(),
      model: z.string().optional(),
      url: z.string().optional(),
      partNumber: z.string().optional(),
      price: z.number().optional(),
    })
    .optional(),
  meta: z.any().optional(),
});

export const edge = pgTable("edge", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromNodeId: uuid("from_node_id"),
  toNodeId: uuid("to_node_id"),
  type: varchar("type", { length: 255 }), // wire type, data type, etc.
  fromNodeType: varchar("from_node_type", { length: 255 }),
  toNodeType: varchar("to_node_type", { length: 255 }),
});

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  shortCode: varchar("short_code", { length: 10 }).unique(),
  description: text("description"),
  data: jsonb("data").$type<z.infer<typeof devicesDataSchema>>(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const deviceRelations = relations(devices, ({ one }) => ({
  project: one(projects, {
    fields: [devices.projectId],
    references: [projects.id],
  }),
}));

export const insertDeviceSchema = createInsertSchema(devices);
export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;

export const pointsDataSchema = z.object({
  component: z
    .object({
      id: z.string().optional(), // Pin ID, eg "1"
      label: z.string().optional(), //  "Power 2"
      name: z.string().optional(), // Name of component P1004
    })
    .optional(),
});

export const points = pgTable("points", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: uuid("device_id").references(() => devices.id, {
    onDelete: "cascade",
  }),
  pointId: uuid("point_id").references(() => points.id, {
    onDelete: "cascade",
  }),
  data: jsonb("data").$type<z.infer<typeof pointsDataSchema>>(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const pointRelations = relations(points, ({ many }) => ({
  segments: many(segments),
}));

export const insertPointSchema = createInsertSchema(points);
export type Point = typeof points.$inferSelect;
export type NewPoint = typeof points.$inferInsert;

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
    isDefault: boolean("is_default").default(false),
    ownerId: uuid("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => {
    return {
      isDefaultUniqueIdx: uniqueIndex("is_default_unique_index")
        .on(table.isDefault)
        .where(sql`is_default = true`),
    };
  },
);

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  devices: many(devices),
}));

export const insertProjectSchema = createInsertSchema(projects);
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const userStatus = pgEnum("user_status", [
  "active",
  "inactive",
  "validating",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password"),
    status: userStatus("status"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(table.email),
    };
  },
);

export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userSessions = pgTable("user_sessions", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

export const segments = pgTable("segments", {
  id: uuid("id").primaryKey().defaultRandom(),
  startPointId: uuid("start_point_id")
    .references(() => points.id, {
      onDelete: "cascade",
    })
    .notNull(),
  endPointId: uuid("end_point_id")
    .references(() => points.id, {
      onDelete: "cascade",
    })
    .notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const segmentRelations = relations(segments, ({ one }) => ({
  startPoint: one(points, {
    fields: [segments.startPointId],
    references: [points.id],
  }),
  EndPoint: one(points, {
    fields: [segments.endPointId],
    references: [points.id],
  }),
}));

export const insertSegmentSchema = createInsertSchema(segments);
export type Segment = typeof segments.$inferSelect;
export type NewSegment = typeof segments.$inferInsert;

// biome-ignore lint/suspicious/noExplicitAny:
export function fromJson(jsonObj: any): any {
  for (const key in jsonObj) {
    if (typeof jsonObj[key] === "object" && jsonObj[key] !== null) {
      fromJson(jsonObj[key]);
    } else if (key === "createdAt" || key === "updatedAt") {
      jsonObj[key] = jsonObj[key] ? new Date(jsonObj[key]) : null;
    }
  }
  return jsonObj;
}
