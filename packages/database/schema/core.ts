import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  parcelBoundary: jsonb("parcel_boundary"),
  structureFootprints: jsonb("structure_footprints"),
  fireZones: jsonb("fire_zones"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }),
  createdBy: text("created_by").references(() => user.id),
  name: text("name"),
  status: text("status", {
    enum: ["draft", "submitted", "under_review", "approved", "completed"],
  }).default("draft"),
  plantPlacements: jsonb("plant_placements"),
  estimatedCost: integer("estimated_cost"),
  complianceScore: integer("compliance_score"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const landscaperClients = pgTable("landscaper_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  landscaperId: text("landscaper_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["active", "pending", "completed"],
  }).default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});
