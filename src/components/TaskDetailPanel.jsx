src/components/TaskDetailPanel.jsx
```jsx
import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar, Target, Flag, MessageSquare, User, Edit, Trash2 } from 'lucide-react';

const TaskDetailPanel = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  onAddNote,
  onToggleComplete
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (task) {
      setEditTitle(task.title || '');
      setEditDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const formatTime = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'completed': 'var(--green)',
      'in-progress': 'var(--green)',
      'pending': '#ffcc00',
      'failed': '#ff3333',
      'cancelled': '#888'
    };
    return statusColors[status] || '#888';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'completed': CheckCircle,
      'in-progress': Clock,
      'pending': AlertCircle,
      'failed': AlertCircle,
      'cancelled': XCircle
    };
    return icons[status] || AlertCircle;
  };

  const TimelineItem = ({ time, title, subtitle, icon: Icon, color }) => (
    <div className="flex items-start gap-3 p-3 border-b border--border">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg--bg2 flex items-center justify-center">
        <Icon size={16} color={color || 'var(--green)'} />
      </div>
      <div className="flex-1">
        <div className="text-t1 font-medium">{time}</div>
        <div className="text-t2">{title}</div>
        <div className="text-t3 text-xs">{subtitle}</div>
      </div>
    </div>
  );

  const renderTimeline = () => {
    const now = new Date();
    const timeline = [];

    // Timeline 24h
    for (let i = -12; i <= 12; i++) {
      const hour = now.getHours() + i;
      const time = `${String(hour).padStart(2, '0')}:00`;

      let event = null;

      if (i === 0) {
        event = {
          time,
          title: 'Maintenant',
          subtitle: 'Heure actuelle',
          icon: Clock,
          color: 'var(--green)'
        };
      } else if (hour === 9 && i === -3) {
        event = {
          time,
          title: 'Réunion matinale',
          subtitle: 'Point d équipe',
          icon: Calendar,
          color: '#00ccff'
        };
      } else if (hour === 14 && i === 2) {
        event = {
          time,
          title: 'Deadline projet',
          subtitle: 'Livraison finale',
          icon: Target,
          color: '#ff6600'
        };
      } else if (hour === 18 && i === 6) {
        event = {
          time,
          title: 'Sport',
          subtitle: 'Séance de running',
          icon: Flag,
          color: '#ff3366'
        };
      }

      if (event) {
        timeline.push(<TimelineItem key={time} {...event} />);
      } else {
        timeline.push(
          <div key={time} className="flex items-center gap-3 p-3 border-b border--border">
            <div className="w-10 h-10 rounded-full bg--bg2 flex items-center justify-center">
              <Clock size={16} color="var(--t3)" />
            </div>
            <div className="text-t1 font-medium">{time}</div>
            <div className="text-t3 text-xs ml-auto">Aucun événement</div>
          </div>
        );
      }
    }

    return timeline;
  };

  const handleUpdateTask = () => {
    if (onUpdate && editTitle.trim()) {
      onUpdate({
        ...task,
        title: editTitle,
        description: editDescription
      });
      setIsEditing(false);
    }
  };

  const handleAddNote = () => {
    if (onAddNote && newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50">
      <div className="bg--bg rounded-t-lg w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border--border">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg--bg2 transition-colors"
              aria-label="Fermer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h2 className="text-t1 font-semibold">Détails de la tâche</h2>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdateTask}
                  className="px-4 py-2 bg--green text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-t2 hover:text-t1 transition-colors"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-full hover:bg--bg2 transition-colors"
                  aria-label="Modifier"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete && onDelete(task.id)}
                  className="p-2 rounded-full hover:bg--bg2 transition-colors text-red-500"
                  aria-label="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Onglets */}
          <div className="flex border-b border--border">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'details' ? 'text--green border-b-2 border--green' : 'text-t2'}`}
              onClick={() => setActiveTab('details')}
            >
              Détails
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'timeline' ? 'text--green border-b-2 border--green' : 'text-t2'}`}
              onClick={() => setActiveTab('timeline')}
            >
              Timeline
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'notes' ? 'text--green border-b-2 border--green' : 'text-t2'}`}
              onClick={() => setActiveTab('notes')}
            >
              Notes
            </button>
          </div>

          {/* Onglet Détails */}
          {activeTab === 'details' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 p-2 bg--bg2 rounded-lg text-t1 border border--border focus:outline-none focus:border--green"
                      placeholder="Titre de la tâche"
                    />
                  ) : (
                    <h3 className="text-xl font-semibold text-t1">{task.title || 'Sans titre'}</h3>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  ></div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: getStatusColor(task.status) }}
                  >
                    {task.status || 'Non définie'}
                  </span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-t2">
                    <Calendar size={16} />
                    <span>Date limite: {formatDate(task.dueDate)}</span>
                  </div>
                )}

                {task.priority && (
                  <div className="flex items-center gap-2 text-t2">
                    <Flag size={16} />
                    <span>Priorité: {task.priority}</span>
                  </div>
                )}

                {task.assignee && (
                  <div className="flex items-center gap-2 text-t2">
                    <User size={16} />
                    <span>Assigné à: {task.assignee}</span>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 bg--bg2 rounded-lg text-t1 border border--border focus:outline-none focus:border--green min-h-[120px]"
                    placeholder="Description de la tâche..."
                  />
                </div>
              ) : (
                task.description && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-t1">Description</h4>
                    <p className="text-t2 leading-relaxed">{task.description}</p>
                  </div>
                )
              )}

              {task.createdAt && (
                <div className="text-xs text-t3 pt-4 border-t border--border">
                  Créée le {formatDate(task.createdAt)} à {formatTime(task.createdAt)}
                </div>
              )}
            </div>
          )}

          {/* Onglet Timeline */}
          {activeTab === 'timeline' && (
            <div className="p-4 space-y-2">
              <div className="text-t3 text-sm mb-4">
                Timeline des 24 prochaines heures
              </div>
              {renderTimeline()}
            </div>
          )}

          {/* Onglet Notes */}
          {activeTab === 'notes' && (
            <div className="p-4 space-y-4">
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {task.notes && task.notes.length > 0 ? (
                  task.notes.map((note, index) => (
                    <div key={index} className="p-3 bg--bg2 rounded-lg border border--border">
                      <div className="flex items-start gap-2">
                        <MessageSquare size={16} className="text-t3 mt-1" />
                        <div className="flex-1">
                          <p className="text-t2 text-sm">{note}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare size={48} className="text-t3 mx-auto mb-4" />
                    <p className="text-t3">Aucune note pour cette tâche</p>
                  </div>
                )}
              </div>

              <div className="border-t border--border pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 p-3 bg--bg2 rounded-lg text-t1 border border--border focus:outline-none focus:border--green"
                    placeholder="Ajouter une note..."
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-3 bg--green text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={!newNote.trim()}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="p-4 border-t border--border">
          <div className="flex gap-2">
            <button
              onClick={() => onToggleComplete && onToggleComplete(task.id)}
              className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                task.status === 'completed'
                  ? 'bg-gray-700 text-t3'
                  : 'bg--green text-black hover:opacity-90'
              }`}
            >
              <CheckCircle size={18} />
              {task.status === 'completed' ? 'Terminée' : 'Marquer comme terminée'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;