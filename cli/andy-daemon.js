import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

async function generateNextTasks() {
  const taskStatusPath = resolve(ROOT, '.task-status.json');
  const errorLogPath = resolve(ROOT, '.error-log.json');
  const memoryPath = resolve(ROOT, 'ANDY_MEMORY.json');

  // Lire les 20 dernières tâches terminées
  const taskStatus = existsSync(taskStatusPath) ? JSON.parse(readFileSync(taskStatusPath, 'utf8')) : [];
  const completedTasks = taskStatus.slice(-20);

  // Lire les 5 dernières erreurs
  const errorLog = existsSync(errorLogPath) ? JSON.parse(readFileSync(errorLogPath, 'utf8')) : [];
  const recentErrors = errorLog.slice(-5);

  // Construire le contexte "état actuel de l'app"
  const recentChanges = getRecentFileChanges(); // Implémentez cette fonction pour récupérer les fichiers modifiés récemment
  const context = {
    completedTasks,
    recentErrors,
    recentChanges,
  };

  // Poser la question à Claude (Haiku)
  const prompt = `Quels sont les 3 problèmes UX les plus urgents à corriger dans cette app mobile basé sur ces modifications récentes ? ${JSON.stringify(context)}`;
  const response = await callClaude(prompt); // Implémentez cette fonction pour appeler Claude

  // Utiliser les réponses comme base des nouvelles tâches
  const newTasks = response.slice(0, 3).map(issue => `Fix UX issue: ${issue}`);

  // Sauvegarder le raisonnement dans ANDY_MEMORY.json
  const reflection = {
    timestamp: new Date().toISOString(),
    context,
    proposedTasks: newTasks,
  };
  writeFileSync(memoryPath, JSON.stringify(reflection, null, 2), 'utf8');

  return newTasks;
}