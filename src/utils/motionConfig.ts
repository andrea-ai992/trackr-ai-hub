src/utils/motionConfig.ts

export const springConfigs = {
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 20,
    mass: 1,
  },
  snappy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 28,
    mass: 0.8,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
    mass: 0.9,
  },
  stiff: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
    mass: 1,
  },
  wobbly: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 12,
    mass: 1,
  },
  slow: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 18,
    mass: 1.2,
  },
};

export const easings = {
  easeOutQuart: [0.25, 1, 0.5, 1] as [number, number, number, number],
  easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeOutBack: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  easeInOutCubic: [0.65, 0, 0.35, 1] as [number, number, number, number],
  easeInOutQuart: [0.76, 0, 0.24, 1] as [number, number, number, number],
  easeInExpo: [0.7, 0, 0.84, 0] as [number, number, number, number],
  linear: [0, 0, 1, 1] as [number, number, number, number],
  anticipate: [0.36, -0.4, 0.64, 1.4] as [number, number, number, number],
};

export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  moderate: 0.45,
  slow: 0.6,
  xslow: 0.9,
  page: 0.3,
};

export const staggerPatterns = {
  list: (index: number, baseDelay = 0.05) => index * baseDelay,
  grid: (index: number, cols = 2, baseDelay = 0.06) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return (row + col) * baseDelay;
  },
  cascade: (index: number, baseDelay = 0.08) => index * baseDelay,
  wave: (index: number, baseDelay = 0.04) => Math.sin(index * 0.5) * baseDelay + index * baseDelay,
  random: (index: number) => Math.random() * 0.3 + index * 0.04,
  uniform: (_index: number, delay = 0.1) => delay,
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.easeOutExpo,
    },
  },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.easeOutExpo,
    },
  },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.easeOutExpo,
    },
  },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.easeOutExpo,
    },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOutQuart,
    },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.moderate,
      ease: easings.easeOutBack,
    },
  },
};

export const scaleInBouncy = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfigs.bouncy,
  },
};

export const slideInFromBottom = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: durations.normal,
      ease: easings.easeInExpo,
    },
  },
};

export const slideInFromTop = {
  hidden: { opacity: 0, y: '-100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    y: '-100%',
    transition: {
      duration: durations.normal,
      ease: easings.easeInExpo,
    },
  },
};

export const toastVariants = {
  hidden: { opacity: 0, x: 80, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springConfigs.snappy,
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.88,
    transition: {
      duration: durations.fast,
      ease: easings.easeInExpo,
    },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.page,
      ease: easings.easeOutQuart,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: durations.fast,
      ease: easings.easeInExpo,
    },
  },
};

export const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

export const containerStaggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const containerStaggerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

export const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOutQuart,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeInExpo,
    },
  },
};

export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    transition: springConfigs.gentle,
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
    transition: springConfigs.snappy,
  },
  tap: {
    scale: 0.97,
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
    transition: springConfigs.stiff,
  },
};

export const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.04,
    transition: springConfigs.snappy,
  },
  tap: {
    scale: 0.94,
    transition: springConfigs.stiff,
  },
};

export const chipVariants = {
  rest: { scale: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  hover: {
    scale: 1.06,
    backgroundColor: 'rgba(255,255,255,0.14)',
    transition: springConfigs.snappy,
  },
  tap: {
    scale: 0.94,
    transition: springConfigs.stiff,
  },
};

export const iconPulse = {
  rest: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOutCubic,
    },
  },
};

export const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes skeletonPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(80px) scale(0.92); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pageExit {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-8px); }
  }
`;

export const cssAnimations = {
  shimmer: {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.8s ease-in-out infinite',
  },
  skeletonPulse: {
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
  },
  fadeInUp: {
    animation: `fadeInUp ${durations.moderate}s ${easings.easeOutExpo.join(',')} both`,
  },
  pageEnter: {
    animation: `pageEnter ${durations.page}s cubic-bezier(0.25, 1, 0.5, 1) both`,
  },
};

export type SpringConfig = typeof springConfigs[keyof typeof springConfigs];
export type EasingConfig = typeof easings[keyof typeof easings];

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const defaultScrollRevealOptions: ScrollRevealOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px',
  triggerOnce: true,
};

export function createRipple(event: React.MouseEvent<HTMLElement>): void {
  const button = event.currentTarget;
  const existingRipple = button.querySelector('.ripple-element');
  if (existingRipple) existingRipple.remove();

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple-element';
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    top: ${y}px;
    left: ${x}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    transform: scale(0);
    animation: ripple 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    pointer-events: none;
    z-index: 10;
  `;

  const prevPosition = button.style.position;
  if (!prevPosition || prevPosition === 'static') {
    button.style.position = 'relative';
  }
  button.style.overflow = 'hidden';
  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
    if (!prevPosition || prevPosition === 'static') {
      button.style.position = prevPosition || '';
    }
  }, 700);
}

export function getStaggerDelay(
  index: number,
  pattern: keyof typeof staggerPatterns = 'list',
  ...args: number[]
): number {
  const fn = staggerPatterns[pattern] as (...a: number[]) => number;
  return fn(index, ...args);
}

export const motionConfig = {
  springs: springConfigs,
  easings,
  durations,
  stagger: staggerPatterns,
  variants: {
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    fadeIn,
    scaleIn,
    scaleInBouncy,
    slideInFromBottom,
    slideInFromTop,
    toast: toastVariants,
    page: pageTransition,
    skeleton: skeletonVariants,
    container: containerStagger,
    containerFast: containerStaggerFast,
    containerSlow: containerStaggerSlow,
  },
  interactions: {
    card: cardHover,
    button: buttonVariants,
    chip: chipVariants,
    iconPulse,
  },
  css: cssAnimations,
  keyframes: shimmerKeyframes,
  defaults: {
    scrollReveal: defaultScrollRevealOptions,
  },
  utils: {
    createRipple,
    getStaggerDelay,
  },
};

export default motionConfig;