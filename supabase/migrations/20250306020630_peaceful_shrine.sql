/*
  # Create payouts schema
  
  1. New Tables
    - `payouts`
      - `id` (uuid, primary key)
      - `developer` (text)
      - `total_amount` (numeric)
      - `status` (text)
      - `date_created` (timestamptz)
      - `clients` (text[])
      - `projects` (text[])
      - `final_payout` (numeric)
      - `created_at` (timestamptz)
      - `user_id` (uuid, references auth.users)
    
    - `payout_fees`
      - `id` (uuid, primary key)
      - `payout_id` (uuid, references payouts)
      - `name` (text)
      - `amount` (numeric)
      - `created_at` (timestamptz)
    
    - `payout_timeline`
      - `id` (uuid, primary key)
      - `payout_id` (uuid, references payouts)
      - `status` (text)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer text NOT NULL,
  total_amount numeric NOT NULL,
  status text NOT NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  clients text[] NOT NULL DEFAULT '{}',
  projects text[] NOT NULL DEFAULT '{}',
  final_payout numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Create payout_fees table
CREATE TABLE IF NOT EXISTS payout_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create payout_timeline table
CREATE TABLE IF NOT EXISTS payout_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  status text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_timeline ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own payouts"
  ON payouts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage fees for their payouts"
  ON payout_fees
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM payouts 
    WHERE payouts.id = payout_id 
    AND payouts.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM payouts 
    WHERE payouts.id = payout_id 
    AND payouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage timeline for their payouts"
  ON payout_timeline
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM payouts 
    WHERE payouts.id = payout_id 
    AND payouts.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM payouts 
    WHERE payouts.id = payout_id 
    AND payouts.user_id = auth.uid()
  ));