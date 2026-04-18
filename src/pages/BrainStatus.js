Création du fichier src/pages/BrainStatus.js
```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Lucide from 'lucide-react';

const BrainStatus = () => {
  const params = useParams();
  const [memory, setMemory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pipeline, setPipeline] = useState({});

  useEffect(() => {
    const fetchMemory = async () => {
      const { data, error } = await supabase
        .from('memory')
        .select('type, focus, timestamp, summary')
        .order('timestamp', { ascending: false })
        .limit(5);
      if (error) {
        console.error(error);
      } else {
        setMemory(data);
      }
    };
    fetchMemory();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from('activity')
        .select('hour, count')
        .order('hour')
        .limit(24);
      if (error) {
        console.error(error);
      } else {
        setActivity(data);
      }
    };
    fetchActivity();
  }, []);

  useEffect(() => {
    const fetchPipeline = async () => {
      const { data, error } = await supabase
        .from('pipeline')
        .select('stage, label')
        .order('stage')
        .limit(1);
      if (error) {
        console.error(error);
      } else {
        setPipeline(data[0]);
      }
    };
    fetchPipeline();
  }, []);

  const hours = Array(24)
    .fill(0)
    .map((_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="container">
      <h1 className="title">État du cerveau</h1>
      <div className="tabs">
        <button className="tab active">Live</button>
        <button className="tab">Historique</button>
      </div>
      <div className="tab-content active">
        <div className="pipeline">
          <h2 className="title">Pipeline</h2>
          <div className="pipeline-stages">
            {pipeline && (
              <div className="pipeline-stage">
                <span className="stage">{pipeline.stage}</span>
                <span className="label">{pipeline.label}</span>
              </div>
            )}
          </div>
        </div>
        <div className="activity">
          <h2 className="title">Activité</h2>
          <svg
            width="100%"
            height="100px"
            viewBox="0 0 24 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {hours.map((hour, i) => (
              <rect
                key={hour}
                x={i * 5}
                y={100 - activity[i] * 5}
                width={5}
                height={activity[i] * 5}
                fill="#00ff88"
                rx={2}
              />
            ))}
            <rect
              x={22 * 5}
              y={100 - 5}
              width={5}
              height={5}
              fill="#ff0000"
              rx={2}
            />
          </svg>
          <div className="activity-hours">
            {hours.map((hour, i) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>
        <div className="memory">
          <h2 className="title">Mémoire AnDy</h2>
          <div className="memory-cards">
            {memory.map((item, i) => (
              <div key={i} className="memory-card">
                <h3 className="title">{item.type}</h3>
                <p className="description">{item.focus}</p>
                <p className="timestamp">{item.timestamp}</p>
                <p className="summary">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainStatus;
```

Création du fichier src/pages/BrainStatus.css
```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t2);
  cursor: pointer;
}

.tab.active {
  background-color: var(--green);
  color: var(--t1);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.pipeline {
  margin-bottom: 20px;
}

.pipeline-stages {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pipeline-stage {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t2);
}

.pipeline-stage span {
  margin-right: 10px;
}

.activity {
  margin-bottom: 20px;
}

.activity-hours {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.activity-hours span {
  margin-right: 10px;
}

.memory {
  margin-bottom: 20px;
}

.memory-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
}

.memory-card {
  width: calc(50% - 20px);
  margin: 10px;
  padding: 20px;
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t2);
}

.memory-card h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.memory-card p {
  margin-bottom: 10px;
}

.activity svg {
  width: 100%;
  height: 100px;
  margin-bottom: 20px;
}

.activity svg rect {
  transition: height 0.5s ease-in-out;
}

.activity svg rect:last-child {
  fill: #ff0000;
}

.activity-hours span {
  margin-right: 10px;
}
```

Création du fichier src/pages/BrainStatus.js (pour la version mobile)
```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Lucide from 'lucide-react';

const BrainStatusMobile = () => {
  const params = useParams();
  const [memory, setMemory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pipeline, setPipeline] = useState({});

  useEffect(() => {
    const fetchMemory = async () => {
      const { data, error } = await supabase
        .from('memory')
        .select('type, focus, timestamp, summary')
        .order('timestamp', { ascending: false })
        .limit(5);
      if (error) {
        console.error(error);
      } else {
        setMemory(data);
      }
    };
    fetchMemory();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from('activity')
        .select('hour, count')
        .order('hour')
        .limit(24);
      if (error) {
        console.error(error);
      } else {
        setActivity(data);
      }
    };
    fetchActivity();
  }, []);

  useEffect(() => {
    const fetchPipeline = async () => {
      const { data, error } = await supabase
        .from('pipeline')
        .select('stage, label')
        .order('stage')
        .limit(1);
      if (error) {
        console.error(error);
      } else {
        setPipeline(data[0]);
      }
    };
    fetchPipeline();
  }, []);

  const hours = Array(24)
    .fill(0)
    .map((_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="container">
      <h1 className="title">État du cerveau</h1>
      <div className="tabs">
        <button className="tab active">Live</button>
        <button className="tab">Historique</button>
      </div>
      <div className="tab-content active">
        <div className="pipeline">
          <h2 className="title">Pipeline</h2>
          <div className="pipeline-stages">
            {pipeline && (
              <div className="pipeline-stage">
                <span className="stage">{pipeline.stage}</span>
                <span className="label">{pipeline.label}</span>
              </div>
            )}
          </div>
        </div>
        <div className="activity">
          <h2 className="title">Activité</h2>
          <svg
            width="100%"
            height="100px"
            viewBox="0 0 24 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {hours.map((hour, i) => (
              <rect
                key={hour}
                x={i * 5}
                y={100 - activity[i] * 5}
                width={5}
                height={activity[i] * 5}
                fill="#00ff88"
                rx={2}
              />
            ))}
            <rect
              x={22 * 5}
              y={100 - 5}
              width={5}
              height={5}
              fill="#ff0000"
              rx={2}
            />
          </svg>
          <div className="activity-hours">
            {hours.map((hour, i) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>
        <div className="memory">
          <h2 className="title">Mémoire AnDy</h2>
          <div className="memory-cards">
            {memory.map((item, i) => (
              <div key={i} className="memory-card">
                <h3 className="title">{item.type}</h3>
                <p className="description">{item.focus}</p>
                <p className="timestamp">{item.timestamp}</p>
                <p className="summary">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainStatusMobile;
```

