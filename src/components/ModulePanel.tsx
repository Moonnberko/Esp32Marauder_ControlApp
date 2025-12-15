import { useState, useEffect } from 'react';
import { Save, Download, Trash2, Wifi, Signal, Radio } from 'lucide-react';
import { supabase, SavedData } from '../lib/supabase';

interface ModulePanelProps {
  module: string;
  deviceId: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ModulePanel({ module, deviceId, isConnected, onConnect, onDisconnect }: ModulePanelProps) {
  const [savedDataList, setSavedDataList] = useState<SavedData[]>([]);
  const [dataName, setDataName] = useState('');
  const [dataValue, setDataValue] = useState('');

  useEffect(() => {
    loadSavedData();
  }, [module]);

  const loadSavedData = async () => {
    const { data } = await supabase
      .from('saved_data')
      .select('*')
      .eq('device_id', deviceId)
      .eq('data_type', module)
      .order('created_at', { ascending: false });

    if (data) setSavedDataList(data);
  };

  const saveData = async () => {
    if (!dataName.trim() || !dataValue.trim()) return;

    await supabase.from('saved_data').insert({
      device_id: deviceId,
      data_type: module,
      data_name: dataName,
      data_value: { raw: dataValue, captured_at: new Date().toISOString() },
      notes: `Captured via ${module.toUpperCase()} module`,
    });

    setDataName('');
    setDataValue('');
    loadSavedData();
  };

  const deleteData = async (id: string) => {
    await supabase.from('saved_data').delete().eq('id', id);
    loadSavedData();
  };

  const getModuleConfig = () => {
    switch (module) {
      case 'wifi':
        return {
          title: 'WI-FI HACKING MODULE',
          color: '#00FF41',
          icon: Wifi,
          description: 'Advanced Wi-Fi penetration testing and network analysis',
          fields: [
            { label: 'TARGET SSID', placeholder: 'Enter network name' },
            { label: 'CHANNEL', placeholder: 'e.g., 1-13' },
          ],
        };
      case 'bluetooth':
        return {
          title: 'BLUETOOTH (BLE) MODULE',
          color: '#00BFFF',
          icon: Signal,
          description: 'Bluetooth Low Energy device scanning and manipulation',
          fields: [
            { label: 'MAC ADDRESS', placeholder: 'XX:XX:XX:XX:XX:XX' },
            { label: 'SERVICE UUID', placeholder: 'Optional UUID' },
          ],
        };
      case 'ir':
        return {
          title: 'IR BLASTER MODULE',
          color: '#FF9900',
          icon: Radio,
          description: 'Infrared signal capture and transmission',
          fields: [
            { label: 'SIGNAL NAME', placeholder: 'e.g., TV_POWER' },
            { label: 'IR CODE', placeholder: 'HEX code' },
          ],
        };
      case 'nfc':
        return {
          title: 'NFC READ/WRITE MODULE',
          color: '#FF3333',
          icon: Signal,
          description: 'Near Field Communication tag operations',
          fields: [
            { label: 'TAG UID', placeholder: 'Card UID' },
            { label: 'DATA', placeholder: 'Hex data' },
          ],
        };
      case 'rfid':
        return {
          title: 'RFID SCANNER MODULE',
          color: '#9B59B6',
          icon: Signal,
          description: 'Radio Frequency Identification card cloning',
          fields: [
            { label: 'CARD UID', placeholder: 'Card identifier' },
            { label: 'SECTOR DATA', placeholder: 'Block data' },
          ],
        };
      case 'ddos':
        return {
          title: 'NETWORK ATTACK MODULE',
          color: '#E74C3C',
          icon: Wifi,
          description: 'Network stress testing and analysis tools',
          fields: [
            { label: 'TARGET IP', placeholder: '192.168.x.x' },
            { label: 'PORT', placeholder: 'e.g., 80, 443' },
          ],
        };
      default:
        return {
          title: 'MODULE',
          color: '#00FF41',
          icon: Signal,
          description: 'Select a module from the menu',
          fields: [],
        };
    }
  };

  const config = getModuleConfig();
  const Icon = config.icon;

  return (
    <div className="h-full flex flex-col bg-[#101010] border-2 rounded-lg overflow-hidden" style={{ borderColor: config.color }}>
      <div className="bg-[#1A1A1A] p-4 border-b-2" style={{ borderColor: config.color }}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-6 h-6" style={{ color: config.color }} />
          <h3 className="font-mono font-bold text-lg" style={{ color: config.color }}>
            {config.title}
          </h3>
        </div>
        <p className="text-[#00FF41]/70 text-xs font-mono">{config.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-[#1A1A1A] p-4 rounded border" style={{ borderColor: `${config.color}40` }}>
          <h4 className="text-[#00FF41] font-mono font-bold text-sm mb-3">CONNECTION STATUS</h4>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#00FF41]/70 text-sm font-mono">Device Link:</span>
            <span className={`font-mono font-bold ${isConnected ? 'text-[#00FF41]' : 'text-[#FF3333]'}`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <button
            onClick={isConnected ? onDisconnect : onConnect}
            className={`w-full py-2 rounded font-mono font-bold transition-all ${
              isConnected
                ? 'bg-[#FF3333]/20 border-2 border-[#FF3333] text-[#FF3333] hover:bg-[#FF3333]/30'
                : 'bg-[#00FF41]/20 border-2 border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/30'
            }`}
          >
            {isConnected ? 'DISCONNECT' : 'ESTABLISH LINK'}
          </button>
        </div>

        <div className="bg-[#1A1A1A] p-4 rounded border" style={{ borderColor: `${config.color}40` }}>
          <h4 className="text-[#00FF41] font-mono font-bold text-sm mb-3">CAPTURE DATA</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={dataName}
              onChange={(e) => setDataName(e.target.value)}
              placeholder="Data Name"
              className="w-full bg-[#0A0A0A] border-2 border-[#00FF41]/50 rounded px-3 py-2 text-[#00FF41] font-mono text-sm focus:border-[#00FF41] focus:outline-none"
            />
            <textarea
              value={dataValue}
              onChange={(e) => setDataValue(e.target.value)}
              placeholder="Captured Data (HEX/RAW)"
              className="w-full bg-[#0A0A0A] border-2 border-[#00FF41]/50 rounded px-3 py-2 text-[#00FF41] font-mono text-sm focus:border-[#00FF41] focus:outline-none h-20 resize-none"
            />
            <button
              onClick={saveData}
              className="w-full bg-[#00FF41] text-[#101010] py-2 rounded font-mono font-bold hover:bg-[#00DD35] transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              SAVE TO STORAGE
            </button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-4 rounded border" style={{ borderColor: `${config.color}40` }}>
          <h4 className="text-[#00FF41] font-mono font-bold text-sm mb-3">SAVED DATA ({savedDataList.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {savedDataList.length === 0 ? (
              <p className="text-[#00FF41]/50 text-xs font-mono text-center py-4">No saved data yet</p>
            ) : (
              savedDataList.map((item) => (
                <div key={item.id} className="bg-[#0A0A0A] p-3 rounded border border-[#00FF41]/30 hover:border-[#00FF41]/60 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-[#00FF41] font-mono font-bold text-sm">{item.data_name}</div>
                      <div className="text-[#00FF41]/50 text-xs font-mono mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteData(item.id)}
                      className="text-[#FF3333] hover:text-[#FF5555] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[#00BFFF] text-xs font-mono break-all bg-[#101010] p-2 rounded">
                    {JSON.stringify(item.data_value.raw).substring(0, 60)}...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
