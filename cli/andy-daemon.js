import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

async function generateNextTasks() {
  const taskStatusPath = resolve(ROOT, '.task-status.json');
  const errorLogPath = resolve(ROOT, '.error-log.json');
  const memoryPath = resolve(ROOT, 'ANDY_MEMORY.json');

  const taskStatus = existsSync(taskStatusPath) ? JSON.parse(readFileSync(taskStatusPath, 'utf8')) : [];
  const completedTasks = taskStatus.slice(-20);
  
  const errorLog = existsSync(errorLogPath) ? JSON.parse(readFileSync(errorLogPath, 'utf8')) : [];
  const recentErrors = errorLog.slice(-5);
  
  const recentChanges = getRecentFileChanges();
  const context = {
    completedTasks,
    recentErrors,
    recentChanges,
  };

  const prompt = `Quels sont les 3 problèmes UX les plus urgents à corriger dans cette app mobile basé sur ces modifications récentes ? ${JSON.stringify(context)}`;
  const response = await callClaude(prompt);

  const newTasks = await validateAndGenerateTasks(response.slice(0, 3).map(issue => `Fix UX issue: ${issue}`));

  const reflection = {
    timestamp: new Date().toISOString(),
    context,
    proposedTasks: newTasks,
  };
  writeFileSync(memoryPath, JSON.stringify(reflection, null, 2), 'utf8');

  return newTasks;
}

async function validateAndGenerateTasks(tasks) {
  let attempts = 0;
  let validatedTasks = [];
  
  while (attempts < 2) {
    const validationResult = validateTasks(tasks);
    
    if (validationResult.isValid) {
      validatedTasks = tasks;
      break;
    } else {
      console.error(`ERREUR PRÉCÉDENTE: ${validationResult.error}`);
      tasks = tasks.map(task => `Fix UX issue: ${task} (prompt plus strict)`);
      attempts++;
    }
  }

  if (validatedTasks.length === 0) {
    throw new Error('Validation échouée après 2 tentatives.');
  }

  return validatedTasks;
}

function validateTasks(tasks) {
  const jsxRegex = /<[^\/>]+>(?:(?!<\/).)*<\/[^>]+>/g;
  const todoRegex = /TODO|placeholder|lorem ipsum/i;
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;

  for (const task of tasks) {
    const matches = task.match(jsxRegex);
    const openTags = matches ? matches.reduce((count, match) => count + (match.match(/</g) || []).length, 0) : 0;
    const closeTags = matches ? matches.reduce((count, match) => count + (match.match(/>/g) || []).length, 0) : 0;

    if (openTags !== closeTags) {
      return { isValid: false, error: 'Balises JSX non fermées.' };
    }

    if (todoRegex.test(task)) {
      return { isValid: false, error: 'Contient des TODO, placeholder ou lorem ipsum.' };
    }

    let importMatch;
    while ((importMatch = importRegex.exec(task)) !== null) {
      const importPath = importMatch[1];
      if (!existsSync(resolve('node_modules', importPath)) && !existsSync(resolve('src', importPath))) {
        return { isValid: false, error: `Import non trouvé: ${importPath}` };
      }
    }
  }

  return { isValid: true };
}

function priorityScore(filename) {
  let score = 0;

  if (filename.startsWith('NUIT-')) score += 100;
  else if (filename.startsWith('v2-')) score += 80;
  else if (filename.startsWith('manual-')) score += 60;
  else if (filename.startsWith('auto-')) score += 40;

  if (filename.includes('redesign')) score += 20;
  if (filename.includes('fix')) score += 30;
  if (filename.includes('critical')) score += 50;
  if (filename.includes('perf')) score += 10;

  return score;
}

async function claimNextTask() {
  const tasks = await getPendingTasks();
  tasks.sort((a, b) => priorityScore(b) - priorityScore(a));

  if (tasks.length === 0) {
    console.log('Aucune tâche à traiter.');
    return;
  }

  const nextTask = tasks[0];
  const score = priorityScore(nextTask);
  console.log(`Tâche réclamée: ${nextTask} avec un score de priorité de ${score}`);

  // Logique pour traiter la tâche
  await processTask(nextTask);
}