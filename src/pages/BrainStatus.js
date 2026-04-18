import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Lucide from 'lucide-react';

const BrainStatus = () => {
  const params = useParams();
  const [memory, setMemory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [isNight, setIsNight] = useState(false);

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

  useEffect(() => {
    const checkNightTime = () => {
      const hour = new Date().getHours();
      setIsNight(hour >= 22 || hour < 7);
    };
    checkNightTime();
    const interval = setInterval(checkNightTime, 60000);
    return () => clearInterval(interval);
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
                y={100 - (activity[i]?.count || 0) * 5}
                width={5}
                height={(activity[i]?.count || 0) * 5}
                fill="#00ff88"
                rx={2}
              />
            ))}
            {isNight && (
              <rect
                x={22 * 5}
                y={100 - 5}
                width={5}
                height={5}
                fill="#ff0000"
                rx={2}
                className="night-badge"
              />
            )}
          </svg>
          <div className="activity-hours">
            {hours.map((hour) => (
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