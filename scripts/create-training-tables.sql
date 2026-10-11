-- Additive only: creates the portfolio backoffice's own tables in the SHARED
-- database. Touches nothing owned by syrama-yachting. Safe to re-run.

CREATE TABLE IF NOT EXISTS training_quote (
  id              SERIAL PRIMARY KEY,
  quote_number    TEXT NOT NULL UNIQUE,
  provider_id     INTEGER,
  bill_to_name    TEXT,
  bill_to_address TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  topic           TEXT,
  client_name     TEXT,
  location        TEXT,
  start_date      TIMESTAMP(3),
  end_date        TIMESTAMP(3),
  start_time      TEXT,
  end_time        TEXT,
  hours           DOUBLE PRECISION,
  hourly_rate     DOUBLE PRECISION,
  price_total     DOUBLE PRECISION,
  currency        TEXT NOT NULL DEFAULT 'AED',
  apply_vat       BOOLEAN NOT NULL DEFAULT FALSE,
  vat_rate        DOUBLE PRECISION NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft',
  valid_until     TIMESTAMP(3),
  notes           TEXT,
  invoice_id      INTEGER,
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS training_quote_provider_id_idx ON training_quote (provider_id);
CREATE INDEX IF NOT EXISTS training_quote_status_idx ON training_quote (status);

CREATE TABLE IF NOT EXISTS training_invoice (
  id              SERIAL PRIMARY KEY,
  invoice_number  TEXT NOT NULL UNIQUE,
  quote_id        INTEGER,
  provider_id     INTEGER,
  bill_to_name    TEXT,
  bill_to_address TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  topic           TEXT,
  client_name     TEXT,
  location        TEXT,
  start_date      TIMESTAMP(3),
  end_date        TIMESTAMP(3),
  start_time      TEXT,
  end_time        TEXT,
  hours           DOUBLE PRECISION,
  hourly_rate     DOUBLE PRECISION,
  price_total     DOUBLE PRECISION,
  currency        TEXT NOT NULL DEFAULT 'AED',
  apply_vat       BOOLEAN NOT NULL DEFAULT FALSE,
  vat_rate        DOUBLE PRECISION NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft',
  due_date        TIMESTAMP(3),
  notes           TEXT,
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS training_invoice_provider_id_idx ON training_invoice (provider_id);
CREATE INDEX IF NOT EXISTS training_invoice_status_idx ON training_invoice (status);
