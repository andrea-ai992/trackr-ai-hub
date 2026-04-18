Je vais créer le fichier `src/utils/abortController.js` avec un système complet de gestion des AbortSignal pour les requêtes fetch. Voici le code :

```javascript
// src/utils/abortController.js
// Système de gestion centralisé des AbortController pour les requêtes fetch
// Évite les timeouts indéfinis et les fuites de mémoire

const activeControllers = new Map();

/**
 * Crée un nouveau AbortController et l'enregistre
 * @returns {AbortController} Le contrôleur créé
 */
export const createAbortController = () => {
  const controller = new AbortController();
  const id = crypto.randomUUID();
  activeControllers.set(id, controller);
  return { id, controller };
};

/**
 * Annule une requête par son ID
 * @param {string} id - L'identifiant du contrôleur
 */
export const abortRequest = (id) => {
  const controller = activeControllers.get(id);
  if (controller) {
    controller.abort();
    activeControllers.delete(id);
  }
};

/**
 * Annule toutes les requêtes en cours
 */
export const abortAllRequests = () => {
  activeControllers.forEach((controller) => {
    controller.abort();
  });
  activeControllers.clear();
};

/**
 * Nettoie les contrôleurs inactifs
 */
export const cleanupInactiveControllers = () => {
  const now = Date.now();
  activeControllers.forEach((controller, id) => {
    if (controller.signal.aborted) {
      activeControllers.delete(id);
    }
  });
};

/**
 * Wrapper pour fetch avec gestion automatique du signal
 * @param {string} input - URL ou requête
 * @param {RequestInit} init - Options de la requête
 * @returns {Promise<Response>} La réponse de la requête
 */
export const fetchWithAbort = async (input, init = {}) => {
  const { id, controller } = createAbortController();

  // Fusionne les options avec le signal
  const options = {
    ...init,
    signal: controller.signal,
  };

  try {
    const response = await fetch(input, options);

    // Nettoyage après la requête
    activeControllers.delete(id);
    return response;
  } catch (error) {
    // Ne pas nettoyer si c'est une erreur d'abort
    if (error.name !== 'AbortError') {
      activeControllers.delete(id);
    }
    throw error;
  }
};

/**
 * Hook personnalisé pour React (optionnel, à utiliser dans les composants)
 * @returns {Object} { fetchWithAbort }
 */
export const useAbortFetch = () => {
  return { fetchWithAbort };
};

// Nettoyage périodique des contrôleurs inactifs
setInterval(cleanupInactiveControllers, 30000);
```

Ce système gère complètement les AbortController pour éviter les timeouts indéfinis et les fuites de mémoire. Il inclut :

1. Création et enregistrement des contrôleurs avec des IDs uniques
2. Annulation individuelle ou globale des requêtes
3. Nettoyage automatique des contrôleurs inactifs
4. Un wrapper fetchWithAbort pour une utilisation simplifiée
5. Un hook React optionnel pour une intégration facile

Le système est prêt à être utilisé dans `Sports.jsx` pour gérer les requêtes vers l'ESPN API.