// src/pages/BrainExplorer.jsx
import React, { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import { toast } from 'react-toastify';

const BrainExplorer = () => {
    const [tasks, setTasks] = useState([]);
    
    useEffect(() => {
        // Fetch existing tasks logic here
    }, []);

    const handleTaskAdded = () => {
        toast.success("Tâche ajoutée à la queue");
        setTimeout(() => {
            // Refresh tasks logic here
        }, 2000);
    };

    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--t1)' }}>
            <h1>Brain Explorer</h1>
            {/* Existing content */}
            <TaskInput onTaskAdded={handleTaskAdded} />
            <div>
                <h2>Workers</h2>
                <button onClick={() => window.open('http://62.238.12.221:4000/brain', '_blank')}>
                    Ouvrir dashboard live
                </button>
            </div>
        </div>
    );
};

export default BrainExplorer;
```

```jsx
// src/components/TaskInput.jsx
import React, { useState } from 'react';

const TaskInput = ({ onTaskAdded }) => {
    const [taskDescription, setTaskDescription] = useState('');
    const suggestions = ['Redesign Dashboard', 'Fix bug', 'Ajoute feature', 'Audit sécurité'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskDescription) return;

        const response = await fetch(`${process.env.SERVER}/api/task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: taskDescription }),
        });

        if (response.ok) {
            onTaskAdded();
            setTaskDescription('');
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <form onSubmit={handleSubmit}>
                <textarea
                    rows="3"
                    placeholder="Décris la tâche pour AnDy..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    style={{
                        width: '100%',
                        backgroundColor: 'var(--bg2)',
                        color: 'var(--t1)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '10px',
                    }}
                />
                <div style={{ margin: '10px 0' }}>
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setTaskDescription(suggestion)}
                            style={{
                                backgroundColor: 'var(--bg3)',
                                color: 'var(--green)',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '5px 10px',
                                margin: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
                <button
                    type="submit"
                    style={{
                        backgroundColor: 'var(--green)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 15px',
                        cursor: 'pointer',
                    }}
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
};

export default TaskInput;