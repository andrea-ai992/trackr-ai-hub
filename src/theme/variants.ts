Je vais créer le système de thème complet pour Trackr. Voici tous les fichiers nécessaires :

---

FILE: src/theme/variants.ts

export type PageVariant = 'athletes' | 'markets' | 'portfolio' | 'notifications' | 'profile' | 'default';

export interface ThemeVariant {
  name: PageVariant;
  primary: string;
  secondary: string;
  accent: string;
  background: {
    from: string;
    via: string;
    to: string;
  };
  glass: {
    background: string;
    border: string;
    shadow: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gradient: string;
  animatedGradient: string;
  cardGlow: string;
  scrollbarColor: string;
  cssVars: Record<string, string>;
}

export const themeVariants: Record<PageVariant, ThemeVariant> = {
  athletes: {
    name: 'athletes',
    primary: '#00D4FF',
    secondary: '#0066FF',
    accent: '#FF6B35',
    background: {
      from: '#0A0E1A',
      via: '#0D1628',
      to: '#091422',
    },
    glass: {
      background: 'rgba(0, 212, 255, 0.05)',
      border: 'rgba(0, 212, 255, 0.15)',
      shadow: '0 8px 32px rgba(0, 212, 255, 0.1)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      accent: '#00D4FF',
    },
    gradient: 'linear-gradient(135deg, #0A0E1A 0%, #0D1628 50%, #091422 100%)',
    animatedGradient: 'linear-gradient(270deg, #00D4FF, #0066FF, #00D4FF)',
    cardGlow: '0 0 20px rgba(0, 212, 255, 0.15), 0 0 40px rgba(0, 102, 255, 0.08)',
    scrollbarColor: '#00D4FF',
    cssVars: {
      '--page-primary': '#00D4FF',
      '--page-secondary': '#0066FF',
      '--page-accent': '#FF6B35',
      '--page-bg-from': '#0A0E1A',
      '--page-bg-via': '#0D1628',
      '--page-bg-to': '#091422',
      '--page-glass-bg': 'rgba(0, 212, 255, 0.05)',
      '--page-glass-border': 'rgba(0, 212, 255, 0.15)',
      '--page-glow': 'rgba(0, 212, 255, 0.3)',
      '--page-glow-rgb': '0, 212, 255',
    },
  },
  markets: {
    name: 'markets',
    primary: '#00FF88',
    secondary: '#00CC6A',
    accent: '#FFD700',
    background: {
      from: '#050D0A',
      via: '#071510',
      to: '#040C08',
    },
    glass: {
      background: 'rgba(0, 255, 136, 0.04)',
      border: 'rgba(0, 255, 136, 0.12)',
      shadow: '0 8px 32px rgba(0, 255, 136, 0.08)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8BA898',
      accent: '#00FF88',
    },
    gradient: 'linear-gradient(135deg, #050D0A 0%, #071510 50%, #040C08 100%)',
    animatedGradient: 'linear-gradient(270deg, #00FF88, #00CC6A, #00FF88)',
    cardGlow: '0 0 20px rgba(0, 255, 136, 0.12), 0 0 40px rgba(0, 204, 106, 0.06)',
    scrollbarColor: '#00FF88',
    cssVars: {
      '--page-primary': '#00FF88',
      '--page-secondary': '#00CC6A',
      '--page-accent': '#FFD700',
      '--page-bg-from': '#050D0A',
      '--page-bg-via': '#071510',
      '--page-bg-to': '#040C08',
      '--page-glass-bg': 'rgba(0, 255, 136, 0.04)',
      '--page-glass-border': 'rgba(0, 255, 136, 0.12)',
      '--page-glow': 'rgba(0, 255, 136, 0.3)',
      '--page-glow-rgb': '0, 255, 136',
    },
  },
  portfolio: {
    name: 'portfolio',
    primary: '#8B5CF6',
    secondary: '#6D28D9',
    accent: '#EC4899',
    background: {
      from: '#0D0A1A',
      via: '#130E24',
      to: '#0A0814',
    },
    glass: {
      background: 'rgba(139, 92, 246, 0.06)',
      border: 'rgba(139, 92, 246, 0.18)',
      shadow: '0 8px 32px rgba(139, 92, 246, 0.12)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9D8FBF',
      accent: '#8B5CF6',
    },
    gradient: 'linear-gradient(135deg, #0D0A1A 0%, #130E24 50%, #0A0814 100%)',
    animatedGradient: 'linear-gradient(270deg, #8B5CF6, #EC4899, #8B5CF6)',
    cardGlow: '0 0 20px rgba(139, 92, 246, 0.15), 0 0 40px rgba(236, 72, 153, 0.08)',
    scrollbarColor: '#8B5CF6',
    cssVars: {
      '--page-primary': '#8B5CF6',
      '--page-secondary': '#6D28D9',
      '--page-accent': '#EC4899',
      '--page-bg-from': '#0D0A1A',
      '--page-bg-via': '#130E24',
      '--page-bg-to': '#0A0814',
      '--page-glass-bg': 'rgba(139, 92, 246, 0.06)',
      '--page-glass-border': 'rgba(139, 92, 246, 0.18)',
      '--page-glow': 'rgba(139, 92, 246, 0.3)',
      '--page-glow-rgb': '139, 92, 246',
    },
  },
  notifications: {
    name: 'notifications',
    primary: '#FF6B35',
    secondary: '#FF4500',
    accent: '#FFD700',
    background: {
      from: '#1A0A06',
      via: '#1E0D08',
      to: '#160805',
    },
    glass: {
      background: 'rgba(255, 107, 53, 0.05)',
      border: 'rgba(255, 107, 53, 0.15)',
      shadow: '0 8px 32px rgba(255, 107, 53, 0.1)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BF9580',
      accent: '#FF6B35',
    },
    gradient: 'linear-gradient(135deg, #1A0A06 0%, #1E0D08 50%, #160805 100%)',
    animatedGradient: 'linear-gradient(270deg, #FF6B35, #FF4500, #FF6B35)',
    cardGlow: '0 0 20px rgba(255, 107, 53, 0.15), 0 0 40px rgba(255, 69, 0, 0.08)',
    scrollbarColor: '#FF6B35',
    cssVars: {
      '--page-primary': '#FF6B35',
      '--page-secondary': '#FF4500',
      '--page-accent': '#FFD700',
      '--page-bg-from': '#1A0A06',
      '--page-bg-via': '#1E0D08',
      '--page-bg-to': '#160805',
      '--page-glass-bg': 'rgba(255, 107, 53, 0.05)',
      '--page-glass-border': 'rgba(255, 107, 53, 0.15)',
      '--page-glow': 'rgba(255, 107, 53, 0.3)',
      '--page-glow-rgb': '255, 107, 53',
    },
  },
  profile: {
    name: 'profile',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#EF4444',
    background: {
      from: '#1A1206',
      via: '#1E1508',
      to: '#160F05',
    },
    glass: {
      background: 'rgba(245, 158, 11, 0.05)',
      border: 'rgba(245, 158, 11, 0.15)',
      shadow: '0 8px 32px rgba(245, 158, 11, 0.1)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BFA870',
      accent: '#F59E0B',
    },
    gradient: 'linear-gradient(135deg, #1A1206 0%, #1E1508 50%, #160F05 100%)',
    animatedGradient: 'linear-gradient(270deg, #F59E0B, #D97706, #F59E0B)',
    cardGlow: '0 0 20px rgba(245, 158, 11, 0.15), 0 0 40px rgba(217, 119, 6, 0.08)',
    scrollbarColor: '#F59E0B',
    cssVars: {
      '--page-primary': '#F59E0B',
      '--page-secondary': '#D97706',
      '--page-accent': '#EF4444',
      '--page-bg-from': '#1A1206',
      '--page-bg-via': '#1E1508',
      '--page-bg-to': '#160F05',
      '--page-glass-bg': 'rgba(245, 158, 11, 0.05)',
      '--page-glass-border': 'rgba(245, 158, 11, 0.15)',
      '--page-glow': 'rgba(245, 158, 11, 0.3)',
      '--page-glow-rgb': '245, 158, 11',
    },
  },
  default: {
    name: 'default',
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    accent: '#06B6D4',
    background: {
      from: '#080C14',
      via: '#0C1220',
      to: '#060A10',
    },
    glass: {
      background: 'rgba(59, 130, 246, 0.05)',
      border: 'rgba(59, 130, 246, 0.15)',
      shadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      accent: '#3B82F6',
    },
    gradient: 'linear-gradient(135deg, #080C14 0%, #0C1220 50%, #060A10 100%)',
    animatedGradient: 'linear-gradient(270deg, #3B82F6, #06B6D4, #3B82F6)',
    cardGlow: '0 0 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(6, 182, 212, 0.08)',
    scrollbarColor: '#3B82F6',
    cssVars: {
      '--page-primary': '#3B82F6',
      '--page-secondary': '#1D4ED8',
      '--page-accent': '#06B6D4',
      '--page-bg-from': '#080C14',
      '--page-bg-via': '#0C1220',
      '--page-bg-to': '#060A10',
      '--page-glass-bg': 'rgba(59, 130, 246, 0.05)',
      '--page-glass-border': 'rgba(59, 130, 246, 0.15)',
      '--page-glow': 'rgba(59, 130, 246, 0.3)',
      '--page-glow-rgb': '59, 130, 246',
    },
  },
};

export const getVariantByPath = (pathname: string): PageVariant => {
  if (pathname.includes('/athletes')) return 'athletes';
  if (pathname.includes('/markets')) return 'markets';
  if (pathname.includes('/portfolio')) return 'portfolio';
  if (pathname.includes('/notifications')) return 'notifications';
  if (pathname.includes('/profile')) return 'profile';
  return 'default';
};

export const applyThemeVariant = (variant: PageVariant): void => {
  const theme = themeVariants[variant];
  const root = document.documentElement;
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.setAttribute('data-theme', variant);
};

export default themeVariants;

---

FILE: src/theme/index.ts

export { default as themeVariants, getVariantByPath, applyThemeVariant } from './variants';
export type { PageVariant, ThemeVariant } from './variants';

---

FILE: src/hooks/useThemeVariant.ts

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { type PageVariant, getVariantByPath, applyThemeVariant, themeVariants } from '../theme/variants';

export const useThemeVariant = () => {
  const location = useLocation();
  const [currentVariant, setCurrentVariant] = useState<PageVariant>('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const newVariant = getVariantByPath(location.pathname);
    if (newVariant !== currentVariant) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentVariant(newVariant);
        applyThemeVariant(newVariant);
        setIsTransitioning(false);
      }, 150);
    }
  }, [location.pathname, currentVariant]);

  useEffect(() => {
    applyThemeVariant(currentVariant);
  }, [currentVariant]);

  return {
    variant: currentVariant,
    theme: themeVariants[currentVariant],
    isTransitioning,
  };
};

