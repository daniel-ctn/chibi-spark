CREATE TYPE "public"."asset_provider" AS ENUM('openai', 'fal', 'replicate', 'ffmpeg');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('image', 'animation', 'thumbnail');--> statement-breakpoint
CREATE TYPE "public"."batch_status" AS ENUM('pending', 'running', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('text', 'image', 'animation', 'metadata');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('pending', 'selected', 'used', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."safety_label" AS ENUM('pending', 'safe', 'borderline', 'unsafe');--> statement-breakpoint
CREATE TABLE "chibi_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"chibi_item_id" text NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"provider" "asset_provider" NOT NULL,
	"storage_key" text NOT NULL,
	"public_url" text NOT NULL,
	"mime_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"duration_seconds" real,
	"bytes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chibi_item_tags" (
	"chibi_item_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "chibi_item_tags_chibi_item_id_tag_id_pk" PRIMARY KEY("chibi_item_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "chibi_items" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"batch_id" text,
	"source_proposal_id" text,
	"title" text NOT NULL,
	"theme" text NOT NULL,
	"prompt" text NOT NULL,
	"revised_prompt" text,
	"short_description" text,
	"is_animated" boolean DEFAULT false NOT NULL,
	"safety_label" "safety_label" DEFAULT 'pending' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "chibi_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"generation_date" date NOT NULL,
	"status" "batch_status" DEFAULT 'pending' NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "generation_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"chibi_item_id" text,
	"job_type" "job_type" NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"provider" text,
	"provider_job_id" text,
	"input_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"output_payload" jsonb,
	"error_message" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"nickname" text,
	"idea_text" text NOT NULL,
	"style_hints" text,
	"status" "proposal_status" DEFAULT 'pending' NOT NULL,
	"safety_label" "safety_label" DEFAULT 'pending' NOT NULL,
	"source_ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chibi_assets" ADD CONSTRAINT "chibi_assets_chibi_item_id_chibi_items_id_fk" FOREIGN KEY ("chibi_item_id") REFERENCES "public"."chibi_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chibi_item_tags" ADD CONSTRAINT "chibi_item_tags_chibi_item_id_chibi_items_id_fk" FOREIGN KEY ("chibi_item_id") REFERENCES "public"."chibi_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chibi_item_tags" ADD CONSTRAINT "chibi_item_tags_tag_id_chibi_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."chibi_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chibi_items" ADD CONSTRAINT "chibi_items_batch_id_daily_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."daily_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chibi_items" ADD CONSTRAINT "chibi_items_source_proposal_id_proposals_id_fk" FOREIGN KEY ("source_proposal_id") REFERENCES "public"."proposals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_chibi_item_id_chibi_items_id_fk" FOREIGN KEY ("chibi_item_id") REFERENCES "public"."chibi_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "chibi_assets_storage_key_unique" ON "chibi_assets" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "chibi_assets_item_idx" ON "chibi_assets" USING btree ("chibi_item_id","asset_type");--> statement-breakpoint
CREATE INDEX "chibi_item_tags_tag_idx" ON "chibi_item_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "chibi_items_slug_unique" ON "chibi_items" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "chibi_items_published_idx" ON "chibi_items" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "chibi_items_animated_published_idx" ON "chibi_items" USING btree ("is_animated","published_at");--> statement-breakpoint
CREATE INDEX "chibi_items_batch_idx" ON "chibi_items" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "chibi_items_safety_idx" ON "chibi_items" USING btree ("safety_label");--> statement-breakpoint
CREATE UNIQUE INDEX "chibi_tags_name_unique" ON "chibi_tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "chibi_tags_slug_unique" ON "chibi_tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_batches_date_unique" ON "daily_batches" USING btree ("generation_date");--> statement-breakpoint
CREATE INDEX "generation_jobs_status_type_idx" ON "generation_jobs" USING btree ("status","job_type");--> statement-breakpoint
CREATE INDEX "generation_jobs_item_idx" ON "generation_jobs" USING btree ("chibi_item_id");--> statement-breakpoint
CREATE INDEX "generation_jobs_provider_job_idx" ON "generation_jobs" USING btree ("provider","provider_job_id");--> statement-breakpoint
CREATE INDEX "proposals_status_created_idx" ON "proposals" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "proposals_safety_idx" ON "proposals" USING btree ("safety_label");