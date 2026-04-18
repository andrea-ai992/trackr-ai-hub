import { useState, useEffect, useRef } from 'react';

const useBottomNav = (initialTab = 'dashboard') => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabRefs = useRef({});
  const animationFrameRef = useRef(null);

  const handleTabChange = (tabName) => {
    if (activeTab === tabName || isAnimating) return;

    setIsAnimating(true);
    setActiveTab(tabName);
  };

  const registerTabRef = (tabName, ref) => {
    if (ref) {
      tabRefs.current[tabName] = ref;
    }
  };

  const animateTabTransition = () => {
    if (isAnimating && tabRefs.current[activeTab]) {
      const activeElement = tabRefs.current[activeTab];

      // Animation simple de scale
      activeElement.style.transform = 'scale(1.05)';
      activeElement.style.transition = 'transform 0.2s ease-out';

      // Réinitialisation après l'animation
      setTimeout(() => {
        activeElement.style.transform = 'scale(1)';
        setIsAnimating(false);
      }, 200);
    }
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateTabTransition);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeTab, isAnimating]);

  useEffect(() => {
    // Nettoyage des refs lors du démontage
    return () => {
      tabRefs.current = {};
    };
  }, []);

  return {
    activeTab,
    isAnimating,
    handleTabChange,
    registerTabRef,
  };
};

export default useBottomNav;