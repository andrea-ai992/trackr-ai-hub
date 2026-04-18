import { useState, useEffect } from 'react';

const NEWS_CATEGORIES = [
  { id: 'general', label: 'Général', icon: 'Newspaper' },
  { id: 'business', label: 'Business', icon: 'BriefcaseBusiness' },
  { id: 'technology', label: 'Technologie', icon: 'Cpu' },
  { id: 'science', label: 'Science', icon: 'Microscope' },
  { id: 'sports', label: 'Sports', icon: 'Trophy' },
  { id: 'entertainment', label: 'Divertissement', icon: 'Film' },
  { id: 'health', label: 'Santé', icon: 'HeartPulse' },
];

export function useNewsCategories(initialCategory = 'general') {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState(NEWS_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const switchCategory = (categoryId) => {
    if (categoryId !== activeCategory) {
      setActiveCategory(categoryId);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ici on pourrait ajouter une logique pour récupérer des catégories dynamiques
      // Mais pour l'instant on utilise les catégories statiques
      setCategories(NEWS_CATEGORIES);
    } catch (err) {
      setError('Échec du chargement des catégories');
      console.error('Erreur lors de la récupération des catégories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    activeCategory,
    categories,
    switchCategory,
    isLoading,
    error,
  };
}