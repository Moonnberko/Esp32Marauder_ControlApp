import { useEffect, useState } from 'react';
import { supabase, TelemetryHistory } from '../lib/supabase';

interface TelemetryChartProps {
  deviceId: string;
}

export default function TelemetryChart({ deviceId }: TelemetryChartProps) {
  const [history, setHistory] = useState<TelemetryHistory[]>([]);

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('telemetry_history')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: true })
      .limit(20);

    if (data) setHistory(data);
  };

  const getMaxValue = (key: keyof TelemetryHistory) => {
    if (history.length === 0) return 100;
    return Math.max(...history.map(h => Number(h[key])));
  };

  const normalizeValue = (value: number, max: number) => {
    return (value / max) * 100;
  };

  return (
    <div className="bg-[#1A1A1A] p-4 rounded border-2 border-[#00FF41]/30 h-full">
      <h3 className="text-[#00FF41] font-mono font-bold text-sm mb-4">TELEMETRY HISTORY</h3>

      {history.length === 0 ? (
        <div className="text-[#00FF41]/50 text-xs font-mono text-center py-8">
          No telemetry data yet
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#00BFFF]">TEMPERATURE</span>
              <span className="text-[#00BFFF]">{history[history.length - 1]?.temperature.toFixed(1)}°C</span>
            </div>
            <div className="h-16 bg-[#0A0A0A] rounded border border-[#00BFFF]/30 p-1 flex items-end gap-1">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#00BFFF] rounded-t transition-all"
                  style={{
                    height: `${normalizeValue(h.temperature, getMaxValue('temperature'))}%`,
                    opacity: 0.5 + (i / history.length) * 0.5,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#FF9900]">BATTERY LEVEL</span>
              <span className="text-[#FF9900]">{history[history.length - 1]?.battery_level}%</span>
            </div>
            <div className="h-16 bg-[#0A0A0A] rounded border border-[#FF9900]/30 p-1 flex items-end gap-1">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#FF9900] rounded-t transition-all"
                  style={{
                    height: `${normalizeValue(h.battery_level, 100)}%`,
                    opacity: 0.5 + (i / history.length) * 0.5,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#00FF41]">SYSTEM LOAD</span>
              <span className="text-[#00FF41]">{history[history.length - 1]?.load.toFixed(1)}%</span>
            </div>
            <div className="h-16 bg-[#0A0A0A] rounded border border-[#00FF41]/30 p-1 flex items-end gap-1">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#00FF41] rounded-t transition-all"
                  style={{
                    height: `${normalizeValue(h.load, 100)}%`,
                    opacity: 0.5 + (i / history.length) * 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
