-- Optional manual migration if you do not rely on server auto-migration.

ALTER TABLE parts
  ADD COLUMN country_of_origin VARCHAR(191) NULL DEFAULT NULL;
