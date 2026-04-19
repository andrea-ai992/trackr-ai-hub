// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Tag, User, CheckCircle, AlertCircle, Repeat, Flag, Bookmark, Edit2, Trash2 } from 'lucide-react';

const TaskDetailPanel = ({ task, onClose, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const panelRef = useRef(null);

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  useEffect(() => {
    if (task) {
      setEditedTask({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || '',
        createdAt: task.createdAt || new Date().toISOString(),
        tags: task.tags || [],
        assignee: task.assignee || '',
        recurrence: task.recurrence || 'none',
        notes: task.notes || '',
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: escapeHTML(value) }));
  };

  const handleTagChange = (e) => {
    const { value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      tags: value.split(',').map(tag => escapeHTML(tag.trim())).filter(tag => tag.length > 0)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editedTask);
    setEditMode(false);
  };

  const statusColors = {
    pending: 'var(--text-muted)',
    in_progress: 'var(--neon)',
    completed: 'var(--text-secondary)',
    archived: 'var(--text-secondary)',
  };

  const priorityColors = {
    low: 'var(--text-muted)',
    medium: 'var(--neon)',
    high: '#ff6b6b',
    critical: '#ff4757',
  };

  const statusIcons = {
    pending: <AlertCircle size={16} />,
    in_progress: <Clock size={16} />,
    completed: <CheckCircle size={16} />,
    archived: <Bookmark size={16} />,
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  };

  const recurrenceIcons = {
    none: '➖',
    daily: '🔄',
    weekly: '📅',
    monthly: '🗓️',
    yearly: '📆',
  };

  if (!isOpen || !task) return null;

  return (
    <div className="task-detail-panel-overlay" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div
        ref={panelRef}
        className="task-detail-panel"
        style={{
          width: 'min(400px, 90vw)',
          backgroundColor: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          padding: '24px',
          position: 'relative',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-primary)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close panel"
        >
          <X size={20} />
        </button>

        {editMode ? (
          <form onSubmit={handleSubmit}>
            <div style={{
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editedTask.title}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-low)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>Description</label>
                <textarea
                  name="description"
                  value={editedTask.description}
                  onChange={handleInputChange}
                  rows={4}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-low)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>Status</label>
                  <select
                    name="status"
                    value={editedTask.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--surface-low)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>Priority</label>
                  <select
                    name="priority"
                    value={editedTask.priority}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--surface-low)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editedTask.dueDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--surface-low)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>Assignee</label>
                  <input
                    type="text"
                    name="assignee"
                    value={editedTask.assignee}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--surface-low)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>Recurrence</label>
                <select
                  name="recurrence"
                  value={editedTask.recurrence}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-low)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={editedTask.tags.join(', ')}
                  onChange={handleTagChange}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-low)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>Notes</label>
                <textarea
                  name="notes"
                  value={editedTask.notes}
                  onChange={handleInputChange}
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-low)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px',
              }}>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--surface-high)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--neon)',
                    border: '1px solid var(--neon)',
                    borderRadius: '4px',
                    padding: '10px',
                    color: 'var(--bg)',
                    fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{
                fontSize: '18px',
                margin: 0,
                color: 'var(--text-primary)',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {task.title}
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--neon)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  aria-label="Edit task"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff4757',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  aria-label="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {task.description && (
              <p style={{
                margin: 0,
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.4',
              }}>
                {task.description}
              </p>
            )}

            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: statusColors[task.status] || 'var(--text-muted)',
              }}>
                {statusIcons[task.status] || <AlertCircle size={16} />}
                <span>{task.status?.replace('_', ' ') || 'pending'}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: priorityColors[task.priority] || 'var(--text-muted)',
              }}>
                {priorityIcons[task.priority] || '🟡'}
                <span>{task.priority || 'medium'}</span>
              </div>

              {task.dueDate && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>
                  <Calendar size={16} />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {task.assignee && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>
                  <User size={16} />
                  <span>{task.assignee}</span>
                </div>
              )}

              {task.recurrence !== 'none' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>
                  {recurrenceIcons[task.recurrence] || '➖'}
                  <span>{task.recurrence}</span>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}>
                {task.tags.map((tag, index) => (
                  <span key={index} style={{
                    backgroundColor: 'var(--surface-high)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: 'var(--neon)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {task.notes && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
              }}>
                <h4 style={{
                  fontSize: '12px',
                  margin: '0 0 8px 0',
                  color: 'var(--text-secondary)',
                }}>Notes</h4>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color: 'var(--text-primary)',
                }}>
                  {task.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPanel;