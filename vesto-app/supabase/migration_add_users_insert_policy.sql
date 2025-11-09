-- Migration: Add INSERT policy for users table
-- This allows authenticated users to create their own record in the users table
-- Required for user_progress foreign key constraint to work

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Note: This policy allows users to insert their own record when they first authenticate
-- The API route will automatically create users when they try to save progress

