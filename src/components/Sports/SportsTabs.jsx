import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SportsTabs = ({ leagues, activeLeague, onLeagueChange }) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const tabsContainerRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    const checkScrollability = () => {
      if (tabsContainerRef.current && tabsRef.current) {
        const container = tabsContainerRef.current;
        const tabs = tabsRef.current;
        const isOverflow = tabs.scrollWidth > container.clientWidth;
        setIsScrollable(isOverflow);

        if (isOverflow) {
          container.addEventListener('scroll', handleScroll);
          handleScroll();
        } else {
          container.removeEventListener('scroll', handleScroll);
        }
      }
    };

    const handleScroll = () => {
      if (tabsContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    checkScrollability();
    window.addEventListener('resize', checkScrollability);

    return () => {
      window.removeEventListener('resize', checkScrollability);
      if (tabsContainerRef.current) {
        tabsContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = tabsContainerRef.current.clientWidth * 0.8;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sports-tabs-container">
      {showLeftArrow && (
        <button
          className="scroll-arrow left-arrow"
          onClick={() => scrollTabs('left')}
          aria-label="Scroll tabs left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div className="tabs-wrapper">
        <div
          className="tabs-container"
          ref={tabsContainerRef}
        >
          <div className="tabs" ref={tabsRef}>
            {leagues.map((league) => (
              <button
                key={league.id}
                className={`tab ${activeLeague === league.id ? 'active' : ''}`}
                onClick={() => onLeagueChange(league.id)}
              >
                <span className="tab-icon">{league.icon}</span>
                <span className="tab-text">{league.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showRightArrow && (
        <button
          className="scroll-arrow right-arrow"
          onClick={() => scrollTabs('right')}
          aria-label="Scroll tabs right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default SportsTabs;
```

```css
.sports-tabs-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background-color: var(--bg2);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

.scroll-arrow {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  transition: color 0.2s ease;
}

.scroll-arrow:hover {
  color: var(--t1);
}

.scroll-arrow.left-arrow {
  margin-left: 0.5rem;
}

.scroll-arrow.right-arrow {
  margin-right: 0.5rem;
}

.tabs-wrapper {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.tabs-container {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tabs {
  display: flex;
  gap: 1rem;
  padding: 0 0.5rem;
  min-width: max-content;
}

.tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background-color: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab:hover {
  color: var(--t1);
}

.tab.active {
  color: var(--green);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--green);
}

.tab-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.tab-text {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}