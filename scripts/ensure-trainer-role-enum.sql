-- Adds TRAINER to the academy Role enum when missing (safe to re-run).
DO $$
BEGIN
  ALTER TYPE academy."Role" ADD VALUE 'TRAINER';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
