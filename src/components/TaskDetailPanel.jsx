import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, CheckCircle, AlertCircle, Repeat } from 'lucide-react';

const TaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [editedTask, setEditedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--neon)] font-[JetBrains Mono]">TASK DETAILS</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--surface-high)] transition-colors"
            aria-label="Close panel"
          >
            <X size={20} className="text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${task.completed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
              {task.completed ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <AlertCircle size={16} className="text-red-500" />
              )}
            </div>
            <span className={`text-sm ${task.completed ? 'text-green-400' : 'text-red-400'}`}>
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 font-[JetBrains Mono]">TITLE</label>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleInputChange}
                className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-[var(--text-primary)] font-[JetBrains Mono] text-sm"
              />
            ) : (
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-[JetBrains Mono] break-words">
                {task.title}
              </h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 font-[JetBrains Mono]">DESCRIPTION</label>
            {isEditing ? (
              <textarea
                name="description"
                value={editedTask.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-[var(--text-primary)] font-[JetBrains Mono] text-sm resize-none"
              />
            ) : (
              <p className="text-sm text-[var(--text-primary)] font-[JetBrains Mono] break-words">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 font-[JetBrains Mono]">PRIORITY</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    if (isEditing) {
                      setEditedTask(prev => ({
                        ...prev,
                        priority
                      }));
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs font-[JetBrains Mono] transition-colors ${
                    isEditing
                      ? editedTask.priority === priority
                        ? 'bg-[var(--neon)] text-black'
                        : 'bg-[var(--surface-high)] text-[var(--text-primary)] hover:bg-[var(--surface)]'
                      : priority === task.priority
                        ? 'bg-[var(--neon)] text-black'
                        : 'bg-[var(--surface-high)] text-[var(--text-secondary)]'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[var(--text-muted)]" />
            <span className="text-sm text-[var(--text-primary)] font-[JetBrains Mono]">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </span>
          </div>

          {/* Created At */}
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-secondary)] font-[JetBrains Mono]">
              Created: {new Date(task.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 font-[JetBrains Mono]">TAGS</label>
            {isEditing ? (
              <input
                type="text"
                name="tags"
                value={editedTask.tags || ''}
                onChange={handleInputChange}
                placeholder="Add tags separated by commas"
                className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-[var(--text-primary)] font-[JetBrains Mono] text-sm"
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {task.tags?.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[var(--surface)] text-xs text-[var(--text-primary)] font-[JetBrains Mono] rounded"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-2">
            <Repeat size={16} className="text-[var(--text-muted)]" />
            <span className="text-sm text-[var(--text-primary)] font-[JetBrains Mono]">
              {task.recurring ? 'Recurring' : 'One-time'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-[var(--neon)] text-black text-sm font-bold font-[JetBrains Mono] rounded hover:bg-opacity-90 transition-colors"
                >
                  SAVE
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-[var(--surface-high)] text-[var(--text-primary)] text-sm font-[JetBrains Mono] rounded hover:bg-[var(--surface)] transition-colors"
                >
                  CANCEL
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-[var(--surface-high)] text-[var(--text-primary)] text-sm font-[JetBrains Mono] rounded hover:bg-[var(--surface)] transition-colors"
                >
                  EDIT
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="flex-1 px-4 py-2 bg-red-900/30 text-red-400 text-sm font-[JetBrains Mono] rounded hover:bg-red-900/50 transition-colors"
                >
                  DELETE
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;