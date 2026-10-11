-- Additive only (shared DB). Safe to re-run.
CREATE TABLE IF NOT EXISTS training_mission (
  id            SERIAL PRIMARY KEY,
  provider_id   INTEGER NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  client_name   TEXT,
  location      TEXT,
  mission_url   TEXT,
  participants  INTEGER,
  start_date    TIMESTAMP(3) NOT NULL,
  end_date      TIMESTAMP(3),
  start_time    TEXT,
  end_time      TEXT,
  hours         DOUBLE PRECISION,
  hourly_rate   DOUBLE PRECISION,
  price_total   DOUBLE PRECISION,
  currency      TEXT NOT NULL DEFAULT 'AED',
  status        TEXT NOT NULL DEFAULT 'planned',
  invoice_id    INTEGER,
  created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS training_mission_start_idx ON training_mission (start_date);
CREATE INDEX IF NOT EXISTS training_mission_provider_idx ON training_mission (provider_id);
ALTER TABLE training_invoice ADD COLUMN IF NOT EXISTS lines JSONB;
