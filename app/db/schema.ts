import { relations, sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const edges = pgTable("edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  nodeA: uuid("node_a_id")
    .references(() => nodes.id, {
      onDelete: "cascade",
    })
    .notNull(),
  nodeB: uuid("node_b_id")
    .references(() => nodes.id, {
      onDelete: "cascade",
    })
    .notNull(),
  typeData: jsonb("type_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const edgeRelations = relations(edges, ({ one }) => ({
  oneSideId: one(nodes, {
    fields: [edges.nodeA],
    references: [nodes.id],
  }),
  EndPoint: one(nodes, {
    fields: [edges.nodeB],
    references: [nodes.id],
  }),
}));

export const insertEdgeSchema = createInsertSchema(edges);
export type Edge = typeof edges.$inferSelect;
export type NewEdge = typeof edges.$inferInsert;

const deviceNodeKindSchema = z.object({
  kind: z.literal("device"),
  vendor: z.object({
    name: z.string(),
    model: z.string().optional(),
    url: z.string().optional(),
    partNumber: z.string().optional(),
    price: z.number().optional(),
  }),
});

export const connectorNodeKindSchema = z.object({
  kind: z.literal("connector"),
});

export const pointNodeKindSchema = z.object({
  kind: z.literal("point"),
});

export const nodeKindDataSchema = z.discriminatedUnion("kind", [
  deviceNodeKindSchema,
  connectorNodeKindSchema,
  pointNodeKindSchema,
]);

export const nodeKinds = z.enum(["device", "connector", "point"]);

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  kind: text("kind").notNull().$type<z.infer<typeof nodeKinds>>(),
  kindData: jsonb("kind_data").$type<z.infer<typeof nodeKindDataSchema>>(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const nodeRelations = relations(nodes, ({ many }) => ({
  NodeAId: many(edges),
  NodeBId: many(edges),
}));

export const insertNodeSchema = createInsertSchema(nodes);
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
    isDefault: boolean("is_default").default(false),
    ownerId: uuid("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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
  edges: many(edges),
  nodes: many(nodes),
}));

export const insertProjectSchema = createInsertSchema(projects);
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const userStatus = z.enum(["active", "inactive", "validating"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password"),
    status: text("status").$type<z.infer<typeof userStatus>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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
    .defaultNow(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
