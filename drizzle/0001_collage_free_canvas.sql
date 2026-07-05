ALTER TABLE "projects" ADD COLUMN "x" real DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "y" real DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "w" real DEFAULT 520 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "fit" text DEFAULT 'cover' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "categories";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "col";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "row";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "col_span";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "row_span";
