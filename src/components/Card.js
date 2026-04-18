import React from 'react';
import { motion } from 'framer-motion';

// Card component with glassmorphism design
const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      className={`card ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        ...props.style
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;