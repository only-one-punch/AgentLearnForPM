import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId)
  })
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId)
  })
);

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
});

export const contentVersions = sqliteTable(
  "content_versions",
  {
    id: text("id").primaryKey(),
    gitSha: text("git_sha"),
    contentHash: text("content_hash").notNull(),
    generatedAt: integer("generated_at", { mode: "timestamp_ms" }).notNull(),
    documentCount: integer("document_count").notNull(),
    artifactPath: text("artifact_path").notNull().default(".generated/knowledge"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`)
  },
  (table) => ({
    contentHashIdx: uniqueIndex("content_versions_content_hash_idx").on(table.contentHash)
  })
);

export const readingProgress = sqliteTable(
  "reading_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentSlug: text("document_slug").notNull(),
    sectionId: text("section_id"),
    scrollPercent: real("scroll_percent").notNull().default(0),
    completedPercent: real("completed_percent").notNull().default(0),
    lastReadAt: integer("last_read_at", { mode: "timestamp_ms" }).notNull(),
    contentVersionId: text("content_version_id").references(() => contentVersions.id, {
      onDelete: "set null"
    })
  },
  (table) => ({
    userDocIdx: uniqueIndex("reading_progress_user_doc_idx").on(table.userId, table.documentSlug),
    userIdx: index("reading_progress_user_idx").on(table.userId)
  })
);

export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentSlug: text("document_slug").notNull(),
    sectionId: text("section_id"),
    anchorId: text("anchor_id"),
    excerpt: text("excerpt"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    contentVersionId: text("content_version_id").references(() => contentVersions.id, {
      onDelete: "set null"
    })
  },
  (table) => ({
    userDocSectionIdx: index("bookmarks_user_doc_section_idx").on(
      table.userId,
      table.documentSlug,
      table.sectionId
    )
  })
);

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentSlug: text("document_slug").notNull(),
    sectionId: text("section_id"),
    anchorId: text("anchor_id"),
    selectedText: text("selected_text"),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    contentVersionId: text("content_version_id").references(() => contentVersions.id, {
      onDelete: "set null"
    })
  },
  (table) => ({
    userDocIdx: index("notes_user_doc_idx").on(table.userId, table.documentSlug)
  })
);

export const selfTestStates = sqliteTable(
  "self_test_states",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    documentSlug: text("document_slug").notNull(),
    status: text("status", { enum: ["mastered", "uncertain", "not_yet"] }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    contentVersionId: text("content_version_id").references(() => contentVersions.id, {
      onDelete: "set null"
    })
  },
  (table) => ({
    userItemIdx: uniqueIndex("self_test_states_user_item_idx").on(table.userId, table.itemId),
    weakReviewIdx: index("self_test_states_weak_review_idx").on(table.userId, table.status)
  })
);

export const studyEvents = sqliteTable(
  "study_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventType: text("event_type", {
      enum: ["read", "bookmark", "note", "self_test", "search", "refresh"]
    }).notNull(),
    documentSlug: text("document_slug"),
    sectionId: text("section_id"),
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull()
  },
  (table) => ({
    userRecentIdx: index("study_events_user_recent_idx").on(table.userId, table.createdAt)
  })
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  readingProgress: many(readingProgress),
  bookmarks: many(bookmarks),
  notes: many(notes),
  selfTestStates: many(selfTestStates),
  studyEvents: many(studyEvents)
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}));

export const contentVersionRelations = relations(contentVersions, ({ many }) => ({
  readingProgress: many(readingProgress),
  bookmarks: many(bookmarks),
  notes: many(notes),
  selfTestStates: many(selfTestStates)
}));
