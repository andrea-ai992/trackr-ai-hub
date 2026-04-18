import { Clock, ExternalLink } from 'lucide-react';

const NewsCard = ({
  title,
  description,
  source,
  url,
  timestamp,
  isBreaking = false,
  isNew = false
}) => {
  const getSourceColor = (sourceName) => {
    const sources = {
      'BBC': 'linear-gradient(90deg, #ff0000, #ff8c00)',
      'CNN': 'linear-gradient(90deg, #0066cc, #00ccff)',
      'Reuters': 'linear-gradient(90deg, #ff6600, #ffcc00)',
      'Bloomberg': 'linear-gradient(90deg, #003366, #0099cc)',
      'TechCrunch': 'linear-gradient(90deg, #ff0000, #ff6600)',
      'The Verge': 'linear-gradient(90deg, #3366cc, #6699cc)',
      'default': 'linear-gradient(90deg, #00ff88, #00cc66)'
    };
    return sources[sourceName] || sources.default;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <article className="news-card w-full max-w-md mx-auto p-0 rounded-xl overflow-hidden shadow-lg bg--bg2 border border--border hover:shadow--green/10 transition-all duration-300">
      <div className="news-header relative">
        <div
          className="source-bar h-1 w-full"
          style={{ background: getSourceColor(source) }}
        ></div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text--t1 font-semibold text-lg truncate">{source}</h3>
            <div className="flex items-center gap-2">
              {isBreaking && (
                <span className="px-2 py-1 text-xs font-bold text--bg bg--green rounded-md">
                  BREAKING
                </span>
              )}
              {isNew && (
                <span className="px-2 py-1 text-xs font-bold text--bg bg--green rounded-md">
                  NEW
                </span>
              )}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text--t3 hover:text--green transition-colors"
                aria-label="Lire l'article"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
          <p className="text--t2 text-sm mb-3">{formatTime(timestamp)}</p>
        </div>
      </div>

      <div className="news-content px-4 pb-4">
        <h2 className="text--t1 font-bold text-xl mb-3 leading-tight">{title}</h2>
        <p className="text--t2 text-base leading-relaxed">{description}</p>
      </div>
    </article>
  );
};

export default NewsCard;