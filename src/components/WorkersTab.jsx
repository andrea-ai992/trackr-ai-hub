Je vais améliorer `BrainExplorer.jsx` et créer `WorkersTab.jsx` selon vos spécifications.

Voici d'abord le code pour `src/components/WorkersTab.jsx`:

```jsx
import { useState } from 'react';

export const WorkersTab = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDashboard = () => {
    setIsLoading(true);
    window.open('http://62.238.12.221:4000/brain', '_blank');
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="workers-tab">
      <div className="workers-header">
        <h2>Workers</h2>
        <p>Surveillance des processus actifs</p>
      </div>

      <div className="workers-grid">
        <div className="worker-card">
          <div className="worker-info">
            <div className="worker-status active"></div>
            <div>
              <h3>AnDy Core</h3>
              <p>IA principale en opération</p>
            </div>
          </div>
          <div className="worker-stats">
            <span>CPU: <strong>12%</strong></span>
            <span>RAM: <strong>45%</strong></span>
          </div>
        </div>

        <div className="worker-card">
          <div className="worker-info">
            <div className="worker-status active"></div>
            <div>
              <h3>Task Queue</h3>
              <p>File d'attente des tâches</p>
            </div>
          </div>
          <div className="worker-stats">
            <span>En attente: <strong>3</strong></span>
            <span>En cours: <strong>1</strong></span>
          </div>
        </div>

        <div className="worker-card">
          <div className="worker-info">
            <div className="worker-status active"></div>
            <div>
              <h3>API Server</h3>
              <p>Backend Node.js</p>
            </div>
          </div>
          <div className="worker-stats">
            <span>Requêtes: <strong>42</strong></span>
            <span>Latence: <strong>8ms</strong></span>
          </div>
        </div>
      </div>

      <div className="workers-actions">
        <button
          className="btn-primary"
          onClick={handleOpenDashboard}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Ouverture...
            </>
          ) : (
            'Ouvrir dashboard live'
          )}
        </button>
        <p className="workers-note">
          Le dashboard live affiche les logs en temps réel et l'état des workers
        </p>
      </div>
    </div>
  );
};
```

