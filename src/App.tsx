// src/App.tsx - HATASIZ VERSİYON
import { useState, useEffect } from 'react';
import { Menu, LogOut, Lightbulb, Activity, Save, Play, Square, Scan, Wifi, Bluetooth, Radio, Nfc, Shield, Zap } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import Drawer from './components/Drawer';
import Terminal from './components/Terminal';
import TelemetryChart from './components/TelemetryChart';
import { supabase, ESP32Device } from './lib/supabase';

// Interface'ler
interface WiFiNetwork {
  ssid: string;
  bssid: string;
  signal: number;
  security: string;
  channel: number;
}

interface BluetoothDevice {
  name: string;
  mac: string;
  rssi: number;
  type: string;
}

interface PacketData {
  time: string;
  source: string;
  destination: string;
  protocol: string;
  size: number;
}

interface AttackProgress {
  isRunning: boolean;
  progress: number;
  status: string;
  results: string[];
  target?: string;
  packetsSent?: number;
}

interface NRF24Data {
  channel: number;
  receivedData: string[];
  connectedNodes: string[];
}

// ModulePanel Component - DOĞRUDAN BURADA
const ModulePanel = ({ 
  module, 
  subModule, 
  isConnected, 
  onConnect, 
  onDisconnect 
}: { 
  module: string;
  subModule?: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) => {
  const [attackProgress, setAttackProgress] = useState<AttackProgress>({
    isRunning: false,
    progress: 0,
    status: 'Ready',
    results: [],
    target: '',
    packetsSent: 0
  });

  const [selectedTarget, setSelectedTarget] = useState('');
  const [deauthSettings, setDeauthSettings] = useState({ 
    duration: 30, 
    packetCount: 100,
    attackType: 'broadcast'
  });
  const [wifiNetworks, setWifiNetworks] = useState<WiFiNetwork[]>([]);
  const [sniffedPackets, setSniffedPackets] = useState<PacketData[]>([]);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [nrf24Data, setNrf24Data] = useState<NRF24Data>({
    channel: 76,
    receivedData: ['Node 1: Active', 'Node 2: Connected', 'Node 3: Scanning'],
    connectedNodes: ['Node_A', 'Node_B', 'Node_C']
  });

  // Saldırı simülasyonu
  const simulateAttack = (attackType: string, target?: string) => {
    setAttackProgress({
      isRunning: true,
      progress: 0,
      status: `Starting ${attackType}...`,
      results: [],
      target: target || '',
      packetsSent: 0
    });

    const interval = setInterval(() => {
      setAttackProgress(prev => {
        const newProgress = prev.progress + 10;
        const newPackets = prev.packetsSent ? prev.packetsSent + Math.floor(Math.random() * 50) : 0;
        const newResults = [...prev.results];
        
        if (newProgress > 30 && prev.results.length === 0) {
          newResults.push(`[+] Target ${prev.target || 'device'} identified`);
        }
        if (newProgress > 60 && prev.results.length === 1) {
          newResults.push(`[+] Attack vector established`);
        }
        if (newProgress > 90 && prev.results.length === 2) {
          newResults.push(`[+] ${attackType} successful - ${newPackets} packets sent`);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            isRunning: false,
            progress: 100,
            status: 'Attack completed!',
            results: newResults,
            target: prev.target,
            packetsSent: newPackets
          };
        }

        return {
          isRunning: true,
          progress: newProgress,
          status: `Running ${attackType}... ${newProgress}%`,
          results: newResults,
          target: prev.target,
          packetsSent: newPackets
        };
      });
    }, 500);
  };

  // WiFi fonksiyonları
  const scanWiFiNetworks = () => {
    setAttackProgress(prev => ({ ...prev, status: 'Scanning for WiFi networks...' }));
    
    setTimeout(() => {
      const networks: WiFiNetwork[] = [
        { ssid: 'Home_WiFi_5G', bssid: 'AA:BB:CC:DD:EE:FF', signal: -45, security: 'WPA2', channel: 36 },
        { ssid: 'Neighbor_Network', bssid: '11:22:33:44:55:66', signal: -62, security: 'WPA3', channel: 6 },
        { ssid: 'Free_WiFi', bssid: 'FF:EE:DD:CC:BB:AA', signal: -78, security: 'OPEN', channel: 11 }
      ];
      setWifiNetworks(networks);
      setAttackProgress(prev => ({ ...prev, status: `Found ${networks.length} networks` }));
    }, 2000);
  };

  const startDeauthAttack = () => {
    if (!selectedTarget) {
      setAttackProgress(prev => ({ ...prev, status: 'Please select a target first!' }));
      return;
    }
    simulateAttack('Deauthentication Attack', selectedTarget);
  };

  const startPacketSniffing = () => {
    if (!selectedTarget) return;
    simulateAttack('Packet Sniffing', selectedTarget);
    
    setTimeout(() => {
      setSniffedPackets([
        { time: '12:01:23', source: selectedTarget, destination: 'BROADCAST', protocol: 'TCP', size: 512 },
        { time: '12:01:24', source: selectedTarget, destination: 'ROUTER', protocol: 'HTTP', size: 1024 },
        { time: '12:01:25', source: 'ROUTER', destination: selectedTarget, protocol: 'TCP', size: 256 },
      ]);
    }, 3000);
  };

  // Bluetooth fonksiyonları
  const scanBluetoothDevices = () => {
    setAttackProgress(prev => ({ ...prev, status: 'Scanning Bluetooth devices...' }));
    
    setTimeout(() => {
      const devices: BluetoothDevice[] = [
        { name: 'Smartphone_X', mac: 'AA:BB:CC:11:22:33', rssi: -45, type: 'Phone' },
        { name: 'Wireless_Headphones', mac: 'BB:CC:DD:44:55:66', rssi: -52, type: 'Audio' },
        { name: 'Fitness_Tracker', mac: 'CC:DD:EE:77:88:99', rssi: -68, type: 'Wearable' }
      ];
      setBluetoothDevices(devices);
      setAttackProgress(prev => ({ ...prev, status: `Found ${devices.length} devices` }));
    }, 2000);
  };

  const startBluetoothSniffing = () => {
    if (!selectedTarget) return;
    simulateAttack('Bluetooth Sniffing', selectedTarget);
  };

  // NRF24 fonksiyonları
  const startPacketInjection = () => {
    simulateAttack('NRF24 Packet Injection');
  };

  const startChannelHopping = () => {
    simulateAttack('NRF24 Channel Hopping');
    setNrf24Data(prev => ({
      ...prev,
      receivedData: ['Channel 45: Data packet found', 'Channel 76: Control signal', 'Channel 112: Encrypted data']
    }));
  };

  // Modül ikonları
  const getModuleIcon = () => {
    const icons = {
      wifi: <Wifi className="w-6 h-6" />,
      bluetooth: <Bluetooth className="w-6 h-6" />,
      nrf24: <Radio className="w-6 h-6" />,
      nfc: <Nfc className="w-6 h-6" />,
      rfid: <Shield className="w-6 h-6" />,
      ddos: <Zap className="w-6 h-6" />
    };
    return icons[module as keyof typeof icons] || <Activity className="w-6 h-6" />;
  };

  const getModuleColor = () => {
    const colors: { [key: string]: string } = {
      wifi: '#00BFFF',
      bluetooth: '#FF9900',
      nrf24: '#FF33FF',
      nfc: '#6699FF',
      rfid: '#FF9966',
      ddos: '#FF3333'
    };
    return colors[module] || '#00FF41';
  };

  // DEAUTH ATTACK - ÖZELLEŞTİRİLMİŞ ARAYÜZ
  const renderDeauthAttack = () => {

    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#FF3333] font-mono font-bold text-lg">DEAUTH ATTACK</h3>
          <button className="bg-[#00FF41] text-black px-3 py-1 rounded text-xs font-mono hover:bg-[#00DD35]">
            <Save className="w-3 h-3 inline mr-1" />
            SAVE
          </button>
        </div>

        {/* AYARLAR */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-[#101010] p-3 rounded border border-[#FF3333]/30">
            <div className="text-[#FF3333] text-xs font-mono mb-1">DURATION</div>
            <input 
              type="number" 
              value={deauthSettings.duration}
              onChange={(e) => setDeauthSettings(prev => ({...prev, duration: parseInt(e.target.value)}))}
              className="w-full bg-transparent text-[#FF3333] font-mono text-lg font-bold border-none outline-none"
            />
            <div className="text-[#FF3333]/50 text-xs">seconds</div>
          </div>

          <div className="bg-[#101010] p-3 rounded border border-[#FF3333]/30">
            <div className="text-[#FF3333] text-xs font-mono mb-1">PACKETS</div>
            <input 
              type="number" 
              value={deauthSettings.packetCount}
              onChange={(e) => setDeauthSettings(prev => ({...prev, packetCount: parseInt(e.target.value)}))}
              className="w-full bg-transparent text-[#FF3333] font-mono text-lg font-bold border-none outline-none"
            />
            <div className="text-[#FF3333]/50 text-xs">packets</div>
          </div>

          <div className="bg-[#101010] p-3 rounded border border-[#FF3333]/30">
            <div className="text-[#FF3333] text-xs font-mono mb-1">TYPE</div>
            <select 
              value={deauthSettings.attackType}
              onChange={(e) => setDeauthSettings(prev => ({...prev, attackType: e.target.value}))}
              className="w-full bg-transparent text-[#FF3333] font-mono text-sm border-none outline-none"
            >
              <option value="broadcast">Broadcast</option>
              <option value="targeted">Targeted</option>
              <option value="continuous">Continuous</option>
            </select>
          </div>
        </div>

        {/* AĞ TARAMA */}
        <button 
          onClick={scanWiFiNetworks}
          className="w-full bg-[#00BFFF] text-white px-4 py-3 rounded font-mono font-bold hover:bg-[#0099CC] transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Scan className="w-4 h-4" />
          SCAN NETWORKS
        </button>

        {/* TARANAN AĞLAR */}
        {wifiNetworks.length > 0 && (
          <div className="bg-[#101010] rounded border border-[#00BFFF]/30 p-4 mb-4">
            <h4 className="text-[#00BFFF] font-mono text-sm mb-3">SELECT TARGET:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {wifiNetworks.map((network, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded hover:bg-[#252525] transition-colors">
                  <div className="flex-1">
                    <div className="text-[#00FF41] font-mono font-bold">{network.ssid}</div>
                    <div className="text-[#00BFFF] text-xs font-mono">
                      {network.bssid} | Ch:{network.channel} | Sig:{network.signal}dBm
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTarget(network.ssid)}
                    className={`px-3 py-1 rounded text-xs font-mono ${
                      selectedTarget === network.ssid 
                        ? 'bg-[#00FF41] text-black' 
                        : 'bg-[#00BFFF] text-white'
                    }`}
                  >
                    {selectedTarget === network.ssid ? 'SELECTED' : 'SELECT'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALDIRI MONITOR */}
        <div className="bg-[#101010] rounded border border-[#FF3333]/30 p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#FF3333] font-mono font-bold">ATTACK MONITOR</span>
            <span className="text-[#00FF41] font-mono text-sm">{attackProgress.status}</span>
          </div>
          
          {attackProgress.isRunning && (
            <div className="space-y-2 mb-3">
              <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                <div 
                  className="bg-[#FF3333] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attackProgress.progress}%` }}
                ></div>
              </div>
              <div className="text-[#FF3333] font-mono text-xs text-center">
                {Math.round(attackProgress.progress)}% Complete | Packets: {attackProgress.packetsSent}
              </div>
            </div>
          )}

          <div className="max-h-32 overflow-y-auto space-y-1">
            {attackProgress.results.map((result, index) => (
              <div key={index} className="text-[#00FF41] font-mono text-xs">
                {result}
              </div>
            ))}
          </div>
        </div>

        {/* SALDIRI BUTONU */}
        <button 
          onClick={startDeauthAttack}
          disabled={attackProgress.isRunning || !selectedTarget}
          className="w-full bg-[#FF3333] text-white px-4 py-3 rounded font-mono font-bold hover:bg-[#CC0000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {attackProgress.isRunning ? (
            <>
              <Square className="w-4 h-4" />
              STOP ATTACK
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              START DEAUTH ATTACK
            </>
          )}
        </button>
      </div>
    );
  };

  // PACKET SNIFFING - ÖZELLEŞTİRİLMİŞ ARAYÜZ
  const renderPacketSniffing = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#00BFFF] font-mono font-bold text-lg">PACKET SNIFFING</h3>
          <button 
            disabled={sniffedPackets.length === 0}
            className="bg-[#00FF41] text-black px-3 py-1 rounded text-xs font-mono hover:bg-[#00DD35] disabled:opacity-50"
          >
            <Save className="w-3 h-3 inline mr-1" />
            SAVE
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={scanWiFiNetworks}
            className="bg-[#00BFFF] text-white px-4 py-3 rounded font-mono font-bold hover:bg-[#0099CC] transition-colors flex items-center justify-center gap-2"
          >
            <Scan className="w-4 h-4" />
            SCAN NETWORKS
          </button>
          
          <button 
            onClick={startPacketSniffing}
            disabled={!selectedTarget}
            className="bg-[#FF9900] text-white px-4 py-3 rounded font-mono font-bold hover:bg-[#CC7700] transition-colors disabled:opacity-50"
          >
            START SNIFFING
          </button>
        </div>

        {/* SNİFFLENEN PAKETLER */}
        {sniffedPackets.length > 0 && (
          <div className="bg-[#101010] rounded border border-[#00FF41]/30 p-4">
            <h4 className="text-[#00FF41] font-mono text-sm mb-3">SNIFFED PACKETS:</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {sniffedPackets.map((packet, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-[#1A1A1A] rounded text-xs font-mono">
                  <span className="text-[#00BFFF]">{packet.time}</span>
                  <span className="text-[#00FF41]">{packet.source} → {packet.destination}</span>
                  <span className="text-[#FF9900]">{packet.protocol}</span>
                  <span className="text-[#FF33FF]">{packet.size} bytes</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALDIRI MONITOR */}
        {attackProgress.isRunning && (
          <div className="bg-[#101010] rounded border border-[#FF9900]/30 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#FF9900] font-mono font-bold text-sm">SNIFFING PROGRESS</span>
              <span className="text-[#FF9900] font-mono text-sm">{Math.round(attackProgress.progress)}%</span>
            </div>
            <div className="w-full bg-[#1A1A1A] rounded-full h-2 mb-2">
              <div 
                className="bg-[#FF9900] h-2 rounded-full transition-all duration-300"
                style={{ width: `${attackProgress.progress}%` }}
              ></div>
            </div>
            <div className="text-[#00FF41] font-mono text-xs">{attackProgress.status}</div>
          </div>
        )}
      </div>
    );
  };

  // BLUETOOTH MODULE
  const renderBluetoothModule = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#FF9900] font-mono font-bold text-lg">BLUETOOTH CONTROLLER</h3>
          <button className="bg-[#00FF41] text-black px-3 py-1 rounded text-xs font-mono hover:bg-[#00DD35]">
            <Save className="w-3 h-3 inline mr-1" />
            SAVE
          </button>
        </div>

        <button 
          onClick={scanBluetoothDevices}
          className="w-full bg-[#FF9900] text-white px-4 py-3 rounded font-mono font-bold hover:bg-[#CC7700] transition-colors flex items-center justify-center gap-2"
        >
          <Scan className="w-4 h-4" />
          SCAN BLUETOOTH DEVICES
        </button>

        {bluetoothDevices.length > 0 && (
          <div className="bg-[#101010] rounded border border-[#FF9900]/30 p-4">
            <h4 className="text-[#FF9900] font-mono text-sm mb-3">DETECTED DEVICES:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bluetoothDevices.map((device, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded hover:bg-[#252525] transition-colors">
                  <div className="flex-1">
                    <div className="text-[#00FF41] font-mono font-bold">{device.name}</div>
                    <div className="text-[#FF9900] text-xs font-mono">
                      {device.mac} | RSSI: {device.rssi}dBm | {device.type}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedTarget(device.name);
                        startBluetoothSniffing();
                      }}
                      className="bg-[#00BFFF] text-white px-3 py-1 rounded text-xs font-mono hover:bg-[#0099CC]"
                    >
                      SNIFF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALDIRI MONITOR */}
        {attackProgress.isRunning && (
          <div className="bg-[#101010] rounded border border-[#FF9900]/30 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#FF9900] font-mono font-bold text-sm">ATTACK PROGRESS</span>
              <span className="text-[#FF9900] font-mono text-sm">{Math.round(attackProgress.progress)}%</span>
            </div>
            <div className="w-full bg-[#1A1A1A] rounded-full h-2 mb-2">
              <div 
                className="bg-[#FF9900] h-2 rounded-full transition-all duration-300"
                style={{ width: `${attackProgress.progress}%` }}
              ></div>
            </div>
            <div className="text-[#00FF41] font-mono text-xs">{attackProgress.status}</div>
          </div>
        )}
      </div>
    );
  };

  // NRF24 MODULE
  const renderNRF24Module = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#FF33FF] font-mono font-bold text-lg">NRF24L01 CONTROLLER</h3>
          <button className="bg-[#00FF41] text-black px-3 py-1 rounded text-xs font-mono hover:bg-[#00DD35]">
            <Save className="w-3 h-3 inline mr-1" />
            SAVE
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#101010] p-2 rounded border border-[#FF33FF]/30 text-center">
            <div className="text-[#FF33FF] text-xs font-mono">CHANNEL</div>
            <div className="text-[#00FF41] font-mono font-bold text-lg">{nrf24Data.channel}</div>
          </div>
          <div className="bg-[#101010] p-2 rounded border border-[#FF33FF]/30 text-center">
            <div className="text-[#FF33FF] text-xs font-mono">DATA RATE</div>
            <div className="text-[#00FF41] font-mono font-bold text-sm">2Mbps</div>
          </div>
          <div className="bg-[#101010] p-2 rounded border border-[#FF33FF]/30 text-center">
            <div className="text-[#FF33FF] text-xs font-mono">NODES</div>
            <div className="text-[#00FF41] font-mono font-bold text-lg">{nrf24Data.connectedNodes.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={startPacketInjection} className="bg-[#FF33FF] text-white p-3 rounded font-mono text-sm hover:bg-[#CC00CC]">
            PACKET INJECTION
          </button>
          <button onClick={startChannelHopping} className="bg-[#FF9966] text-white p-3 rounded font-mono text-sm hover:bg-[#CC6633]">
            CHANNEL HOPPING
          </button>
        </div>

        {/* ALINAN VERİLER */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#101010] rounded border border-[#FF33FF]/30 p-3">
            <h4 className="text-[#FF33FF] font-mono text-sm mb-2">RECEIVED DATA</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {nrf24Data.receivedData.map((data, index) => (
                <div key={index} className="text-[#00FF41] font-mono text-xs p-1 bg-[#1A1A1A] rounded">
                  {data}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#101010] rounded border border-[#00FF41]/30 p-3">
            <h4 className="text-[#00FF41] font-mono text-sm mb-2">CONNECTED NODES</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {nrf24Data.connectedNodes.map((node, index) => (
                <div key={index} className="text-[#00BFFF] font-mono text-xs p-1 bg-[#1A1A1A] rounded">
                  {node}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SALDIRI MONITOR */}
        {attackProgress.isRunning && (
          <div className="bg-[#101010] rounded border border-[#FF33FF]/30 p-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#FF33FF] font-mono font-bold text-sm">ATTACK PROGRESS</span>
              <span className="text-[#FF33FF] font-mono text-sm">{Math.round(attackProgress.progress)}%</span>
            </div>
            <div className="w-full bg-[#1A1A1A] rounded-full h-2 mb-2">
              <div 
                className="bg-[#FF33FF] h-2 rounded-full transition-all duration-300"
                style={{ width: `${attackProgress.progress}%` }}
              ></div>
            </div>
            <div className="text-[#00FF41] font-mono text-xs">{attackProgress.status}</div>
          </div>
        )}
      </div>
    );
  };

  // ANA RENDER FONKSİYONU
  const renderModuleContent = () => {
    if (module === 'wifi') {
      switch (subModule) {
        case 'deauth': 
          return renderDeauthAttack();
        case 'sniffing': 
          return renderPacketSniffing();
        default: 
          return renderDeauthAttack();
      }
    } else if (module === 'bluetooth') {
      return renderBluetoothModule();
    } else if (module === 'nrf24') {
      return renderNRF24Module();
    }
    
    return (
      <div className="text-center py-8">
        <div className="text-[#00FF41] font-mono text-lg mb-4">
          {module.toUpperCase()} Module
        </div>
        <div className="text-[#00BFFF] font-mono text-sm">
          Select specific attack method from drawer
        </div>
      </div>
    );
  };

  const moduleColor = getModuleColor();

  return (
    <div className="bg-[#1A1A1A] rounded border-2 border-[#00FF41]/30 p-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div style={{ color: moduleColor }}>
          {getModuleIcon()}
        </div>
        <div>
          <h2 className="text-[#00FF41] font-mono font-bold text-lg">{module.toUpperCase()} MODULE</h2>
          {subModule && (
            <p className="text-[#00FF41]/70 font-mono text-sm">{subModule.replace(/_/g, ' ').toUpperCase()}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4 flex-1">
        <div className="flex items-center justify-between p-3 bg-[#101010] rounded border border-[#00FF41]/30">
          <span className="text-[#00FF41]/70 font-mono">Status:</span>
          <span className={isConnected ? 'text-[#00FF41] font-bold' : 'text-[#FF3333] font-bold'}>
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onConnect}
            disabled={isConnected}
            className="flex-1 bg-[#00FF41] text-black px-4 py-2 rounded font-mono font-bold hover:bg-[#00DD35] transition-colors disabled:opacity-50"
          >
            CONNECT
          </button>
          <button
            onClick={onDisconnect}
            disabled={!isConnected}
            className="flex-1 bg-[#FF3333] text-white px-4 py-2 rounded font-mono font-bold hover:bg-[#DD2222] transition-colors disabled:opacity-50"
          >
            DISCONNECT
          </button>
        </div>

        {renderModuleContent()}
      </div>
    </div>
  );
};

// ANA APP COMPONENT - DEVAMI
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState('dashboard');
  const [selectedSubModule, setSelectedSubModule] = useState('');
  const [device, setDevice] = useState<ESP32Device | null>(null);

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(logged);
    if (logged) {
      initializeDevice();
      startTelemetryUpdates();
    }
  }, []);

  const initializeDevice = async () => {
    const { data } = await supabase
      .from('esp32_devices')
      .select('*')
      .eq('device_id', 'ESP32_HACK_UNIT_01')
      .maybeSingle();

    if (data) setDevice(data);

    const interval = setInterval(async () => {
      const { data: currentData } = await supabase
        .from('esp32_devices')
        .select('*')
        .eq('device_id', 'ESP32_HACK_UNIT_01')
        .maybeSingle();
      if (currentData) setDevice(currentData);
    }, 2000);

    return () => clearInterval(interval);
  };

  const startTelemetryUpdates = () => {
    const interval = setInterval(async () => {
      const { data: currentDevice } = await supabase
        .from('esp32_devices')
        .select('*')
        .eq('device_id', 'ESP32_HACK_UNIT_01')
        .maybeSingle();

      if (!currentDevice) return;

      const temp = Math.max(20, Math.min(45, currentDevice.temperature + (Math.random() - 0.5) * 2));
      const battery = Math.max(10, Math.min(100, currentDevice.battery_level - Math.random() * 0.5));
      const rssi = Math.max(-90, Math.min(-30, currentDevice.rssi + (Math.random() - 0.5) * 5));
      const load = Math.max(5, Math.min(95, currentDevice.load + (Math.random() - 0.5) * 3));

      await supabase
        .from('esp32_devices')
        .update({
          temperature: temp,
          battery_level: Math.round(battery),
          rssi: Math.round(rssi),
          load,
          last_seen: new Date().toISOString()
        })
        .eq('device_id', 'ESP32_HACK_UNIT_01');

      await supabase.from('telemetry_history').insert({
        device_id: 'ESP32_HACK_UNIT_01',
        temperature: temp,
        battery_level: Math.round(battery),
        rssi: Math.round(rssi),
        load
      });
    }, 3000);

    return () => clearInterval(interval);
  };

  const sendCommandToESP32 = async (command: string, data?: Record<string, unknown>) => {
    try {
      await supabase.from('esp32_commands').insert({
        device_id: 'ESP32_HACK_UNIT_01',
        command,
        data: data || {},
        executed: false,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending command to ESP32:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const handleConnect = async () => {
    await supabase
      .from('esp32_devices')
      .update({ is_connected: true, status: 'Online' })
      .eq('device_id', 'ESP32_HACK_UNIT_01');
    await sendCommandToESP32('connect_device');
  };

  const handleDisconnect = async () => {
    await supabase
      .from('esp32_devices')
      .update({ is_connected: false, status: 'Offline' })
      .eq('device_id', 'ESP32_HACK_UNIT_01');
    await sendCommandToESP32('disconnect_device');
  };

  const handleCommandExecuted = async (command: string) => {
    if (command === 'led_on') {
      await supabase
        .from('esp32_devices')
        .update({ is_led_on: true })
        .eq('device_id', 'ESP32_HACK_UNIT_01');
      await sendCommandToESP32('led_on');
    } else if (command === 'led_off') {
      await supabase
        .from('esp32_devices')
        .update({ is_led_on: false })
        .eq('device_id', 'ESP32_HACK_UNIT_01');
      await sendCommandToESP32('led_off');
    }
  };

  const handleModuleSelect = (module: string, subModule?: string) => {
    setSelectedModule(module);
    setSelectedSubModule(subModule || '');
  };

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        device={device}
        onModuleSelect={handleModuleSelect}
        onTerminalOpen={() => {
          setIsTerminalOpen(true);
          setIsDrawerOpen(false);
        }}
        selectedModule={selectedModule}
      />

      <Terminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        deviceId="ESP32_HACK_UNIT_01"
        onCommandExecuted={handleCommandExecuted}
      />

      <header className="bg-[#1A1A1A] border-b-2 border-[#00FF41] p-4 shadow-[0_0_20px_rgba(0,255,65,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-[#00FF41] hover:text-[#00DD35] transition-colors"
            >
              <Menu className="w-8 h-8" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#00FF41] font-mono tracking-wider">
                SYSTEM ONLINE
              </h1>
              <p className="text-[#00FF41]/70 text-xs font-mono">
                Project Orion v2.0 | ESP32 Control Interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {device && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#101010] rounded border border-[#00FF41]/30">
                  <Activity className="w-5 h-5 text-[#00BFFF]" />
                  <span className="text-[#00BFFF] text-sm font-mono">
                    {device.temperature.toFixed(1)}°C
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#101010] rounded border border-[#00FF41]/30">
                  <Lightbulb
                    className={`w-5 h-5 ${
                      device.is_led_on ? 'text-[#00FF41]' : 'text-[#FF3333]/50'
                    }`}
                  />
                  <span
                    className={`text-sm font-mono ${
                      device.is_led_on ? 'text-[#00FF41]' : 'text-[#FF3333]'
                    }`}
                  >
                    LED
                  </span>
                </div>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#FF3333] text-white px-4 py-2 rounded font-mono font-bold hover:bg-[#DD2222] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-88px)]">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex-1">
            {selectedModule === 'dashboard' ? (
              <div className="bg-[#1A1A1A] rounded border-2 border-[#00FF41]/30 p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-[#00FF41] font-mono font-bold text-2xl mb-4">
                    MAIN CONTROL DASHBOARD
                  </h2>
                  <p className="text-[#00FF41]/70 font-mono text-lg">
                    Select a module from the menu to begin
                  </p>
                </div>
              </div>
            ) : (
              <ModulePanel
                module={selectedModule}
                subModule={selectedSubModule}
                isConnected={device?.is_connected || false}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <TelemetryChart deviceId="ESP32_HACK_UNIT_01" />

          <div className="bg-[#1A1A1A] p-4 rounded border-2 border-[#00FF41]/30">
            <h3 className="text-[#00FF41] font-mono font-bold text-sm mb-3">SYSTEM INFO</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#00FF41]/70">Mission Status:</span>
                <span className="text-[#FF3333] font-bold">CLASSIFIED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#00FF41]/70">Device ID:</span>
                <span className="text-[#00FF41]">{device?.device_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#00FF41]/70">Active Module:</span>
                <span className="text-[#00BFFF]">{selectedModule.toUpperCase()}</span>
              </div>
              {selectedSubModule && (
                <div className="flex justify-between">
                  <span className="text-[#00FF41]/70">Active Attack:</span>
                  <span className="text-[#FF9900]">
                    {selectedSubModule.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#00FF41]/70">Status:</span>
                <span
                  className={device?.is_connected ? 'text-[#00FF41]' : 'text-[#FF3333]'}
                >
                  {device?.is_connected ? 'CONNECTED' : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-4 rounded border-2 border-[#FF9900]/30">
            <h3 className="text-[#FF9900] font-mono font-bold text-sm mb-2">
              GUIDANCE PROTOCOL
            </h3>
            <p className="text-[#00FF41]/70 text-xs font-mono leading-relaxed">
              Use the left menu to access specialized hardware modules. Each module contains
              multiple attack vectors for comprehensive penetration testing.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;