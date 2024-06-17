import { relations, sql } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const components = pgTable("components", {
	id: uuid("id").primaryKey().defaultRandom(),
	deviceId: uuid("device_id")
		.references(() => devices.id, { onDelete: "cascade" })
		.notNull(),
	label: text("label"),
	meta: jsonb("meta"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const componentRelations = relations(components, ({ one, many }) => ({
	device: one(devices, {
		fields: [components.deviceId],
		references: [devices.id],
	}),
	points: many(points),
}));

export const insertComponentSchema = createInsertSchema(components);
export type Component = typeof components.$inferSelect;
export type NewComponent = typeof components.$inferInsert;

export const devices = pgTable("devices", {
	id: uuid("id").primaryKey().defaultRandom(),
	shortCode: varchar("short_code", { length: 10 }).unique(),
	description: text("description"),
	meta: jsonb("meta"),
	projectId: uuid("project_id")
		.references(() => projects.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const deviceRelations = relations(devices, ({ one, many }) => ({
	project: one(projects, {
		fields: [devices.projectId],
		references: [projects.id],
	}),
	components: many(components),
}));

export const insertDeviceSchema = createInsertSchema(devices);
export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;

export const points = pgTable("points", {
	id: uuid("id").primaryKey().defaultRandom(),
	wireId: uuid("wire_id")
		.notNull()
		.references(() => wires.id, { onDelete: "cascade" }),
	componentId: uuid("component_id").references(() => components.id, {
		onDelete: "set null",
	}),
	order: integer("order"),
	identifier: text("identifier"),
	label: text("label"),
	group: text("group"),
	meta: jsonb("meta"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const pointRelations = relations(points, ({ one }) => ({
	wire: one(wires, {
		fields: [points.wireId],
		references: [wires.id],
	}),
	component: one(components, {
		fields: [points.componentId],
		references: [components.id],
	}),
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
	wires: many(wires),
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
		firstName: varchar("first_name", { length: 255 }).notNull(),
		lastName: varchar("last_name", { length: 255 }).notNull(),
		email: varchar("email", { length: 255 }).notNull().unique(),
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

export const wires = pgTable("wires", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").references(() => projects.id, {
		onDelete: "cascade",
	}),
	meta: jsonb("meta"),
	type: text("type"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const wireRelations = relations(wires, ({ one, many }) => ({
	project: one(projects, {
		fields: [wires.projectId],
		references: [projects.id],
	}),
	points: many(points),
}));

export const insertWireSchema = createInsertSchema(wires);
export type Wire = typeof wires.$inferSelect;
export type NewWire = typeof wires.$inferInsert;

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
