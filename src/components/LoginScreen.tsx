import { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'moonberk' && password === 'moonberk') {
      localStorage.setItem('isLoggedIn', 'true');
      onLogin();
    } else {
      setError('>>> ACCESS DENIED <<<');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-[#1A1A1A] p-8 rounded-lg border-2 border-[#00FF41] shadow-[0_0_30px_rgba(0,255,65,0.3)]">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-[#101010] rounded-full mb-4 border-2 border-[#00FF41]">
              <Lock className="w-12 h-12 text-[#00FF41]" />
            </div>
            <h1 className="text-4xl font-bold text-[#00FF41] mb-2 font-mono tracking-wider"
                style={{ textShadow: '0 0 20px rgba(0,255,65,0.8)' }}>
              &gt;&gt; Welcome Moonberk &lt;&lt;
            </h1>
            <p className="text-[#00FF41] text-sm font-mono opacity-70">SECURE ACCESS REQUIRED</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FF3333]/10 border border-[#FF3333] rounded text-[#FF3333] text-center font-mono font-bold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[#00FF41] text-sm font-mono mb-2">USERNAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00FF41]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0A0A0A] border-2 border-[#00FF41]/50 rounded px-10 py-3 text-[#00FF41] font-mono focus:border-[#00FF41] focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#00FF41] text-sm font-mono mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00FF41]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0A] border-2 border-[#00FF41]/50 rounded px-10 py-3 text-[#00FF41] font-mono focus:border-[#00FF41] focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-[#00FF41] text-[#101010] font-mono font-bold py-3 rounded hover:bg-[#00DD35] transition-all shadow-[0_0_20px_rgba(0,255,65,0.5)] hover:shadow-[0_0_30px_rgba(0,255,65,0.8)]"
            >
              &gt; INITIATE LOGIN
            </button>
          </div>
        </div>

        <div className="text-center text-[#00FF41]/50 text-xs font-mono">
          SYSTEM v2.0 | CLASSIFIED ACCESS
        </div>
      </div>
    </div>
  );
}