Et maintenant les modifications pour `src/pages/BrainExplorer.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const BrainExplorer = () => {
  const navigate = useNavigate();
  const SERVER = import.meta.env.VITE_API_SERVER || 'http://localhost:4000';

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${SERVER}/api/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${SERVER}/api/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newTask }),
      });

      if (response.ok) {
        setSubmitStatus({ success: true, message: 'Tâche ajoutée à la queue' });
        setNewTask('');
        setTimeout(() => {
          fetchTasks();
          setSubmitStatus({ success: false, message: '' });
        }, 2000);
      } else {
        throw new Error('Erreur lors de l\'envoi de la tâche');
      }
    } catch (error) {
      setSubmitStatus({ success: false, message: 'Erreur lors de l\'envoi' });
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskCategories = [
    { label: 'Redesign', value: 'redesign' },
    { label: 'Fix bug', value: 'bug' },
    { label: 'Ajoute feature', value: 'feature' },
    { label: 'Audit sécurité', value: 'security' },
  ];

  const handleQuickSuggestion = (suggestion) => {
    setNewTask(suggestion);
  };

  return (
    <div className="brain-explorer">
      <div className="brain-header">
        <h1><Brain size={28} /> Brain Explorer</h1>
        <p>Gestion des tâches et surveillance des workers</p>
      </div>

      <div className="brain-tabs">
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tâches
        </button>
        <button
          className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          Workers
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="tasks-section">
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>Aucune tâche en cours</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <span className={`task-status ${task.status}`}></span>
                    <h3>{task.title || 'Tâche #' + task.id}</h3>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span>Créé: {new Date(task.created_at).toLocaleString()}</span>
                    {task.priority && <span className="priority-badge">{task.priority}</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="new-task-section">
            <h3>Nouvelle tâche</h3>
            <form onSubmit={handleSubmitTask} className="task-form">
              <textarea
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Décris la tâche pour AnDy..."
                rows={3}
                className="task-input"
              />
              <div className="quick-suggestions">
                {taskCategories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => handleQuickSuggestion(category.label)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !newTask.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span> Envoi...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Envoyer
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <WorkersTab />
      )}

      {submitStatus.message && (
        <div className={`toast ${submitStatus.success ? 'success' : 'error'}`}>
          {submitStatus.success ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{submitStatus.message}</span>
        </div>
      )}
    </div>
  );
};

const WorkersTab = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDashboard = () => {
    setIsLoading(true);
    window.open('http://62.238.12.221:4000/brain', '_blank');
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="workers-tab">
      <div className="workers-header">
        <h2>Workers</h2>
        <p>Surveillance des processus actifs</p>
      </div>

      <div className="workers-grid">
        <div className="worker-card">
          <div className="worker-info">
            <div className="worker-status active"></div>
            <div>
              <h3>AnDy Core</h3>
              <p>IA principale en opération</p>
            </div>
          </div>
          <div className="worker-stats">
            <span>CPU: <strong>12%</strong></span>
            <span>RAM: <strong>45%</strong></span>
          </div>
        </div>

        <div className="worker-card">
          <div className="worker-info">
            <div className="worker-status active"></div>
            <div>
              <h3>Task Queue</h3>
              <p>File d'attente des tâches</p>
            </div>
          </div>
          <div className="worker-stats">
            <span>En attente: <strong>3</strong></span>
            <span>En cours: <strong>1</strong></span>
          </div>
        </div>

        <div className="worker-card">
          <div className="worker-info">
            <div className="worker-status active"></div>
            <div>
              <h3>API Server</h3>
              <p>Backend Node.js</p>
            </div>
          </div>
          <div className="worker-stats">
            <span>Requêtes: <strong>42</strong></span>
            <span>Latence: <strong>8ms</strong></span>
          </div>
        </div>
      </div>

      <div className="workers-actions">
        <button
          className="btn-primary"
          onClick={handleOpenDashboard}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Ouverture...
            </>
          ) : (
            'Ouvrir dashboard live'
          )}
        </button>
        <p className="workers-note">
          Le dashboard live affiche les logs en temps réel et l'état des workers
        </p>
      </div>
    </div>
  );
};
```

N'oubliez pas d'ajouter les styles CSS correspondants dans votre fichier de styles global ou dans un fichier CSS dédié. Voici les styles nécessaires à ajouter:

```css
/* Styles pour BrainExplorer et WorkersTab */
.brain-explorer {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.brain-header {
  margin-bottom: 1.5rem;
}

.brain-header h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.brain-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--green);
  border-bottom: 2px solid var(--green);
}

.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.task-card:hover {
  border-color: var(--border-hi);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.task-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.task-status.active {
  background: var(--green);
}

.task-status.pending {
  background: var(--t3);
}

.task-status.completed {
  background: var(--green);
}

.task-description {
  margin-bottom: 0.75rem;
  color: var(--t2);
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--t3);
}

.priority-badge {
  background: rgba(0, 255, 136, 0.1);
  color: var(--green);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.new-task-section {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.new-task-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-input {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--t1);
  font-family: inherit;
  resize: none;
  min-height: 60px;
}

.task-input::placeholder {
  color: var(--t3);
}

.quick-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-chip {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  color: var(--t1);
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  border-color: var(--border-hi);
  background: var(--bg3);
}

.workers-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.workers-header {
  margin-bottom: 1rem;
}

.workers-header h2 {
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.workers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.worker-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.worker-card:hover {
  border-color: var(--border-hi);
}

.worker-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.worker-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.worker-status.active {
  background: var(--green);
}

.worker-status.inactive {
  background: var(--t3);
}

.worker-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.worker-stats span {
  display: flex;
  justify-content: space-between;
}

.workers-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-primary {
  background: var(--green);
  color: #000;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed