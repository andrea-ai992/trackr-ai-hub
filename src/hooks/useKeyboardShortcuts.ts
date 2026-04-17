src/hooks/useKeyboardShortcuts.ts

import { useEffect, useCallback, useRef } from 'react';

export type ShortcutAction =
  | 'search'
  | 'sidebar'
  | 'theme'
  | 'help'
  | 'escape'
  | 'new'
  | 'save'
  | 'refresh';

export interface ShortcutDefinition {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: ShortcutAction;
  description: string;
  category: 'navigation' | 'ui' | 'data' | 'general';
  macLabel: string;
  winLabel: string;
}

export interface UseKeyboardShortcutsOptions {
  onSearch?: () => void;
  onSidebarToggle?: () => void;
  onThemeToggle?: () => void;
  onHelp?: () => void;
  onEscape?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onRefresh?: () => void;
  enabled?: boolean;
}

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  {
    key: 'k',
    metaKey: true,
    action: 'search',
    description: 'Recherche globale',
    category: 'navigation',
    macLabel: '⌘K',
    winLabel: 'Ctrl+K',
  },
  {
    key: 'b',
    metaKey: true,
    action: 'sidebar',
    description: 'Afficher/masquer la sidebar',
    category: 'ui',
    macLabel: '⌘B',
    winLabel: 'Ctrl+B',
  },
  {
    key: 't',
    metaKey: true,
    action: 'theme',
    description: 'Changer le thème',
    category: 'ui',
    macLabel: '⌘T',
    winLabel: 'Ctrl+T',
  },
  {
    key: '?',
    shiftKey: true,
    action: 'help',
    description: 'Aide & raccourcis clavier',
    category: 'general',
    macLabel: '?',
    winLabel: '?',
  },
  {
    key: 'Escape',
    action: 'escape',
    description: 'Fermer / Annuler',
    category: 'general',
    macLabel: 'Esc',
    winLabel: 'Esc',
  },
  {
    key: 'n',
    metaKey: true,
    action: 'new',
    description: 'Nouvel élément',
    category: 'data',
    macLabel: '⌘N',
    winLabel: 'Ctrl+N',
  },
  {
    key: 's',
    metaKey: true,
    action: 'save',
    description: 'Sauvegarder',
    category: 'data',
    macLabel: '⌘S',
    winLabel: 'Ctrl+S',
  },
  {
    key: 'r',
    metaKey: true,
    action: 'refresh',
    description: 'Actualiser les données',
    category: 'data',
    macLabel: '⌘R',
    winLabel: 'Ctrl+R',
  },
];

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const CONTENT_EDITABLE_ATTR = 'contenteditable';

function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  if (INPUT_TAGS.has(activeElement.tagName)) {
    const inputEl = activeElement as HTMLInputElement;
    if (inputEl.type === 'checkbox' || inputEl.type === 'radio' || inputEl.type === 'submit' || inputEl.type === 'button') {
      return false;
    }
    return true;
  }

  if (activeElement.getAttribute(CONTENT_EDITABLE_ATTR) === 'true') {
    return true;
  }

  return false;
}

export function detectPlatform(): 'mac' | 'windows' {
  if (typeof navigator === 'undefined') return 'windows';
  const platform = navigator.platform?.toLowerCase() || '';
  const userAgent = navigator.userAgent?.toLowerCase() || '';
  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  }
  return 'windows';
}

export function getShortcutLabel(shortcut: ShortcutDefinition, platform?: 'mac' | 'windows'): string {
  const p = platform || detectPlatform();
  return p === 'mac' ? shortcut.macLabel : shortcut.winLabel;
}

function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutDefinition, platform: 'mac' | 'windows'): boolean {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() || event.key === shortcut.key;

  const requiresMeta = shortcut.metaKey === true;
  const requiresShift = shortcut.shiftKey === true;
  const requiresAlt = shortcut.altKey === true;

  if (platform === 'mac') {
    if (requiresMeta && !event.metaKey) return false;
    if (!requiresMeta && event.metaKey) return false;
  } else {
    if (requiresMeta && !event.ctrlKey) return false;
    if (!requiresMeta && event.ctrlKey && shortcut.key !== 'Escape') return false;
  }

  if (requiresShift && !event.shiftKey) return false;
  if (requiresAlt && !event.altKey) return false;

  return keyMatch;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const {
    onSearch,
    onSidebarToggle,
    onThemeToggle,
    onHelp,
    onEscape,
    onNew,
    onSave,
    onRefresh,
    enabled = true,
  } = options;

  const platform = useRef<'mac' | 'windows'>(detectPlatform());

  const callbacksRef = useRef({
    onSearch,
    onSidebarToggle,
    onThemeToggle,
    onHelp,
    onEscape,
    onNew,
    onSave,
    onRefresh,
  });

  useEffect(() => {
    callbacksRef.current = {
      onSearch,
      onSidebarToggle,
      onThemeToggle,
      onHelp,
      onEscape,
      onNew,
      onSave,
      onRefresh,
    };
  }, [onSearch, onSidebarToggle, onThemeToggle, onHelp, onEscape, onNew, onSave, onRefresh]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const inputFocused = isInputFocused();
    const isEscapeKey = event.key === 'Escape';
    const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

    if (inputFocused && !isEscapeKey && !isCmdK) return;

    const p = platform.current;
    const callbacks = callbacksRef.current;

    for (const shortcut of SHORTCUT_DEFINITIONS) {
      if (matchesShortcut(event, shortcut, p)) {
        const needsPreventDefault =
          shortcut.action !== 'escape' &&
          shortcut.action !== 'help';

        if (needsPreventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }

        switch (shortcut.action) {
          case 'search':
            callbacks.onSearch?.();
            break;
          case 'sidebar':
            callbacks.onSidebarToggle?.();
            break;
          case 'theme':
            callbacks.onThemeToggle?.();
            break;
          case 'help':
            callbacks.onHelp?.();
            break;
          case 'escape':
            callbacks.onEscape?.();
            break;
          case 'new':
            callbacks.onNew?.();
            break;
          case 'save':
            callbacks.onSave?.();
            break;
          case 'refresh':
            callbacks.onRefresh?.();
            break;
        }
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleKeyDown, enabled]);

  return {
    platform: platform.current,
    shortcuts: SHORTCUT_DEFINITIONS,
  };
}

export default useKeyboardShortcuts;