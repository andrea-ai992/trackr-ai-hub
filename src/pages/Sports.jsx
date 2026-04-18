```jsx
import { useState, useEffect } from 'react';
import { Tabs } from '../components/Tabs';
import { TeamCard } from '../components/TeamCard';

const TABS = [
  { id: 'psg', label: 'PSG', emoji: '⚽', color: '#004170' },
  { id: 'nba', label: 'NBA', emoji: '🏀', color: '#f59e0b' },
  { id: 'nfl', label: 'NFL', emoji: '🏈', color: '#f97316' },
  { id: 'ufc', label: 'UFC', emoji: '🥊', color: '#8b5cf6' },
];

const Sports = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [teamData, setTeamData] = useState({});

  useEffect(() => {
    const fetchTeamData = async () => {
      const team = TABS.find(tab => tab.id === activeTab);
      const data = await fetchTeam(team);
      setTeamData(data);
    };
    fetchTeamData();
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div style={{ position: 'relative' }}>
      <header style={{ position: 'sticky', top: 0, background: 'var(--bg)', padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      </header>
      <div style={{ padding: '20px' }}>
        {activeTab === 'psg' && (
          <TeamCard team={MY_TEAMS[0]} data={teamData} />
        )}
        {/* Ajouter d'autres composants pour les autres sports */}
      </div>
    </div>
  );
};

export default Sports;