CREATE TABLE `enquiries` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(30),
	`subject` varchar(60) NOT NULL,
	`message` text NOT NULL,
	`status` enum('New','Contacted','Closed') NOT NULL DEFAULT 'New',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`property_id` int unsigned,
	`property_title` varchar(120) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`method` varchar(30),
	`message` text,
	`status` enum('New','Contacted','Qualified','Closed') NOT NULL DEFAULT 'New',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`title` varchar(120) NOT NULL,
	`status` enum('For Sale','Pending','Sold','Draft') NOT NULL DEFAULT 'Draft',
	`price` int unsigned NOT NULL,
	`city` varchar(80) NOT NULL,
	`province_code` char(2) NOT NULL,
	`address` varchar(160),
	`postal_code` varchar(7),
	`description` text,
	`type` enum('Detached','Semi-Detached','Condo','Townhouse','Cottage','Land'),
	`beds` int unsigned,
	`baths` decimal(3,1),
	`sqft` int unsigned,
	`lot_size` varchar(80),
	`parking` varchar(80),
	`year_built` int unsigned,
	`image_url` varchar(1024),
	`gallery` json NOT NULL,
	`features` json NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `provinces` (
	`code` char(2) NOT NULL,
	`name` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `provinces_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` char(64) NOT NULL,
	`user_id` int unsigned NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('super_admin','employee') NOT NULL DEFAULT 'employee',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_property_id_properties_id_fk` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_province_code_provinces_code_fk` FOREIGN KEY (`province_code`) REFERENCES `provinces`(`code`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `enquiries_created_idx` ON `enquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `leads_created_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `properties_status_idx` ON `properties` (`status`);--> statement-breakpoint
CREATE INDEX `properties_city_idx` ON `properties` (`city`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);