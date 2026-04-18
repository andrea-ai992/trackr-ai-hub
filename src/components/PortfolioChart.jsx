// src/components/PortfolioChart.jsx
import React, { useEffect, useRef } from 'react';

const PortfolioChart = ({ data, width = 300, height = 120 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = svgRef.current;
    svg.innerHTML = '';

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const range = maxValue - minValue;
    const padding = range * 0.1;
    const yMin = minValue - padding;
    const yMax = maxValue + padding;

    const xScale = d => (d / (data.length - 1)) * chartWidth;
    const yScale = d => chartHeight - ((d - yMin) / (yMax - yMin)) * chartHeight;

    const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');

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

    svg.appendChild(gradient);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.appendChild(gradient);
    svg.appendChild(defs);

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
    svg.appendChild(chartGroup);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'url(#chartGradient)');
    path.setAttribute('stroke', '#00ff88');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('opacity', '0');
    chartGroup.appendChild(path);

    const animatePath = () => {
      path.style.transition = 'opacity 0.8s ease-out';
      path.style.opacity = '1';
    };

    setTimeout(animatePath, 100);

    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0, ${chartHeight})`);
    xAxis.setAttribute('stroke', '#555');
    xAxis.setAttribute('stroke-width', '0.5');

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yAxis.setAttribute('stroke', '#555');
    yAxis.setAttribute('stroke-width', '0.5');

    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const x = (i / xTicks) * chartWidth;
      const date = data[Math.round((i / xTicks) * (data.length - 1))].date;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', 20);
      text.setAttribute('fill', '#aaa');
      text.setAttribute('font-size', '8');
      text.setAttribute('font-family', 'JetBrains Mono, monospace');
      text.textContent = date;
      xAxis.appendChild(text);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', 0);
      line.setAttribute('x2', x);
      line.setAttribute('y2', chartHeight);
      line.setAttribute('stroke', 'rgba(0,255,136,0.08)');
      line.setAttribute('stroke-width', '0.5');
      xAxis.appendChild(line);
    }

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = (i / yTicks) * chartHeight;
      const value = yMin + ((yMax - yMin) * (1 - i / yTicks));
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', -5);
      text.setAttribute('y', y + 4);
      text.setAttribute('fill', '#aaa');
      text.setAttribute('font-size', '8');
      text.setAttribute('font-family', 'JetBrains Mono, monospace');
      text.setAttribute('text-anchor', 'end');
      text.textContent = value.toFixed(2);
      yAxis.appendChild(text);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 0);
      line.setAttribute('y1', y);
      line.setAttribute('x2', chartWidth);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(0,255,136,0.08)');
      line.setAttribute('stroke-width', '0.5');
      yAxis.appendChild(line);
    }

    chartGroup.appendChild(xAxis);
    chartGroup.appendChild(yAxis);
  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    />
  );
};

export default PortfolioChart;