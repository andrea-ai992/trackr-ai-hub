// src/components/PortfolioChart.jsx
import React, { useEffect, useRef } from 'react';

const PortfolioChart = ({ data, width = 375, height = 120 }) => {
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
    const padding = range * 0.05;
    const yMin = minValue - padding;
    const yMax = maxValue + padding;

    const xScale = (i) => (i / (data.length - 1)) * chartWidth;
    const yScale = (value) => chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;

    const pathData = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');

    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

    const svgNS = 'http://www.w3.org/2000/svg';
    const chart = document.createElementNS(svgNS, 'svg');
    chart.setAttribute('width', width);
    chart.setAttribute('height', height);
    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chart.setAttribute('fill', 'none');

    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#00ff88');
    stop1.setAttribute('stop-opacity', '0.3');

    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#00ff88');
    stop2.setAttribute('stop-opacity', '0');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    chart.appendChild(defs);

    const axesGroup = document.createElementNS(svgNS, 'g');
    axesGroup.setAttribute('stroke', '#00ff88');
    axesGroup.setAttribute('stroke-width', '1');

    const xAxis = document.createElementNS(svgNS, 'line');
    xAxis.setAttribute('x1', margin.left);
    xAxis.setAttribute('y1', height - margin.bottom);
    xAxis.setAttribute('x2', width - margin.right);
    xAxis.setAttribute('y2', height - margin.bottom);
    axesGroup.appendChild(xAxis);

    const yAxis = document.createElementNS(svgNS, 'line');
    yAxis.setAttribute('x1', margin.left);
    yAxis.setAttribute('y1', margin.top);
    yAxis.setAttribute('x2', margin.left);
    yAxis.setAttribute('y2', height - margin.bottom);
    axesGroup.appendChild(yAxis);

    chart.appendChild(axesGroup);

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', `M ${margin.left} ${yScale(data[0].value)} L ${pathData}`);
    path.setAttribute('stroke', '#00ff88');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-dasharray', '1000');
    path.setAttribute('stroke-dashoffset', '1000');
    path.style.transition = 'stroke-dashoffset 800ms ease-in-out';

    setTimeout(() => {
      path.setAttribute('stroke-dashoffset', '0');
    }, 100);

    const gradientPath = document.createElementNS(svgNS, 'path');
    gradientPath.setAttribute('d', `M ${margin.left} ${yScale(data[0].value)} L ${pathData} L ${width - margin.right} ${height - margin.bottom} L ${margin.left} ${height - margin.bottom} Z`);
    gradientPath.setAttribute('fill', `url(#${gradientId})`);
    gradientPath.setAttribute('opacity', '0.8');

    chart.appendChild(gradientPath);
    chart.appendChild(path);

    const labelsGroup = document.createElementNS(svgNS, 'g');
    labelsGroup.setAttribute('font-family', 'JetBrains Mono, monospace');
    labelsGroup.setAttribute('font-size', '10');
    labelsGroup.setAttribute('fill', '#aaa');

    data.forEach((d, i) => {
      const x = margin.left + xScale(i);
      const y = height - margin.bottom + 12;

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = d.date;
      labelsGroup.appendChild(text);
    });

    const yValues = [yMin, yMax];
    yValues.forEach((value, i) => {
      const y = margin.top + (i === 0 ? chartHeight : 0);
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', margin.left - 5);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '10');
      text.textContent = value.toFixed(2);
      labelsGroup.appendChild(text);
    });

    chart.appendChild(labelsGroup);
    svg.appendChild(chart);
  }, [data, width, height]);

  return <div ref={svgRef} style={{ width, height }} />;
};

export default PortfolioChart;