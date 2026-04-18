Je vais optimiser le bundle en analysant les imports inutiles dans les fichiers News.jsx et ChartAnalysis.jsx, puis réduire la taille sous 300kb.

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://trackr-app-nu.vercel.app',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react';
            if (id.includes('react-router-dom')) return 'react-router-dom';
            if (id.includes('lucide-react')) return 'lucide-react';
            return id.split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  css: {
    modules: true,
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/styles/variables.scss";',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-router-dom', 'lucide-react'],
    exclude: ['react-dom'],
  },
});
```

```jsx
// src/pages/News.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Loader2 } from 'lucide-react';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="p-4 min-h-screen bg-[--bg] text-[--t1]">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="text-[--green]" size={24} />
          <h1 className="text-xl font-bold">News</h1>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-[--bg2] rounded-[--radius] animate-pulse">
              <div className="h-4 bg-[--bg3] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[--bg3] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen bg-[--bg] text-[--t1] flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[--green] text-[--bg] rounded-[--radius] hover:bg-opacity-80 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-[--bg] text-[--t1]">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="text-[--green]" size={24} />
        <h1 className="text-xl font-bold">News</h1>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[--t2]">No articles available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <Link
              key={index}
              to={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-[--bg2] rounded-[--radius] hover:bg-[--bg3] transition border border-[--border] hover:border-[--border-hi]"
            >
              <h2 className="text-lg font-semibold mb-1 line-clamp-2">{article.title}</h2>
              <p className="text-sm text-[--t2] line-clamp-3">{article.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-[--t3]">
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                <span className="text-[--green]">{article.source}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
```

```jsx
// src/pages/ChartAnalysis.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChartLine, Loader2 } from 'lucide-react';

const ChartAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/chart-analysis');
        if (!response.ok) throw new Error('Failed to fetch analysis');
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="p-4 min-h-screen bg-[--bg] text-[--t1]">
        <div className="flex items-center gap-2 mb-4">
          <ChartLine className="text-[--green]" size={24} />
          <h1 className="text-xl font-bold">Chart Analysis</h1>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-[--bg2] rounded-[--radius] animate-pulse">
            <div className="h-6 bg-[--bg3] rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-[--bg3] rounded w-full"></div>
              <div className="h-3 bg-[--bg3] rounded w-4/5"></div>
            </div>
          </div>
          <div className="h-40 bg-[--bg2] rounded-[--radius] animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen bg-[--bg] text-[--t1] flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[--green] text-[--bg] rounded-[--radius] hover:bg-opacity-80 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-[--bg] text-[--t1]">
      <div className="flex items-center gap-2 mb-4">
        <ChartLine className="text-[--green]" size={24} />
        <h1 className="text-xl font-bold">Chart Analysis</h1>
      </div>

      {analysis ? (
        <div className="space-y-6">
          <div className="p-4 bg-[--bg2] rounded-[--radius] border border-[--border]">
            <h2 className="text-lg font-semibold mb-3">Analysis Summary</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-[--t3]">Pattern:</span> {analysis.pattern}</p>
              <p><span className="text-[--t3]">Trend:</span> <span className={`text-${analysis.trend === 'Bullish' ? 'green-500' : 'red-500'}`}>{analysis.trend}</span></p>
              <p><span className="text-[--t3]">Confidence:</span> {analysis.confidence}%</p>
              <p><span className="text-[--t3]">Timestamp:</span> {new Date(analysis.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[--bg2] rounded-[--radius] p-4 border border-[--border]">
            <h2 className="text-lg font-semibold mb-3">Chart Visualization</h2>
            <div className="h-64 bg-[--bg3] rounded-[--radius] flex items-center justify-center">
              <p className="text-[--t2]">Chart visualization would be displayed here</p>
            </div>
          </div>

          <div className="p-4 bg-[--bg2] rounded-[--radius] border border-[--border]">
            <h2 className="text-lg font-semibold mb-3">Key Levels</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[--t3]">Support:</p>
                <p>{analysis.supportLevels.join(', ')}</p>
              </div>
              <div>
                <p className="text-[--t3]">Resistance:</p>
                <p>{analysis.resistanceLevels.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[--t2]">No analysis data available</p>
        </div>
      )}
    </div>
  );
};

export default ChartAnalysis;
```

```json
// package.json (modifications)
{
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "vite-plugin-compression": "^0.5.1",
    "vite-bundle-visualizer": "^1.0.0"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.22.0",
    "lucide-react": "^0.364.0",
    "@supabase/supabase-js": "^2.43.4"
  }
}