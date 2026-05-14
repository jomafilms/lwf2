import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  doublePrecision,
  index,
  customType,
} from "drizzle-orm/pg-core";

// Custom pgvector type — Neon supports pgvector natively
const vector = customType<{ data: number[]; dpiverType: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown) {
    if (typeof value === "string") {
      return value
        .slice(1, -1)
        .split(",")
        .map(Number);
    }
    return value as number[];
  },
});
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
  assessment: jsonb("assessment"),
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
  readinessScore: integer("readiness_score"),
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

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title"), // auto-generated from first message
  messages: jsonb("messages").notNull(), // ChatItem[]
  propertyId: uuid("property_id").references(() => properties.id), // optional link to property
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Conversation Summaries (cross-session memory) ──────────────────

export const conversationSummaries = pgTable(
  "conversation_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    topics: jsonb("topics"), // ["juniper removal", "zone 0", "deer resistance"]
    embedding: vector("embedding"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("conversation_summaries_user_idx").on(table.userId),
  ]
);

// ── RAG Knowledge Base ──────────────────────────────────────────────

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  sourceUrl: text("source_url"),
  docType: text("doc_type", {
    enum: ["pdf", "web", "text", "cwpp", "ccr", "guide"],
  }).notNull(),
  trustTier: integer("trust_tier").notNull().default(4), // 1=local code, 2=agency, 3=science, 4=general
  status: text("status", {
    enum: ["pending", "processing", "ready", "error"],
  }).default("pending"),
  metadata: jsonb("metadata"), // { pages, fileSize, author, jurisdiction, etc. }
  errorMessage: text("error_message"),
  chunkCount: integer("chunk_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"), // self-ref to parent chunk (children have embeddings, parents have full context)
    content: text("content").notNull(),
    sectionTitle: text("section_title"),
    pageNumber: integer("page_number"),
    chunkIndex: integer("chunk_index").notNull(), // order within document
    embedding: vector("embedding"), // vector(1536) — only child chunks get embeddings
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("knowledge_chunks_document_idx").on(table.documentId),
    index("knowledge_chunks_parent_idx").on(table.parentId),
  ]
);
