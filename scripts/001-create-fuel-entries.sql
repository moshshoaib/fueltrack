CREATE TABLE IF NOT EXISTS fuel_entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  liters NUMERIC(10, 2) NOT NULL,
  price_per_liter NUMERIC(10, 2) NOT NULL,
  total_cost NUMERIC(10, 2) NOT NULL,
  odometer NUMERIC(10, 1) NOT NULL,
  distance NUMERIC(10, 1),
  fuel_efficiency NUMERIC(10, 2),
  cost_per_km NUMERIC(10, 4),
  fuel_type VARCHAR(20) DEFAULT 'Petrol',
  station VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_entries_date ON fuel_entries(date);
