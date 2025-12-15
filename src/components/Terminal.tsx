import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { supabase, CommandLog } from '../lib/supabase';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  onCommandExecuted: (command: string) => void;
}

export default function Terminal({ isOpen, onClose, deviceId, onCommandExecuted }: TerminalProps) {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
      const subscription = supabase
        .channel('command_logs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'command_logs' }, () => {
          loadLogs();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen, deviceId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadLogs = async () => {
    const { data } = await supabase
      .from('command_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (data) setLogs(data.reverse());
  };

  const executeCommand = async () => {
    if (!command.trim() || isLoading) return;

    setIsLoading(true);

    await supabase.from('command_logs').insert({
      device_id: deviceId,
      log_type: 'COMMAND',
      log_data: command.trim(),
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const responses: Record<string, string> = {
      'led_on': 'LED STATUS: ON. Command Success.',
      'led_off': 'LED STATUS: OFF. Command Success.',
      'get_temp': 'TEMP: 32.5°C',
      'get_status': 'SYSTEM STATUS: OPERATIONAL',
      'reboot': 'SYSTEM REBOOTING... Please wait.',
      'scan_wifi': 'SCANNING NETWORKS... Found 12 APs',
      'scan_ble': 'SCANNING BLE DEVICES... Found 8 devices',
      'help': 'COMMANDS: led_on, led_off, get_temp, get_status, reboot, scan_wifi, scan_ble, clear',
    };

    const baseCmd = command.trim().toLowerCase();
    const response = responses[baseCmd] || `ERROR: Unknown command '${baseCmd}'`;
    const logType = response.startsWith('ERROR') ? 'ERROR' : 'RESPONSE';

    await supabase.from('command_logs').insert({
      device_id: deviceId,
      log_type: logType,
      log_data: response,
    });

    onCommandExecuted(baseCmd);
    setCommand('');
    setIsLoading(false);
  };

  const clearLogs = async () => {
    await supabase.from('command_logs').delete().eq('device_id', deviceId);
    setLogs([]);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'COMMAND': return '#00FF41';
      case 'RESPONSE': return '#00BFFF';
      case 'ERROR': return '#FF3333';
      case 'SYSTEM': return '#FF9900';
      default: return '#00FF41';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#101010] border-2 border-[#00BFFF] rounded-lg w-full max-w-4xl h-[600px] flex flex-col shadow-[0_0_50px_rgba(0,191,255,0.5)]">
        <div className="bg-[#1A1A1A] p-4 border-b-2 border-[#00BFFF] flex items-center justify-between">
          <div>
            <h3 className="text-[#00BFFF] font-mono font-bold text-lg">&gt;&gt; REMOTE CODE EXECUTION</h3>
            <p className="text-[#00BFFF]/70 text-xs font-mono mt-1">Direct ESP32 Command Interface</p>
          </div>
          <button onClick={onClose} className="text-[#FF3333] hover:text-[#FF5555] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 bg-[#0A0A0A] m-4 p-4 rounded border-2 border-[#00BFFF]/50 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-[#00FF41]/50 text-center py-8">
              ESP32 Terminal Ready. Type 'help' for commands.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="mb-2">
                <span style={{ color: getLogColor(log.log_type) }}>
                  [{log.log_type}] {log.log_data}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        <div className="p-4 bg-[#1A1A1A] border-t-2 border-[#00BFFF]">
          <div className="text-[#00FF41]/70 text-xs font-mono mb-2">
            Common: led_on | led_off | get_temp | get_status | scan_wifi | scan_ble | help
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
              placeholder="Type command..."
              disabled={isLoading}
              className="flex-1 bg-[#0A0A0A] border-2 border-[#00BFFF]/50 rounded px-4 py-2 text-[#00FF41] font-mono focus:border-[#00BFFF] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-[#FF9900] text-[#101010] font-mono font-bold rounded hover:bg-[#DD8800] transition-colors"
            >
              CLEAR
            </button>
            <button
              onClick={executeCommand}
              disabled={isLoading || !command.trim()}
              className="px-6 py-2 bg-[#00BFFF] text-[#101010] font-mono font-bold rounded hover:bg-[#00A5DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'SENDING...' : 'SEND'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
