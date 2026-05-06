-- Rename entity_contact_* columns to anfitrion_*
ALTER TABLE "events" RENAME COLUMN "entity_contact_name" TO "anfitrion_name";
ALTER TABLE "events" RENAME COLUMN "entity_contact_email" TO "anfitrion_email";
ALTER TABLE "events" RENAME COLUMN "entity_contact_phone" TO "anfitrion_phone";
ALTER TABLE "events" RENAME COLUMN "entity_contact_role" TO "anfitrion_role";

-- Create event_visitors table
CREATE TABLE "event_visitors" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "order_idx" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "event_visitors_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "event_visitors" ADD CONSTRAINT "event_visitors_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
