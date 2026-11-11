-- Integration tests run against a separate database so they never touch dev data.
-- Runs as POSTGRES_USER, which therefore owns the new database.
CREATE DATABASE tastenest_test;
