import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  doublePrecision,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { properties, plans } from "./core";
import { nurseryOrganizations } from "./nurseries";

/**
 * Orders table - tracks purchase requests from homeowners/landscapers to nurseries
 */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Who placed the order
  customerId: text("customer_id")
    .notNull()
    .references(() => user.id),
  customerType: text("customer_type", { 
    enum: ["homeowner", "landscaper"] 
  }).notNull(),
  
  // Fulfillment
  nurseryId: uuid("nursery_id").references(() => nurseryOrganizations.id),
  status: text("status", {
    enum: ["draft", "submitted", "confirmed", "fulfilled", "cancelled"]
  }).default("draft"),
  
  // Order context
  propertyId: uuid("property_id").references(() => properties.id),
  planId: uuid("plan_id").references(() => plans.id),
  
  // Order details
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  totalAmount: integer("total_amount"), // in cents
  platformFee: integer("platform_fee"), // in cents, configurable but not active initially
  
  // Contact & delivery
  deliveryAddress: jsonb("delivery_address").$type<DeliveryAddress>(),
  contactInfo: jsonb("contact_info").$type<ContactInfo>(),
  requestedDeliveryDate: timestamp("requested_delivery_date"),
  
  // Fulfillment tracking  
  nurseryNotes: text("nursery_notes"),
  estimatedReadyDate: timestamp("estimated_ready_date"),
  actualReadyDate: timestamp("actual_ready_date"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  submittedAt: timestamp("submitted_at"),
  confirmedAt: timestamp("confirmed_at"),
  fulfilledAt: timestamp("fulfilled_at"),
});

/**
 * Cart sessions - temporary storage for building orders
 */
export const cartSessions = pgTable("cart_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id),
  sessionId: text("session_id"), // for anonymous users
  nurseryId: uuid("nursery_id").references(() => nurseryOrganizations.id),
  items: jsonb("items").$type<CartItem[]>().default([]),
  propertyContext: jsonb("property_context").$type<PropertyContext>(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

/**
 * Nursery fulfillment tracking
 */
export const fulfillmentUpdates = pgTable("fulfillment_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  updatedBy: text("updated_by").references(() => user.id),
  status: text("status").notNull(),
  message: text("message"),
  estimatedDate: timestamp("estimated_date"),
  internalNotes: text("internal_notes"), // nursery-only notes
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Platform fee configuration (future revenue model)
 */
export const platformConfig = pgTable("platform_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  plantId: string; // LWF API plant ID
  plantName: string;
  quantity: number;
  unitPrice: number; // in cents
  totalPrice: number; // in cents
  size?: string; // "4-inch pot", "1-gallon", etc.
  notes?: string;
  // Nursery-specific data
  nurseryPlantId?: string; // Their internal SKU
  availability: "in-stock" | "order-on-demand" | "out-of-stock";
  leadTime?: string; // "2-3 weeks", "available now"
}

export interface CartItem extends OrderItem {
  addedAt: Date;
  zone?: string; // Which fire zone this is intended for
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  specialInstructions?: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  preferredContact: "email" | "phone";
}

export interface PropertyContext {
  propertyId?: string;
  planId?: string;
  address?: string;
  fireZones?: string[];
}