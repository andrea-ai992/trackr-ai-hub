// src/pages/BrainExplorer.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Check, X, Loader2, Plus } from 'lucide-react';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function BrainExplorer() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${SERVER}/api/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch(`${SERVER}/api/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newTask }),
      });
      if (res.ok) {
        setNewTask('');
        setToast({ type: 'success', message: 'Tâche ajoutée à la queue' });
        setTimeout(() => setToast(null), 3000);
        setTimeout(fetchTasks, 2000);
      }
    } catch (err) {
      console.error('Failed to submit task:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--neon)] flex items-center gap-2">
          <MessageSquare size={20} /> BrainExplorer
        </h1>
      </header>

      <div className="space-y-4">
        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--neon)] mb-3">Tâches en cours</h2>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-[var(--neon)]" size={20} />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm">Aucune tâche en cours.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2 p-2 rounded border-b border-[var(--border)] last:border-b-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${task.status === 'completed' ? 'bg-[var(--neon)]' : 'bg-[var(--text-muted)]'}`} />
                  <div>
                    <p className="text-sm">{task.description}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Status: {task.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--neon)] mb-3">Nouvelle tâche</h2>
          <form onSubmit={handleSubmitTask} className="space-y-3">
            <textarea
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Décris la tâche pour AnDy..."
              rows={3}
              className="w-full p-2 bg-[var(--surface-low)] border border-[var(--border)] rounded text-sm focus:outline-none focus:border-[var(--neon)] resize-none"
              required
            />
            <div className="flex flex-wrap gap-2">
              {['Redesign Dashboard', 'Fix bug', 'Ajoute feature', 'Audit sécurité'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNewTask(suggestion)}
                  className="px-3 py-1 bg-[var(--surface-high)] border border-[var(--border)] rounded text-xs hover:bg-[var(--surface)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--neon)] text-black rounded font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Envoyer
            </button>
          </form>
        </div>

        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--neon)] mb-3 flex items-center gap-2">
            <Plus size={18} /> Workers
          </h2>
          <WorkersPanel />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-[var(--surface-high)] border border-[var(--neon)] rounded p-3 flex items-center gap-2 text-sm animate-fade-in">
          <Check size={16} className="text-[var(--neon)]" />
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-auto">
            <X size={16} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
          </button>
        </div>
      )}
    </div>
  );
}

function WorkersPanel() {
  const openDashboard = () => {
    window.open('http://62.238.12.221:4000/brain', '_blank');
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-secondary)]">
        Monitor et contrôle les workers en temps réel.
      </p>
      <button
        onClick={openDashboard}
        className="px-4 py-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-sm hover:bg-[var(--surface)] transition-colors flex items-center gap-2"
      >
        Ouvrir dashboard live
      </button>
    </div>
  );
}