import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const savedPlants = pgTable("saved_plants", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lwfPlantId: text("lwf_plant_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "cascade" }),
  visibility: text("visibility", {
    enum: ["private", "public", "org"],
  }).default("private"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tagAssignments = pgTable("tag_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tagId: uuid("tag_id").references(() => tags.id, { onDelete: "cascade" }),
  targetType: text("target_type", {
    enum: ["plant", "nursery", "property", "plan"],
  }),
  targetId: text("target_id"),
});

export const orgs = pgTable("orgs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["nursery", "hoa", "city", "landscaping_company", "other"],
  }),
  website: text("website"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orgMembers = pgTable("org_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "member"] }).default("member"),
});
