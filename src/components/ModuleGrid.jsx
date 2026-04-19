// src/pages/More.jsx
import { Link } from 'react-router-dom';
import { LayoutDashboard, Settings, BarChart3, BookOpen, MessageSquare, Brain, Cpu, Grid3x3, Code2, Palette, FileText, Info } from 'lucide-react';

const More = () => {
  const generalModules = [
    { path: '/dashboard', title: 'Dashboard', icon: <LayoutDashboard size={28} /> },
    { path: '/settings', title: 'Settings', icon: <Settings size={28} /> },
    { path: '/markets', title: 'Markets', icon: <BarChart3 size={28} /> },
    { path: '/news', title: 'News', icon: <BookOpen size={28} /> },
    { path: '/andy', title: 'Andy', icon: <MessageSquare size={28} /> },
    { path: '/agents', title: 'Agents', icon: <Brain size={28} /> },
    { path: '/portfolio', title: 'Portfolio', icon: <Cpu size={28} /> },
    { path: '/patterns', title: 'Patterns', icon: <Grid3x3 size={28} /> },
  ];

  const aiToolsModules = [
    { path: '/brainexplorer', title: 'BrainExplorer', icon: <Brain size={28} /> },
    { path: '/chartanalysis', title: 'ChartAnalysis', icon: <Code2 size={28} /> },
    { path: '/businessplan', title: 'BusinessPlan', icon: <FileText size={28} /> },
    { path: '/realestate', title: 'RealEstate', icon: <Palette size={28} /> },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <h1>More</h1>
      </header>

      <section className="ai-tools-section">
        <h2 className="section-title">AI Tools</h2>
        <div className="module-grid">
          {aiToolsModules.map((module, index) => (
            <ModuleCard key={index} module={module} />
          ))}
        </div>
      </section>

      <section className="general-section">
        <h2 className="section-title">General</h2>
        <div className="module-grid">
          {generalModules.map((module, index) => (
            <ModuleCard key={index} module={module} />
          ))}
        </div>
      </section>

      <footer className="app-info">
        <div className="version">
          <span>Trackr AI Hub</span>
          <span>v1.0.0</span>
        </div>
        <div className="credits">
          <span>© 2024 Andrea Matlega</span>
          <Link to="/legal" className="legal-link">
            Legal
          </Link>
        </div>
      </footer>
    </div>
  );
};

const ModuleCard = ({ module }) => {
  return (
    <Link to={module.path} className="module-card">
      <div className="module-icon">{module.icon}</div>
      <div className="module-label">{module.title}</div>
    </Link>
  );
};

export default More;