CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_user_id` text,
	`client_id` text,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE cascade ON DELETE set null,
	CONSTRAINT "accounts_role_check" CHECK("accounts"."role" IN ('admin', 'client'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_clerk_user_id_unique` ON `accounts` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `accounts_role_idx` ON `accounts` (`role`);--> statement-breakpoint
CREATE INDEX `accounts_client_id_idx` ON `accounts` (`client_id`);--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_user_id` text,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_email_unique` ON `clients` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `clients_clerk_user_id_unique` ON `clients` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `clients_name_idx` ON `clients` (`name`);--> statement-breakpoint
CREATE INDEX `clients_updated_at_idx` ON `clients` (`updated_at`);--> statement-breakpoint
CREATE TABLE `deadlines` (
	`id` text PRIMARY KEY NOT NULL,
	`sub_order_id` text NOT NULL,
	`kind` text NOT NULL,
	`due_at` text NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`sub_order_id`) REFERENCES `sub_orders`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deadlines_sub_order_due_idx` ON `deadlines` (`sub_order_id`,`due_at`);--> statement-breakpoint
CREATE TABLE `extra_charges` (
	`id` text PRIMARY KEY NOT NULL,
	`sub_order_id` text NOT NULL,
	`kind` text NOT NULL,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`sub_order_id`) REFERENCES `sub_orders`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `extra_charges_sub_order_idx` ON `extra_charges` (`sub_order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`external_ref` text NOT NULL,
	`ordered_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_external_ref_unique` ON `orders` (`external_ref`);--> statement-breakpoint
CREATE INDEX `orders_provider_ordered_idx` ON `orders` (`provider_id`,`ordered_at`);--> statement-breakpoint
CREATE INDEX `orders_updated_at_idx` ON `orders` (`updated_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_provider_sku_unique` ON `products` (`provider_id`,`sku`);--> statement-breakpoint
CREATE INDEX `products_provider_name_idx` ON `products` (`provider_id`,`name`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`address` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `providers_email_unique` ON `providers` (`email`);--> statement-breakpoint
CREATE INDEX `providers_name_idx` ON `providers` (`name`);--> statement-breakpoint
CREATE INDEX `providers_updated_at_idx` ON `providers` (`updated_at`);--> statement-breakpoint
CREATE TABLE `sub_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`sub_order_id` text NOT NULL,
	`product_id` text,
	`product_name_snapshot` text NOT NULL,
	`options_json` text DEFAULT '{}' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price_cents` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`sub_order_id`) REFERENCES `sub_orders`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sub_order_items_sub_order_idx` ON `sub_order_items` (`sub_order_id`);--> statement-breakpoint
CREATE INDEX `sub_order_items_product_idx` ON `sub_order_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `sub_order_providers` (
	`sub_order_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`sub_order_id`, `provider_id`),
	FOREIGN KEY (`sub_order_id`) REFERENCES `sub_orders`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE cascade ON DELETE restrict,
	CONSTRAINT "sub_order_providers_status_check" CHECK("sub_order_providers"."status" IN ('Pending', 'Confirmed', 'Shipped', 'Delivered'))
);
--> statement-breakpoint
CREATE INDEX `sub_order_providers_status_idx` ON `sub_order_providers` (`status`);--> statement-breakpoint
CREATE TABLE `sub_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`client_id` text NOT NULL,
	`total_cents` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `sub_orders_order_id_idx` ON `sub_orders` (`order_id`);--> statement-breakpoint
CREATE INDEX `sub_orders_client_id_idx` ON `sub_orders` (`client_id`);--> statement-breakpoint
CREATE INDEX `sub_orders_updated_at_idx` ON `sub_orders` (`updated_at`);