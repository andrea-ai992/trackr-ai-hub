Voici les fichiers modifiés et créés pour implémenter le système de priorité dynamique dans le daemon :

cli/priorityScore.js
```javascript
// cli/priorityScore.js
// Système de scoring pour la priorité des tâches

const PRIORITY_PREFIXES = {
  'NUIT-': 100,
  'v2-': 80,
  'manual-': 60,
  'auto-': 40
};

const KEYWORD_SCORES = {
  'critical': 50,
  'fix': 30,
  'redesign': 20,
  'perf': 10
};

export function priorityScore(filename) {
  let score = 0;

  // Score par préfixe
  for (const [prefix, prefixScore] of Object.entries(PRIORITY_PREFIXES)) {
    if (filename.startsWith(prefix)) {
      score += prefixScore;
      break;
    }
  }

  // Score par mots-clés
  for (const [keyword, keywordScore] of Object.entries(KEYWORD_SCORES)) {
    if (filename.includes(keyword)) {
      score += keywordScore;
    }
  }

  return score;
}

// Fonction utilitaire pour afficher le score
export function formatScore(score) {
  return score.toString().padStart(3, '0');
}
```

cli/andy-daemon.js
```javascript
// cli/andy-daemon.js
import { readdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { priorityScore, formatScore } from './priorityScore.js';

const DAEMON_DIR = join(process.cwd(), 'cli', 'daemon');
const CLAIMED_DIR = join(DAEMON_DIR, 'claimed');
const COMPLETED_DIR = join(DAEMON_DIR, 'completed');

async function ensureDirs() {
  await readdir(DAEMON_DIR).catch(() => {});
  await readdir(CLAIMED_DIR).catch(async () => {
    await readdir(DAEMON_DIR);
    await writeFile(join(DAEMON_DIR, '.gitkeep'), '');
  });
  await readdir(COMPLETED_DIR).catch(async () => {
    await readdir(DAEMON_DIR);
    await writeFile(join(DAEMON_DIR, '.gitkeep'), '');
  });
}

async function listTasks() {
  const files = await readdir(DAEMON_DIR);
  return files.filter(f => f !== '.gitkeep');
}

async function claimNextTask() {
  const tasks = await listTasks();
  if (tasks.length === 0) return null;

  // Calculer les scores pour chaque tâche
  const tasksWithScores = tasks.map(filename => ({
    filename,
    score: priorityScore(filename)
  }));

  // Trier par score décroissant
  tasksWithScores.sort((a, b) => b.score - a.score);

  // Sélectionner la tâche avec le score le plus élevé
  const highestPriority = tasksWithScores[0];

  // Log le score de la tâche claimée
  console.log(`[DAEMON] Claiming task: ${highestPriority.filename} (score: ${formatScore(highestPriority.score)})`);

  // Déplacer la tâche vers claimed
  await writeFile(join(CLAIMED_DIR, highestPriority.filename), '');
  await rm(join(DAEMON_DIR, highestPriority.filename));

  return highestPriority.filename;
}

async function completeTask(filename) {
  await writeFile(join(COMPLETED_DIR, filename), '');
  await rm(join(CLAIMED_DIR, filename));
}

async function runDaemon() {
  await ensureDirs();

  while (true) {
    const task = await claimNextTask();
    if (task) {
      console.log(`[DAEMON] Processing task: ${task}`);

      // Simuler le traitement
      await setTimeout(2000);

      await completeTask(task);
      console.log(`[DAEMON] Completed task: ${task}`);
    } else {
      await setTimeout(5000);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDaemon().catch(console.error);
}

export { claimNextTask, completeTask, runDaemon };