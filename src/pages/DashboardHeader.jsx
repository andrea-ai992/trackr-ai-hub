// src/pages/DashboardHeader.jsx
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center border border-border">
          <User size={18} className="text-text-primary" />
        </div>
        <div>
          <h1 className="text-text-primary font-medium text-sm">Bonjour Andrea</h1>
          <p className="text-text-secondary text-xs">{formattedTime}</p>
        </div>
      </div>
      <div className="w-3 h-3 rounded-full bg-neon animate-pulse"></div>
    </header>
  );
}