import { useEffect, useRef } from 'react';

const PerformanceChart = ({ data, width = 375, height = 120 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = svgRef.current;
    const max = Math.max(...data.map(d => d.value), 1);
    const min = Math.min(...data.map(d => d.value), 0);
    const range = max - min;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 20) + 10;
      const y = height - 10 - ((d.value - min) / range) * (height - 20);
      return { x, y };
    });

    const pathData = points.map((p, i) =>
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(' ');

    const gradientId = `perf-gradient-${Math.random().toString(36).substr(2, 9)}`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00ff88" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#00ff88" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${pathData}" fill="none" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#00ff88" />`).join('')}
    `;
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />;
};

export default PerformanceChart;