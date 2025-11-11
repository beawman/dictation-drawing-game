-- Initialize database for dictation drawing game
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database (already created by POSTGRES_DB env var)
-- But we can add any initial setup here if needed

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a comment to confirm the database is initialized
COMMENT ON DATABASE dictation_drawing_game IS 'Database for Dictation Drawing Game - Educational app for children aged 4-7';