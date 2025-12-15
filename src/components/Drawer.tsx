import { X, Wifi, Bluetooth, Radio, Nfc, Zap, Shield, Terminal as TerminalIcon } from 'lucide-react';
import { ESP32Device } from '../lib/supabase';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  device: ESP32Device | null;
  onModuleSelect: (module: string) => void;
  onTerminalOpen: () => void;
  selectedModule: string;
}

export default function Drawer({ isOpen, onClose, device, onModuleSelect, onTerminalOpen, selectedModule }: DrawerProps) {
  const modules = [
    { id: 'wifi', name: 'WI-FI HACKING', icon: Wifi, subModules: ['Deauth Attack', 'Packet Sniffing', 'AP Cloning', 'Evil Twin'] },
    { id: 'bluetooth', name: 'BLUETOOTH (BLE)', icon: Bluetooth, subModules: ['Device Scanner', 'GATT Read/Write', 'Bypass Pairing', 'Sniff Data'] },
    { id: 'nrf24', name: 'NRF24L01 WIRELESS', icon: Radio, subModules: ['Packet Injection', 'Channel Hopping', 'Mesh Network', 'Signal Analysis'] },
    { id: 'ir', name: 'IR BLASTER', icon: Radio, subModules: ['Signal Capture', 'Code Injection', 'Device Clone', 'Brute Force'] },
    { id: 'nfc', name: 'NFC READ/WRITE', icon: Nfc, subModules: ['Tag Scanner', 'Data Clone', 'Emulation Mode'] },
    { id: 'rfid', name: 'RFID SCANNER', icon: Shield, subModules: ['Read UID', 'Clone Card', 'Write Data'] },
    { id: 'ddos', name: 'NETWORK ATTACK', icon: Zap, subModules: ['DDoS Simulation', 'Port Scanner', 'ARP Spoofing'] }
  ];

  const getStatusColor = (status: string) => {
    return status === 'Online' ? '#00FF41' : '#FF3333';
  };

  const getBatteryIcon = (level: number) => {
    if (level > 75) return '█████';
    if (level > 50) return '████░';
    if (level > 25) return '███░░';
    return '██░░░';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-80 bg-[#101010] border-r-2 border-[#00FF41] z-50 overflow-y-auto shadow-[0_0_50px_rgba(0,255,65,0.3)]">
        <div className="sticky top-0 bg-[#1A1A1A] border-b-2 border-[#00FF41] p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#00FF41] font-mono font-bold text-lg">CONTROL PANEL</h2>
            <button onClick={onClose} className="text-[#FF3333] hover:text-[#FF5555]">
              <X className="w-6 h-6" />
            </button>
          </div>

          {device && (
            <div className="space-y-2 bg-[#0A0A0A] p-3 rounded border border-[#00FF41]/30">
              <div className="flex items-center justify-between">
                <span className="text-[#FF9900] text-xs font-mono">DEVICE ID:</span>
                <span className="text-[#00FF41] text-xs font-mono">{device.device_id}</span>
              </div>
              <div className="border-t border-[#00FF41]/20 pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#00FF41]/70 font-mono">STATUS</span>
                  <span className="font-mono font-bold" style={{ color: getStatusColor(device.status) }}>
                    {device.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#FF9900]/70 font-mono">BATTERY</span>
                  <span className="text-[#FF9900] font-mono">{getBatteryIcon(device.battery_level)} {device.battery_level}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#00BFFF]/70 font-mono">TEMP</span>
                  <span className="text-[#00BFFF] font-mono">{device.temperature}°C</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`font-mono ${device.is_led_on ? 'text-[#00FF41]' : 'text-[#FF3333]/70'}`}>LED</span>
                  <span className={`font-mono font-bold ${device.is_led_on ? 'text-[#00FF41]' : 'text-[#FF3333]'}`}>
                    {device.is_led_on ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-[#00FF41] font-mono font-bold text-sm mb-3">&gt;&gt; MODULE CONTROL TREE</h3>

          {modules.map((module) => {
            const Icon = module.icon;
            const isSelected = selectedModule === module.id;

            return (
              <div key={module.id} className="mb-2">
                <button
                  onClick={() => onModuleSelect(module.id)}
                  className={`w-full text-left p-3 rounded border-2 transition-all ${
                    isSelected
                      ? 'bg-[#00FF41]/10 border-[#00FF41]'
                      : 'bg-[#151515] border-[#00FF41]/30 hover:border-[#00FF41]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#00FF41]" />
                    <span className="text-[#00FF41] font-mono font-bold text-sm">{module.name}</span>
                  </div>
                </button>

                {isSelected && (
                  <div className="mt-1 ml-4 space-y-1">
                    {module.subModules.map((sub) => (
                      <div
                        key={sub}
                        className="pl-4 py-2 text-[#00BFFF] text-xs font-mono border-l-2 border-[#00BFFF]/30 hover:border-[#00BFFF] cursor-pointer transition-colors"
                      >
                        &gt; {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onTerminalOpen}
            className="w-full mt-4 bg-[#00BFFF] text-[#101010] p-3 rounded font-mono font-bold hover:bg-[#00A5DD] transition-all shadow-[0_0_15px_rgba(0,191,255,0.5)]"
          >
            <div className="flex items-center justify-center gap-2">
              <TerminalIcon className="w-5 h-5" />
              ACTIVATE REMOTE TERMINAL
            </div>
          </button>
        </div>
      </div>
    </>
  );
}