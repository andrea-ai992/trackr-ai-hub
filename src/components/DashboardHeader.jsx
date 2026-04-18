Voici le fichier `src/components/DashboardHeader.jsx` créé de zéro selon les spécifications :

```jsx
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="w-full p-4 border-b border-[var(--border)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--green)] flex items-center justify-center">
            <span className="text-[var(--bg)] font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-[var(--t1)] font-medium text-lg">Bonjour Andrea</h1>
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-[var(--t3)]" />
              <span className="text-[var(--t3)] text-sm">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full ${
              isLive ? 'bg-[var(--green)] animate-pulse' : 'bg-[var(--t3)]'
            }`}
          />
          <span className="ml-2 text-xs text-[var(--t3)]">Live</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
```

Et voici le CSS associé à ajouter dans votre fichier global ou dans un module CSS :

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  margin: 0;
  padding: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}