import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import * as Lucide from 'lucide-react';

const BrainStatus = () => {
  const params = useParams();
  const [memory, setMemory] = useState([]);
  const [activity, setActivity] = useState(Array(24).fill(0));
  const [pipeline, setPipeline] = useState({});
  const [isNight, setIsNight] = useState(false);
  const [liveStage, setLiveStage] = useState('IDLE');
  const [liveLabel, setLiveLabel] = useState('En attente');

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
        const act = Array(24).fill(0);
        data.forEach(({ hour, count }) => {
          act[hour] = count;
        });
        setActivity(act);
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

    const interval = setInterval(() => {
      setLiveStage(prev => {
        switch(prev) {
          case 'IDLE': return 'FETCHING';
          case 'FETCHING': return 'PROCESSING';
          case 'PROCESSING': return 'ANALYZING';
          case 'ANALYZING': return 'GENERATING';
          case 'GENERATING': return 'IDLE';
          default: return 'IDLE';
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateLiveLabel = () => {
      switch(liveStage) {
        case 'IDLE': setLiveLabel('En attente'); break;
        case 'FETCHING': setLiveLabel('Récupération des données'); break;
        case 'PROCESSING': setLiveLabel('Traitement en cours'); break;
        case 'ANALYZING': setLiveLabel('Analyse des données'); break;
        case 'GENERATING': setLiveLabel('Génération des résultats'); break;
        default: setLiveLabel('En attente');
      }
    };
    updateLiveLabel();
  }, [liveStage]);

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
            <div className="pipeline-stage">
              <span className={`stage ${liveStage === 'IDLE' ? 'active' : ''}`}>IDLE</span>
              <span className={`label ${liveStage === 'IDLE' ? 'active' : ''}`}>{liveLabel}</span>
            </div>
            <div className="pipeline-stage">
              <span className={`stage ${liveStage === 'FETCHING' ? 'active' : ''}`}>FETCHING</span>
              <span className={`label ${liveStage === 'FETCHING' ? 'active' : ''}`}>Récupération des données</span>
            </div>
            <div className="pipeline-stage">
              <span className={`stage ${liveStage === 'PROCESSING' ? 'active' : ''}`}>PROCESSING</span>
              <span className={`label ${liveStage === 'PROCESSING' ? 'active' : ''}`}>Traitement en cours</span>
            </div>
            <div className="pipeline-stage">
              <span className={`stage ${liveStage === 'ANALYZING' ? 'active' : ''}`}>ANALYZING</span>
              <span className={`label ${liveStage === 'ANALYZING' ? 'active' : ''}`}>Analyse des données</span>
            </div>
            <div className="pipeline-stage">
              <span className={`stage ${liveStage === 'GENERATING' ? 'active' : ''}`}>GENERATING</span>
              <span className={`label ${liveStage === 'GENERATING' ? 'active' : ''}`}>Génération des résultats</span>
            </div>
          </div>
        </div>
        <div className="activity">
          <h2 className="title">Activité</h2>
          <div className="activity-container">
            <svg
              width="100%"
              height="100px"
              viewBox="0 0 120 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {hours.map((hour, i) => (
                <rect
                  key={hour}
                  x={i * 5}
                  y={100 - (activity[i] || 0) * 5}
                  width={5}
                  height={(activity[i] || 0) * 5}
                  fill="var(--neon)"
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
        </div>
        <div className="memory">
          <h2 className="title">Mémoire AnDy</h2>
          <div className="memory-cards">
            {memory.map((item, i) => (
              <div key={i} className="memory-card">
                <h3 className="type">{item.type}</h3>
                <p className="focus">{item.focus}</p>
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