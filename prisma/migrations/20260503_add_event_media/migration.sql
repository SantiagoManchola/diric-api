-- Add new fields to events table
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "entity_website" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "entity_contact_role" TEXT;

-- Create event_images table
CREATE TABLE IF NOT EXISTS "event_images" (
    "id"          SERIAL      NOT NULL,
    "event_id"    INTEGER     NOT NULL,
    "r2_key"      TEXT        NOT NULL,
    "url"         TEXT        NOT NULL,
    "filename"    TEXT        NOT NULL,
    "mime_type"   TEXT        NOT NULL DEFAULT 'image/jpeg',
    "order_idx"   INTEGER     NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_images_pkey" PRIMARY KEY ("id")
);

-- Create event_pdf_versions table
CREATE TABLE IF NOT EXISTS "event_pdf_versions" (
    "id"           SERIAL       NOT NULL,
    "event_id"     INTEGER      NOT NULL,
    "version"      INTEGER      NOT NULL,
    "r2_key"       TEXT         NOT NULL,
    "url"          TEXT         NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_pdf_versions_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "event_images"
    ADD CONSTRAINT "event_images_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event_pdf_versions"
    ADD CONSTRAINT "event_pdf_versions_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
