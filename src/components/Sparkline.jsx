// src/components/Sparkline.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Sparkline = ({
  data = [],
  width = 100,
  height = 40,
  lineColor = 'var(--green)',
  areaColor = 'rgba(0, 255, 136, 0.15)',
  strokeWidth = 2,
  showArea = false,
  animate = true,
  className = '',
}) => {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const areaRef = useRef(null);

  // Calcul des points du sparkline
  const getPath = () => {
    if (data.length === 0) return '';
    if (data.length === 1) {
      return `M0,${height / 2} L${width},${height / 2}`;
    }

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / Math.max(...data) * height);
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  };

  // Animation du chemin
  useEffect(() => {
    if (!svgRef.current || !animate) return;

    const path = pathRef.current;
    const area = areaRef.current;

    if (path) {
      path.style.strokeDasharray = path.getTotalLength();
      path.style.strokeDashoffset = path.getTotalLength();
      path.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
      path.style.strokeDashoffset = '0';
    }

    if (area && showArea) {
      area.style.opacity = '0';
      area.style.transition = 'opacity 0.8s ease-in-out 0.2s';
      setTimeout(() => {
        area.style.opacity = '1';
      }, 10);
    }
  }, [data, animate, showArea]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`sparkline ${className}`}
      style={{
        display: 'block',
        overflow: 'visible',
      }}
    >
      {showArea && (
        <path
          ref={areaRef}
          d={`${getPath()} L${width},${height} L0,${height} Z`}
          fill={areaColor}
          opacity="0"
        />
      )}
      <path
        ref={pathRef}
        d={getPath()}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

Sparkline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  lineColor: PropTypes.string,
  areaColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  showArea: PropTypes.bool,
  animate: PropTypes.bool,
  className: PropTypes.string,
};

export default Sparkline;