Création du fichier src/pages/BrainStatus.css (pour la version mobile)
```css
.container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t2);
  cursor: pointer;
}

.tab.active {
  background-color: var(--green);
  color: var(--t1);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.pipeline {
  margin-bottom: 20px;
}

.pipeline-stages {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pipeline-stage {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t2);
}

.pipeline-stage span {
  margin-right: 10px;
}

.activity {
  margin-bottom: 20px;
}

.activity-hours {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.activity-hours span {
  margin-right: 10px;
}

.memory {
  margin-bottom: 20px;
}

.memory-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
}

.memory-card {
  width: calc(50% - 20px);
  margin: 10px;
  padding: 20px;
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t2);
}

.memory-card h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.memory-card p {
  margin-bottom: 10px;
}

.activity svg {
  width: 100%;
  height: 100px;
  margin-bottom: 20px;
}

.activity svg rect {
  transition: height 0.5s ease-in-out;
}

.activity svg rect:last-child {
  fill: #ff0000;
}

.activity-hours span {
  margin-right: 10px;
}
```
Création du fichier src/pages/BrainStatus.js (pour la version desktop)
```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Lucide from 'lucide-react';

const BrainStatusDesktop = () => {
  const params = useParams();
  const [memory, setMemory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pipeline, setPipeline] = useState({});

  useEffect(() => {
    const fetchMemory = async () => {
      const { data, error } = await supabase
        .from('memory')
        .select('type, focus, timestamp, summary')
        .order('timestamp', { ascending: false })
        .limit(5);
      if (error) {
        console.error(error);
      } else {
        setMemory(data);
      }
    };
    fetchMemory();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from('activity')
        .select('hour, count')
        .order('hour')
        .limit(24);
      if (error) {
        console.error(error);
      } else {
        setActivity(data);
      }
    };
    fetchActivity();
  }, []);

  useEffect(() => {
    const fetchPipeline = async () => {
      const { data, error } = await supabase
        .from('pipeline')
        .select('stage, label')
        .order('stage')
        .limit(1);
      if (error) {
        console.error(error);
      } else {
        setPipeline(data[0]);
      }
    };
    fetchPipeline();
  }, []);

  const hours = Array(24)
    .fill(0)
    .map((_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="container">
      <h1 className="title">État du cerveau</h1>
      <div className="tabs">
        <button className="tab active">Live</button>
        <button className="tab">Historique</button>
      </div>
      <div className="tab-content active">
        <div className="pipeline">
          <h2 className="title">Pipeline</h2>
          <div className="pipeline-stages">
            {pipeline && (
              <div className="pipeline-stage">
                <span className="stage">{pipeline.stage}</span>
                <span className="label">{pipeline.label}</span>
              </div>
            )}
          </div>
        </div>
        <div className="activity">
          <h2 className="title">Activité</h2>
          <svg
            width="100%"
            height="100px"
            viewBox="0 0 24 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {hours.map((hour, i) => (
              <rect
                key={hour}
                x={i * 5}
                y={100 - activity[i] * 5}
                width={5}
                height={activity[i] * 5}
                fill="#00ff88"
                rx={2}
              />
            ))}
            <rect
              x={22 * 5}
              y={100 - 5}
              width={5}
              height={5}
              fill="#ff0000"
              rx={2}
            />
          </svg>
          <div className="activity-hours">
            {hours.map((hour, i) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>
        <div className="memory">
          <h2 className="title">Mémoire AnDy</h2>
          <div className="memory-cards">
            {memory.map((item, i) => (
              <div key={i} className="memory-card">
                <h3 className="title">{item.type}</h3>
                <p className="description">{item.focus}</p>
                <p className="timestamp">{item.timestamp}</p>
                <p className="summary">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainStatusDesktop;
```

Création du fichier src/pages/BrainStatus.css (pour la version desktop)
```css
.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(