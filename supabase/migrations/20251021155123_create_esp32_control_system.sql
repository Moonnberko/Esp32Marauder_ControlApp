/*
  # ESP32 Kontrol Sistemi Veritabanı

  1. Yeni Tablolar
    - `esp32_devices` - ESP32 cihaz bilgileri ve telemetri verileri
      - `id` (uuid, primary key)
      - `device_id` (text, unique)
      - `name` (text)
      - `status` (text)
      - `battery_level` (integer)
      - `temperature` (numeric)
      - `rssi` (integer)
      - `load` (numeric)
      - `is_connected` (boolean)
      - `is_led_on` (boolean)
      - `last_seen` (timestamptz)
      - `created_at` (timestamptz)
    
    - `saved_data` - Kaydedilen RFID, IR ve diğer veriler
      - `id` (uuid, primary key)
      - `device_id` (text)
      - `data_type` (text) - 'rfid', 'ir', 'nfc', 'wifi', 'bluetooth'
      - `data_name` (text)
      - `data_value` (jsonb)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `command_logs` - Terminal komut ve log kayıtları
      - `id` (uuid, primary key)
      - `device_id` (text)
      - `log_type` (text) - 'COMMAND', 'RESPONSE', 'SYSTEM', 'ERROR'
      - `log_data` (text)
      - `timestamp` (timestamptz)
    
    - `telemetry_history` - Telemetri verileri geçmişi
      - `id` (uuid, primary key)
      - `device_id` (text)
      - `temperature` (numeric)
      - `battery_level` (integer)
      - `rssi` (integer)
      - `load` (numeric)
      - `timestamp` (timestamptz)

  2. Güvenlik
    - RLS tüm tablolarda aktif
    - Public erişim politikaları (demo için)
*/

-- ESP32 Cihazlar Tablosu
CREATE TABLE IF NOT EXISTS esp32_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'Offline',
  battery_level integer DEFAULT 85,
  temperature numeric DEFAULT 28.5,
  rssi integer DEFAULT -45,
  load numeric DEFAULT 12.0,
  is_connected boolean DEFAULT false,
  is_led_on boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE esp32_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view devices"
  ON esp32_devices FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert devices"
  ON esp32_devices FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update devices"
  ON esp32_devices FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Kaydedilen Veriler Tablosu
CREATE TABLE IF NOT EXISTS saved_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  data_type text NOT NULL,
  data_name text NOT NULL,
  data_value jsonb NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view saved data"
  ON saved_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert saved data"
  ON saved_data FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update saved data"
  ON saved_data FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete saved data"
  ON saved_data FOR DELETE
  TO public
  USING (true);

-- Komut Logları Tablosu
CREATE TABLE IF NOT EXISTS command_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  log_type text NOT NULL,
  log_data text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view logs"
  ON command_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert logs"
  ON command_logs FOR INSERT
  TO public
  WITH CHECK (true);

-- Telemetri Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS telemetry_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  temperature numeric NOT NULL,
  battery_level integer NOT NULL,
  rssi integer NOT NULL,
  load numeric NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE telemetry_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view telemetry"
  ON telemetry_history FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert telemetry"
  ON telemetry_history FOR INSERT
  TO public
  WITH CHECK (true);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_esp32_devices_device_id ON esp32_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_saved_data_device_id ON saved_data(device_id);
CREATE INDEX IF NOT EXISTS idx_saved_data_data_type ON saved_data(data_type);
CREATE INDEX IF NOT EXISTS idx_command_logs_device_id ON command_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_timestamp ON command_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_id ON telemetry_history(device_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_history(timestamp DESC);

-- Başlangıç verisi
INSERT INTO esp32_devices (device_id, name, status, battery_level, temperature, is_connected)
VALUES ('ESP32_HACK_UNIT_01', 'TARGET_NANO_X', 'Online', 85, 28.5, false)
ON CONFLICT (device_id) DO NOTHING;