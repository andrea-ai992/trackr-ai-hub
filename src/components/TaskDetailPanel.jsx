import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Tag, User } from 'lucide-react';

const TaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending'
      });
    }
  }, [task]);

  useEffect(() => {
    if (isOpen) {
      setIsExpanded(true);
    } else {
      const timer = setTimeout(() => setIsExpanded(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (newStatus) => {
    setEditedTask(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  const handleSave = () => {
    onUpdate(editedTask);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setEditMode(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <XCircle className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`bg-bg2 border-l border-border w-full max-w-sm h-full shadow-2xl transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-t1 font-medium">Task Details</h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-bg3 transition-colors"
              aria-label="Close panel"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[80vh]' : 'max-h-0'}`}
        >
          {editedTask && (
            <div className="p-4 space-y-4">
              {/* Task Title */}
              {editMode ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="title"
                    value={editedTask.title}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-bg border border-border rounded text-t1 placeholder-t3 focus:outline-none focus:border-green"
                    placeholder="Task title"
                  />
                </div>
              ) : (
                <h2 className="text-t1 font-semibold text-lg">{task.title}</h2>
              )}

              {/* Task Description */}
              {task.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-t3 text-sm">
                    <Tag className="w-4 h-4" />
                    <span>Description</span>
                  </div>
                  {editMode ? (
                    <textarea
                      name="description"
                      value={editedTask.description || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-bg border border-border rounded text-t2 placeholder-t3 focus:outline-none focus:border-green min-h-[60px]"
                      placeholder="Add description..."
                    />
                  ) : (
                    <p className="text-t2 text-sm">{task.description}</p>
                  )}
                </div>
              )}

              {/* Task Metadata */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Status */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-t3 text-sm">
                      <User className="w-4 h-4" />
                      <span>Status</span>
                    </div>
                    {editMode ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange('pending')}
                          className={`px-3 py-1 rounded text-sm transition-colors ${editedTask.status === 'pending' ? 'bg-blue-900 text-blue-200' : 'hover:bg-bg3'}`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange('completed')}
                          className={`px-3 py-1 rounded text-sm transition-colors ${editedTask.status === 'completed' ? 'bg-green-900 text-green-200' : 'hover:bg-bg3'}`}
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange('failed')}
                          className={`px-3 py-1 rounded text-sm transition-colors ${editedTask.status === 'failed' ? 'bg-red-900 text-red-200' : 'hover:bg-bg3'}`}
                        >
                          Failed
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(editedTask.status)}
                        <span className={`capitalize ${editedTask.status === 'completed' ? 'text-green' : editedTask.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                          {editedTask.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-t3 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Priority</span>
                    </div>
                    {editMode ? (
                      <select
                        name="priority"
                        value={editedTask.priority}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-bg border border-border rounded text-t1 focus:outline-none focus:border-green"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    ) : (
                      <span className={`text-sm ${getPriorityColor(editedTask.priority)}`}>
                        {editedTask.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Due Date and Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-t3 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Due Date</span>
                    </div>
                    {editMode ? (
                      <input
                        type="date"
                        name="dueDate"
                        value={editedTask.dueDate}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-bg border border-border rounded text-t1 focus:outline-none focus:border-green"
                      />
                    ) : (
                      <span className="text-t1 text-sm">{formatDate(editedTask.dueDate)}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-t3 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Time</span>
                    </div>
                    {editMode ? (
                      <input
                        type="time"
                        name="dueTime"
                        value={editedTask.dueTime || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-bg border border-border rounded text-t1 focus:outline-none focus:border-green"
                      />
                    ) : (
                      <span className="text-t1 text-sm">{formatTime(editedTask.dueDate)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-green text-bg rounded text-sm font-medium hover:bg-green-400 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-bg3 border border-border rounded text-t1 text-sm hover:bg-bg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 px-4 py-2 bg-bg3 border border-border rounded text-t1 text-sm hover:bg-bg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="flex-1 px-4 py-2 bg-red-900 border border-red-700 rounded text-red-200 text-sm hover:bg-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;