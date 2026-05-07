-- Remove old pipe-delimited string columns from events
ALTER TABLE "events" DROP COLUMN IF EXISTS "activity_details";
ALTER TABLE "events" DROP COLUMN IF EXISTS "event_development";
ALTER TABLE "events" DROP COLUMN IF EXISTS "results_summary";
ALTER TABLE "events" DROP COLUMN IF EXISTS "agreements";

-- Create event_activities table
CREATE TABLE "event_activities" (
    "id"        SERIAL  NOT NULL,
    "event_id"  INTEGER NOT NULL,
    "activity"  TEXT    NOT NULL,
    "detail"    TEXT    NOT NULL DEFAULT '',
    "order_idx" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "event_activities_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "event_activities" ADD CONSTRAINT "event_activities_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create event_results table
CREATE TABLE "event_results" (
    "id"        SERIAL  NOT NULL,
    "event_id"  INTEGER NOT NULL,
    "type"      TEXT    NOT NULL,
    "detail"    TEXT    NOT NULL DEFAULT '',
    "order_idx" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "event_results_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "event_results" ADD CONSTRAINT "event_results_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create event_commitments table
CREATE TABLE "event_commitments" (
    "id"          SERIAL  NOT NULL,
    "event_id"    INTEGER NOT NULL,
    "detail"      TEXT    NOT NULL,
    "responsible" TEXT    NOT NULL DEFAULT '',
    "date_text"   TEXT    NOT NULL DEFAULT '',
    "order_idx"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "event_commitments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "event_commitments" ADD CONSTRAINT "event_commitments_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
