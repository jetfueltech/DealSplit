/*
  # Create payouts schema

  1. New Tables
    - `payouts`
      - `id` (uuid, primary key)
      - `developer_id` (uuid, foreign key)
      - `amount` (numeric)
      - `status` (enum: 'pending', 'paid')
      - `created_at` (timestamp)
      - `paid_at` (timestamp, nullable)

    - `payout_items`
      - `id` (uuid, primary key)
      - `payout_id` (uuid, foreign key)
      - `client_id` (uuid, foreign key)
      - `project_id` (uuid, foreign key)
      - `amount` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES auth.users(id),
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  CONSTRAINT positive_amount CHECK (amount >= 0)
);

-- Create payout items table
CREATE TABLE IF NOT EXISTS payout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid REFERENCES payouts(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  project_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_amount CHECK (amount >= 0)
);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payouts"
  ON payouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = developer_id);

CREATE POLICY "Users can create their own payouts"
  ON payouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Users can view their own payout items"
  ON payout_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM payouts
      WHERE payouts.id = payout_items.payout_id
      AND payouts.developer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own payout items"
  ON payout_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM payouts
      WHERE payouts.id = payout_items.payout_id
      AND payouts.developer_id = auth.uid()
    )
  );