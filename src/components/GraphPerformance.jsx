**src/components/GraphPerformance.jsx**
```jsx
import React, { useEffect, useRef } from 'react';

const GraphPerformance = () => {
  const svgRef = useRef(null);
  const data = [
    { date: '2022-01-01', value: 10000 },
    { date: '2022-01-02', value: 10500 },
    { date: '2022-01-03', value: 11000 },
    { date: '2022-01-04', value: 11500 },
    { date: '2022-01-05', value: 12000 },
    { date: '2022-01-06', value: 12500 },
    { date: '2022-01-07', value: 13000 },
    { date: '2022-01-08', value: 13500 },
    { date: '2022-01-09', value: 14000 },
    { date: '2022-01-10', value: 14500 },
    { date: '2022-01-11', value: 15000 },
    { date: '2022-01-12', value: 15500 },
    { date: '2022-01-13', value: 16000 },
    { date: '2022-01-14', value: 16500 },
    { date: '2022-01-15', value: 17000 },
    { date: '2022-01-16', value: 17500 },
    { date: '2022-01-17', value: 18000 },
    { date: '2022-01-18', value: 18500 },
    { date: '2022-01-19', value: 19000 },
    { date: '2022-01-20', value: 19500 },
    { date: '2022-01-21', value: 20000 },
    { date: '2022-01-22', value: 20500 },
    { date: '2022-01-23', value: 21000 },
    { date: '2022-01-24', value: 21500 },
    { date: '2022-01-25', value: 22000 },
    { date: '2022-01-26', value: 22500 },
    { date: '2022-01-27', value: 23000 },
    { date: '2022-01-28', value: 23500 },
    { date: '2022-01-29', value: 24000 },
    { date: '2022-01-30', value: 24500 },
  ];

  useEffect(() => {
    const svg = svgRef.current;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0]);

    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value));

    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 1)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('spreadMethod', 'pad');

    gradient.append('stop')
      .attr('offset', 0)
      .attr('stop-color', '#00ff88')
      .attr('stop-opacity', 1);

    gradient.append('stop')
      .attr('offset', 1)
      .attr('stop-color', '#00ff88')
      .attr('stop-opacity', 0.5);

    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'url(#gradient)')
      .attr('stroke', '#00ff88')
      .attr('stroke-width', 2)
      .attr('d', line);

    const animate = () => {
      path.transition()
        .duration(2000)
        .attrTween('d', () => {
          const interpolate = d3.interpolate(data, data.slice(1));
          return (t) => line(interpolate(t));
        });
    };

    animate();

    return () => {
      svg.selectAll('*').remove();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      width={500}
      height={300}
      style={{
        backgroundColor: '#080808',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: 20,
        fontFamily: 'Inter',
      }}
    >
      <g transform={`translate(${20}, ${20})`}>
        <rect width={width} height={height} rx={10} fill={'#111'} />
        <g transform={`translate(${20}, ${20})`}>
          <text x={0} y={0} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
            Date
          </text>
          <text x={width / 2} y={0} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
            Valeur
          </text>
        </g>
        <path d={'M0,0'} />
      </g>
    </svg>
  );
};

export default GraphPerformance;
```

**src/pages/Portfolio.jsx**
```jsx
import React from 'react';
import GraphPerformance from '../components/GraphPerformance';

const Portfolio = () => {
  return (
    <div style={{
      backgroundColor: '#080808',
      padding: 20,
      fontFamily: 'Inter',
    }}>
      <GraphPerformance />
      <div style={{
        backgroundColor: '#111',
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
        fontFamily: 'Inter',
      }}>
        <h2 style={{ color: '#f0f0f0', fontSize: 18, marginBottom: 10 }}>
          Allocation
        </h2>
        <svg width={200} height={200} style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: 20,
          fontFamily: 'Inter',
        }}>
          <g transform={`translate(${100}, ${100})`}>
            <g transform={`translate(${0}, ${0})`}>
              <text x={0} y={0} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                Stocks
              </text>
              <text x={0} y={-20} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                30%
              </text>
            </g>
            <g transform={`translate(${0}, ${-50})`}>
              <text x={0} y={0} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                Crypto
              </text>
              <text x={0} y={-20} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                20%
              </text>
            </g>
            <g transform={`translate(${0}, ${-100})`}>
              <text x={0} y={0} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                Cash
              </text>
              <text x={0} y={-20} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                40%
              </text>
            </g>
            <g transform={`translate(${0}, ${-150})`}>
              <text x={0} y={0} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                Autres
              </text>
              <text x={0} y={-20} textAnchor={'middle'} fill={'#f0f0f0'} fontSize={14}>
                10%
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Portfolio;