// src/components/PortfolioChart.jsx
import { useEffect, useRef } from 'react';

const PortfolioChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const padding = 40;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // Clear previous chart
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Create gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'chartGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#00ff88');
    stop1.setAttribute('stop-opacity', '0.3');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#00ff88');
    stop2.setAttribute('stop-opacity', '0');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Create axes
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', padding);
    xAxis.setAttribute('y1', height - padding);
    xAxis.setAttribute('x2', width - padding);
    xAxis.setAttribute('y2', height - padding);
    xAxis.setAttribute('stroke', 'var(--neon)');
    xAxis.setAttribute('stroke-width', '1');
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', padding);
    yAxis.setAttribute('y1', padding);
    yAxis.setAttribute('x2', padding);
    yAxis.setAttribute('y2', height - padding);
    yAxis.setAttribute('stroke', 'var(--neon)');
    yAxis.setAttribute('stroke-width', '1');
    svg.appendChild(yAxis);

    // Create path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'url(#chartGradient)');
    path.setAttribute('stroke', 'var(--neon)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('paint-order', 'stroke');

    // Generate curve points
    const points = data.map((point, i) => {
      const x = padding + (i / (data.length - 1)) * innerWidth;
      const y = height - padding - (point.value / Math.max(...data.map(d => d.value))) * innerHeight;
      return { x, y };
    });

    // Create smooth curve
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
    }
    d += ` L ${points[points.length - 1].x} ${height - padding}`;
    d += ` L ${points[0].x} ${height - padding} Z`;

    path.setAttribute('d', d);
    path.style.transition = 'stroke-dashoffset 800ms ease-in-out';
    path.style.strokeDasharray = '1000';
    path.style.strokeDashoffset = '1000';
    svg.appendChild(path);

    // Animate path
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        path.style.strokeDashoffset = '0';
      }
    });
    observer.observe(svg);

    // Create x-axis labels
    data.forEach((point, i) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding + (i / (data.length - 1)) * innerWidth);
      text.setAttribute('y', height - padding + 20);
      text.setAttribute('fill', 'var(--text-secondary)');
      text.setAttribute('font-family', 'JetBrains Mono, monospace');
      text.setAttribute('font-size', '10');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = point.date;
      svg.appendChild(text);
    });

    // Create y-axis labels
    const maxValue = Math.max(...data.map(d => d.value));
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue * (1 - i / 5)).toFixed(2);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding - 10);
      text.setAttribute('y', padding + (i / 5) * innerHeight);
      text.setAttribute('fill', 'var(--text-secondary)');
      text.setAttribute('font-family', 'JetBrains Mono, monospace');
      text.setAttribute('font-size', '10');
      text.setAttribute('text-anchor', 'end');
      text.textContent = value;
      svg.appendChild(text);
    }
  }, [data]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="200"
      viewBox="0 0 375 200"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    />
  );
};

export default PortfolioChart;