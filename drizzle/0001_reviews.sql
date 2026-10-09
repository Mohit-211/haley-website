CREATE TABLE `reviews` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`quote` text NOT NULL,
	`name` varchar(100) NOT NULL,
	`place` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
