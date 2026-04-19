import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Calendar, Tag, AlertCircle, Copy, Check } from 'lucide-react';

const TaskDetailPanel = ({ task, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = () => {
    if (!task) return;
    navigator.clipboard.writeText(JSON.stringify(task, null, 2));
    setIsCopied(true);
  };

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-surface p-6 rounded-lg border border-border w-full max-w-sm mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-medium">Task Details</h3>
            <button onClick={onClose} className="text-text-secondary hover:text-neon transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-text-secondary text-sm">No task selected</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: Clock, color: '#aaa', label: 'Pending' },
    completed: { icon: CheckCircle, color: '#00ff88', label: 'Completed' },
    failed: { icon: AlertCircle, color: '#ff4444', label: 'Failed' },
  };

  const StatusIcon = statusConfig[task.status]?.icon || Clock;
  const statusStyle = statusConfig[task.status] || statusConfig.pending;

  const fadeUpClasses = "animate-fade-up animate-once animate-duration-300 animate-ease-in-out";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className={`text-text-primary font-medium flex items-center gap-2 ${fadeUpClasses}`}>
            <StatusIcon size={18} color={statusStyle.color} />
            Task Details
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-neon transition-colors"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className={`flex items-start gap-3 ${fadeUpClasses}`}>
            <div className="flex-shrink-0 mt-1">
              <StatusIcon size={16} color={statusStyle.color} />
            </div>
            <div>
              <h4 className="text-text-primary font-medium text-sm">{task.title || 'Untitled Task'}</h4>
              <p className="text-text-secondary text-xs mt-1">{task.description || 'No description provided'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`space-y-1 ${fadeUpClasses}`} style={{ animationDelay: '50ms' }}>
              <p className="text-text-muted text-xs uppercase tracking-wider font-mono">Status</p>
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm" style={{ color: statusStyle.color }}>
                  {statusStyle.label}
                </span>
              </div>
            </div>

            {task.priority && (
              <div className={`space-y-1 ${fadeUpClasses}`} style={{ animationDelay: '100ms' }}>
                <p className="text-text-muted text-xs uppercase tracking-wider font-mono">Priority</p>
                <span className="text-text-primary text-sm font-mono">{task.priority}</span>
              </div>
            )}

            {task.dueDate && (
              <div className={`space-y-1 ${fadeUpClasses}`} style={{ animationDelay: '150ms' }}>
                <p className="text-text-muted text-xs uppercase tracking-wider font-mono">Due Date</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-text-secondary" />
                  <span className="text-text-primary text-sm font-mono">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className={`space-y-1 ${fadeUpClasses}`} style={{ animationDelay: '200ms' }}>
                <p className="text-text-muted text-xs uppercase tracking-wider font-mono">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-surface-low text-text-secondary text-xs rounded font-mono border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {task.assignee && (
            <div className={`space-y-1 ${fadeUpClasses}`} style={{ animationDelay: '250ms' }}>
              <p className="text-text-muted text-xs uppercase tracking-wider font-mono">Assignee</p>
              <span className="text-text-primary text-sm font-mono">{task.assignee}</span>
            </div>
          )}

          {task.createdAt && (
            <div className={`space-y-1 ${fadeUpClasses}`} style={{ animationDelay: '300ms' }}>
              <p className="text-text-muted text-xs uppercase tracking-wider font-mono">Created</p>
              <span className="text-text-secondary text-xs font-mono">
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className={`p-4 border-t border-border flex items-center justify-between ${fadeUpClasses}`} style={{ animationDelay: '350ms' }}>
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-text-secondary" />
            <span className="text-text-muted text-xs uppercase tracking-wider font-mono">ID</span>
            <span className="text-text-secondary text-xs font-mono ml-2">{task.id?.substring(0, 8)}...</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface-low hover:bg-surface-high transition-colors rounded border border-border text-text-secondary hover:text-neon text-xs"
            aria-label="Copy task data"
          >
            {isCopied ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;