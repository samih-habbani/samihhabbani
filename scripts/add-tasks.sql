-- Additive only (shared DB). Safe to re-run. Run on production before deploying the tasks feature:
--   npx prisma db execute --file scripts/add-tasks.sql --schema prisma/schema.prisma
CREATE TABLE IF NOT EXISTS training_task (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  provider_id INTEGER,
  mission_id  INTEGER,
  due_date    TIMESTAMP(3) NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT false,
  done_at     TIMESTAMP(3),
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS training_task_due_date_idx ON training_task (due_date);
