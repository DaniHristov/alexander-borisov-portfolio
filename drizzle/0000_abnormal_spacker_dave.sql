CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"gallery" text NOT NULL,
	"title" text NOT NULL,
	"year" integer NOT NULL,
	"categories" text[] DEFAULT '{}' NOT NULL,
	"client" text,
	"role" text,
	"summary" text DEFAULT '' NOT NULL,
	"description" text,
	"cover_blob_url" text,
	"cover_w" integer,
	"cover_h" integer,
	"col" smallint DEFAULT 0 NOT NULL,
	"row" smallint DEFAULT 0 NOT NULL,
	"col_span" smallint DEFAULT 1 NOT NULL,
	"row_span" smallint DEFAULT 1 NOT NULL,
	"z" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "published_snapshot" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"data" jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"bio" text[] DEFAULT '{}' NOT NULL,
	"selected_clients" text[] DEFAULT '{}' NOT NULL,
	"press" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"portrait_blob_url" text,
	"email" text DEFAULT '' NOT NULL,
	"socials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"currently" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"blob_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tiles" ADD CONSTRAINT "tiles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;