export default useThemeVariant;

---

FILE: src/hooks/useScrollAnimations.ts

import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
}

export const useIntersectionObserver = (options: ScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;
  const refs = useRef<Map<string, Element>>(new Map());
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-animate-id');
          if (id) {
            if (entry.isIntersecting) {
              setVisibleElements((prev) => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    refs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const registerRef = useCallback((id: string, element: Element | null) => {
    if (element) {
      element.setAttribute('data-animate-id', id);
      refs.current.set(id, element);
    } else {
      refs.current.delete(id);
    }
  }, []);

  return { visibleElements, registerRef };
};

export const useParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        const rate = scrolled * speed;
        setOffset(rate);
      }
    };

    const rafScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', rafScroll, { passive: true });
    return () => window.removeEventListener('scroll', rafScroll);
  }, [speed]);

  return { ref, offset };
};

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentProgress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};

export const useStaggeredReveal = (itemCount: number, staggerDelay: number = 100) => {
  const [revealedItems, setRevealedItems] = useState<boolean[]>(new Array(itemCount).fill(false));
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            for (let i = 0; i < itemCount; i++) {
              setTimeout(() => {
                setRevealedItems((prev) => {
                  const next = [...prev];
                  next[i] = true;
                  return next;
                });
              }, i * staggerDelay);
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();