-- Additive only (shared DB). Safe to re-run. Run on production before deploying the appointments feature:
--   npx prisma db execute --file scripts/add-appointments.sql --schema prisma/schema.prisma
CREATE TABLE IF NOT EXISTS training_appointment (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  provider_id INTEGER,
  date        TIMESTAMP(3) NOT NULL,
  start_time  TEXT,
  end_time    TEXT,
  location    TEXT,
  notes       TEXT,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS training_appointment_date_idx ON training_appointment (date);
