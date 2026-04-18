Voici l'implémentation complète de `src/pages/Portfolio/api.js` avec un système de timeout robuste utilisant `AbortSignal.timeout()` pour tous les appels fetch():

```javascript
const API_TIMEOUT = 10000; // 10 secondes par défaut

/**
 * Fonction utilitaire pour créer un fetch avec timeout
 * @param {string} url - URL à requêter
 * @param {RequestInit} [options] - Options de la requête
 * @returns {Promise<Response>} Réponse de la requête
 * @throws {Error} En cas d'échec de la requête ou de timeout
 */
async function fetchWithTimeout(url, options = {}) {
  const { signal, ...restOptions } = options;

  // Crée un nouveau signal d'abort combiné
  const controller = new AbortController();
  const timeoutSignal = AbortSignal.timeout(API_TIMEOUT);

  // Combine les signaux pour gérer timeout + signal manuel
  const combinedSignal = AbortSignal.any([
    signal,
    timeoutSignal
  ]);

  // Écoute les erreurs du signal combiné
  combinedSignal.addEventListener('abort', () => {
    if (controller.signal.aborted) return;
    controller.abort(combinedSignal.reason);
  });

  try {
    const response = await fetch(url, {
      ...restOptions,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${API_TIMEOUT}ms`);
    }
    throw error;
  }
}

/**
 * Récupère les données du portefeuille
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Données du portefeuille
 */
export async function fetchPortfolio(userId) {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_API_URL}/portfolio/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        }
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
}

/**
 * Met à jour les données du portefeuille
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Réponse de la mise à jour
 */
export async function updatePortfolio(userId, data) {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_API_URL}/portfolio/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
        body: JSON.stringify(data)
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error updating portfolio:', error);
    throw error;
  }
}

/**
 * Récupère les transactions du portefeuille
 * @param {string} userId - ID de l'utilisateur
 * @param {string} [assetType] - Type d'actif (optionnel)
 * @returns {Promise<Array>} Liste des transactions
 */
export async function fetchTransactions(userId, assetType = null) {
  try {
    const url = new URL(`${import.meta.env.VITE_API_URL}/portfolio/${userId}/transactions`);
    if (assetType) {
      url.searchParams.append('type', assetType);
    }

    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Ajoute une nouvelle transaction
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} transaction - Données de la transaction
 * @returns {Promise<Object>} Réponse de l'ajout
 */
export async function addTransaction(userId, transaction) {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_API_URL}/portfolio/${userId}/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
        body: JSON.stringify(transaction)
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

/**
 * Supprime une transaction
 * @param {string} userId - ID de l'utilisateur
 * @param {string} transactionId - ID de la transaction à supprimer
 * @returns {Promise<Object>} Réponse de la suppression
 */
export async function deleteTransaction(userId, transactionId) {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_API_URL}/portfolio/${userId}/transactions/${transactionId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        }
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

/**
 * Récupère les performances du portefeuille
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Données de performance
 */
export async function fetchPortfolioPerformance(userId) {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_API_URL}/portfolio/${userId}/performance`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        }
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    throw error;
  }
}

/**
 * Récupère les allocations d'actifs
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des allocations
 */
export async function fetchAssetAllocations(userId) {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_API_URL}/portfolio/${userId}/allocations`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        }
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error fetching asset allocations:', error);
    throw error;
  }
}