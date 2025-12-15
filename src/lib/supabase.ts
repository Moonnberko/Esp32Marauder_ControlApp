import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ESP32Device {
  id: string;
  device_id: string;
  name: string;
  status: string;
  battery_level: number;
  temperature: number;
  rssi: number;
  load: number;
  is_connected: boolean;
  is_led_on: boolean;
  last_seen: string;
  created_at: string;
}

export interface SavedData {
  id: string;
  device_id: string;
  data_type: string;
  data_name: string;
  data_value: any;
  notes: string;
  created_at: string;
}

export interface CommandLog {
  id: string;
  device_id: string;
  log_type: string;
  log_data: string;
  timestamp: string;
}

export interface TelemetryHistory {
  id: string;
  device_id: string;
  temperature: number;
  battery_level: number;
  rssi: number;
  load: number;
  timestamp: string;
}
