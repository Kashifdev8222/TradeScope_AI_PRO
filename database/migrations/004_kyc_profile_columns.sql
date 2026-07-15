-- Add user info columns to kyc_profiles so admin can read without joining
ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS client_code TEXT;
ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS email TEXT;
