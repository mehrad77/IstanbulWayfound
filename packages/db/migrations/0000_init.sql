CREATE TABLE `audit_fixtures` (
	`business_id` text PRIMARY KEY NOT NULL,
	`matrix` text NOT NULL,
	`competitors` text NOT NULL,
	`sources` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `audit_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`audit_id` text NOT NULL,
	`template_id` text NOT NULL,
	`prompt` text NOT NULL,
	`lang` text NOT NULL,
	`engine` text NOT NULL,
	`outcome` text NOT NULL,
	`source` text NOT NULL,
	`recommended` text NOT NULL,
	`cited` text NOT NULL,
	FOREIGN KEY (`audit_id`) REFERENCES `audits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audit_results_audit_idx` ON `audit_results` (`audit_id`);--> statement-breakpoint
CREATE TABLE `audits` (
	`id` text PRIMARY KEY NOT NULL,
	`business_name` text NOT NULL,
	`vertical` text NOT NULL,
	`district` text NOT NULL,
	`website` text,
	`languages` text NOT NULL,
	`matched_business_id` text,
	`score` integer NOT NULL,
	`visibility` integer NOT NULL,
	`website_score` integer NOT NULL,
	`signals` text NOT NULL,
	`analysis` text NOT NULL,
	`lead_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`matched_business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`vertical` text NOT NULL,
	`schema_type` text NOT NULL,
	`name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`website` text,
	`languages` text DEFAULT '[]' NOT NULL,
	`price_range` text,
	`rating_value` real,
	`rating_count` integer,
	`review_links` text DEFAULT '{}' NOT NULL,
	`wayfinding_video_url` text,
	`logo_key` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `businesses_slug_unique` ON `businesses` (`slug`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `categories_business_idx` ON `categories` (`business_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`business_id` text NOT NULL,
	`type` text NOT NULL,
	`lang` text,
	`currency` text,
	`staff` text,
	`path` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `events_business_idx` ON `events` (`business_id`,`type`,`created_at`);--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`package_id` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `faqs_business_idx` ON `faqs` (`business_id`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`category_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`sku` text,
	`price_kurus` integer,
	`price_from` integer DEFAULT false NOT NULL,
	`duration_min` integer,
	`sold_out` integer DEFAULT false NOT NULL,
	`photo_key` text,
	`dietary` text DEFAULT '[]' NOT NULL,
	`allergens` text DEFAULT '[]' NOT NULL,
	`fabric` text,
	`sizes` text DEFAULT '[]' NOT NULL,
	`moq` integer,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `items_business_idx` ON `items` (`business_id`);--> statement-breakpoint
CREATE INDEX `items_category_idx` ON `items` (`category_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`business_id` text,
	`name` text,
	`email` text,
	`whatsapp` text,
	`country` text,
	`lang` text,
	`payload` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`platform` text NOT NULL,
	`status` text DEFAULT 'missing' NOT NULL,
	`url` text,
	`notes` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_business_platform_idx` ON `listings` (`business_id`,`platform`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`street` text NOT NULL,
	`district` text NOT NULL,
	`city` text DEFAULT 'İstanbul' NOT NULL,
	`postal_code` text DEFAULT '' NOT NULL,
	`country` text DEFAULT 'TR' NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`hours` text DEFAULT '[]' NOT NULL,
	`is_primary` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `magic_links` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`key` text NOT NULL,
	`kind` text DEFAULT 'photo' NOT NULL,
	`content_type` text NOT NULL,
	`bytes` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_key_unique` ON `media` (`key`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`user_id` text NOT NULL,
	`business_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `business_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `package_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`stage` text NOT NULL,
	`owner` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `package_steps_package_idx` ON `package_steps` (`package_id`);--> statement-breakpoint
CREATE TABLE `packages` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`slug` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`days_in_istanbul` integer NOT NULL,
	`visits` integer NOT NULL,
	`price_from_kurus` integer NOT NULL,
	`languages` text DEFAULT '[]' NOT NULL,
	`inclusions` text DEFAULT '[]' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `packages_business_slug_idx` ON `packages` (`business_id`,`slug`);--> statement-breakpoint
CREATE TABLE `reply_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`tone` text NOT NULL,
	`text` text NOT NULL,
	`provider` text NOT NULL,
	`violations` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`staff` text,
	`message` text NOT NULL,
	`contact` text,
	`lang` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`platform` text NOT NULL,
	`author` text NOT NULL,
	`rating` integer NOT NULL,
	`lang` text NOT NULL,
	`text` text NOT NULL,
	`topics` text DEFAULT '[]' NOT NULL,
	`posted_at` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`reply_text` text,
	`replied_at` text,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_business_idx` ON `reviews` (`business_id`,`posted_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`languages` text DEFAULT '[]' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`category` text NOT NULL,
	`vertical` text,
	`lang` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`field` text NOT NULL,
	`lang` text NOT NULL,
	`value` text NOT NULL,
	`reviewed` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`entity`, `entity_id`, `field`, `lang`)
);
--> statement-breakpoint
CREATE INDEX `translations_entity_idx` ON `translations` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`demo_account` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_demo_account_unique` ON `users` (`demo_account`);