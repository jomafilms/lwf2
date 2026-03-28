import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const nurseries = pgTable("nurseries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  description: text("description"),
  supplyCategories: jsonb("supply_categories"),
  isRetail: boolean("is_retail").default(false),
  isWholesale: boolean("is_wholesale").default(false),
  servesLandscapers: boolean("serves_landscapers").default(false),
  hasFirewiseData: boolean("has_firewise_data").default(false),
  connectionType: text("connection_type", {
    enum: ["manual", "csv_upload", "api", "pos_integration"],
  }).default("manual"),
  apiEndpoint: text("api_endpoint"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nurseryInventory = pgTable("nursery_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  nurseryId: uuid("nursery_id").references(() => nurseries.id, {
    onDelete: "cascade",
  }),
  lwfPlantId: text("lwf_plant_id"),
  botanicalName: text("botanical_name"),
  commonName: text("common_name"),
  price: integer("price"),
  containerSize: text("container_size"),
  availability: text("availability", {
    enum: ["in_stock", "limited", "out_of_stock", "seasonal"],
  }),
  sourceUrl: text("source_url"),
  lastUpdated: timestamp("last_updated"),
});
