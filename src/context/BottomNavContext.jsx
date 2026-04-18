// src/context/BottomNavContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const BottomNavContext = createContext();

export const BottomNavProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [newsBadge, setNewsBadge] = useState(false);

  const updateNewsBadge = (hasUnread) => {
    setNewsBadge(hasUnread);
  };

  return (
    <BottomNavContext.Provider value={{ activeTab, setActiveTab, newsBadge, updateNewsBadge }}>
      {children}
    </BottomNavContext.Provider>
  );
};

export const useBottomNav = () => {
  return useContext(BottomNavContext);
};