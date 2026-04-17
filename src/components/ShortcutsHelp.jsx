Je vais créer le système de shortcuts clavier complet. Voici les fichiers :

**Fichier 1: src/hooks/useKeyboardShortcuts.ts**

import { useEffect, useCallback, useRef } from 'react';

interface ShortcutHandler {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutHandler[];
  enabled?: boolean;
}

const isInputFocused = (): boolean => {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  const tagName = activeElement.tagName.toLowerCase();
  const isInputType = ['input', 'textarea', 'select'].includes(tagName);
  const isContentEditable = (activeElement as HTMLElement).contentEditable === 'true';
  const isCodeMirror = activeElement.classList.contains('CodeMirror') || 
                       activeElement.closest('.CodeMirror') !== null;
  
  return isInputType || isContentEditable || isCodeMirror;
};

export const detectPlatform = (): 'mac' | 'windows' | 'linux' => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (platform.includes('mac') || userAgent.includes('macintosh')) {
    return 'mac';
  }
  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }
  return 'linux';
};

export const getModifierSymbol = (platform?: 'mac' | 'windows' | 'linux'): string => {
  const p = platform || detectPlatform();
  return p === 'mac' ? '⌘' : 'Ctrl';
};

export const getAltSymbol = (platform?: 'mac' | 'windows' | 'linux'): string => {
  const p = platform || detectPlatform();
  return p === 'mac' ? '⌥' : 'Alt';
};

export const getShiftSymbol = (): string => '⇧';

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcutsRef.current) {
      const metaMatch = shortcut.metaKey !== undefined 
        ? shortcut.metaKey === (e.metaKey || e.ctrlKey)
        : true;
      
      const ctrlMatch = shortcut.ctrlKey !== undefined
        ? shortcut.ctrlKey === e.ctrlKey
        : true;
      
      const shiftMatch = shortcut.shiftKey !== undefined
        ? shortcut.shiftKey === e.shiftKey
        : true;
      
      const altMatch = shortcut.altKey !== undefined
        ? shortcut.altKey === e.altKey
        : true;

      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && metaMatch && shiftMatch && altMatch) {
        const inputFocused = isInputFocused();
        
        if (inputFocused && shortcut.key.toLowerCase() !== 'escape') {
          continue;
        }

        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        
        shortcut.handler(e);
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;


**Fichier 2: src/components/ShortcutsHelp.jsx**

import { useEffect, useRef, useState } from 'react';
import { detectPlatform, getModifierSymbol, getAltSymbol, getShiftSymbol } from '../hooks/useKeyboardShortcuts';

const platform = detectPlatform();
const MOD = getModifierSymbol(platform);
const ALT = getAltSymbol(platform);
const SHIFT = getShiftSymbol();

const KeyBadge = ({ children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '28px',
      height: '28px',
      padding: '0 8px',
      borderRadius: '6px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      fontSize: '12px',
      fontWeight: '600',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
      color: 'rgba(255,255,255,0.9)',
      letterSpacing: '0.02em',
      userSelect: 'none',
    }}
  >
    {children}
  </span>
);

const KeyCombo = ({ keys }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    {keys.map((key, i) => (
      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <KeyBadge>{key}</KeyBadge>
        {i < keys.length - 1 && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '400' }}>+</span>
        )}
      </span>
    ))}
  </div>
);

const ShortcutRow = ({ icon, label, keys, category }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: '10px',
      transition: 'background 0.15s ease',
      gap: '16px',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: '18px', flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' }}>
        {icon}
      </span>
      <span style={{
        fontSize: '13px',
        fontWeight: '500',
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {label}
      </span>
    </div>
    <KeyCombo keys={keys} />
  </div>
);

const CategorySection = ({ title, icon, shortcuts }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 14px',
      marginBottom: '6px',
    }}>
      <span style={{ fontSize: '12px' }}>{icon}</span>
      <span style={{
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(139,92,246,0.8)',
      }}>
        {title}
      </span>
      <div style={{
        flex: 1,
        height: '1px',
        background: 'linear-gradient(to right, rgba(139,92,246,0.3), transparent)',
        marginLeft: '4px',
      }} />
    </div>
    <div>
      {shortcuts.map((s, i) => (
        <ShortcutRow key={i} {...s} />
      ))}
    </div>
  </div>
);

const PlatformBadge = () => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '20px',
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(139,92,246,0.9)',
  }}>
    <span>{platform === 'mac' ? '🍎' : platform === 'windows' ? '🪟' : '🐧'}</span>
    <span>{platform === 'mac' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}</span>
  </div>
);

const SHORTCUT_CATEGORIES = [
  {
    title: 'Navigation',
    icon: '🧭',
    shortcuts: [
      { icon: '🔍', label: 'Recherche globale', keys: [MOD, 'K'] },
      { icon: '📌', label: 'Toggle Sidebar', keys: [MOD, 'B'] },
      { icon: '⌨️', label: 'Aide Shortcuts', keys: [MOD, '/'] },
    ],
  },
  {
    title: 'Interface',
    icon: '🎨',
    shortcuts: [
      { icon: '🌙', label: 'Changer thème', keys: [MOD, 'T'] },
      { icon: '🔔', label: 'Notifications', keys: [MOD, SHIFT, 'N'] },
      { icon: '⚙️', label: 'Paramètres', keys: [MOD, ','] },
    ],
  },
  {
    title: 'Actions',
    icon: '⚡',
    shortcuts: [
      { icon: '➕', label: 'Nouveau projet', keys: [MOD, 'N'] },
      { icon: '💾', label: 'Sauvegarder', keys: [MOD, 'S'] },
      { icon: '🔄', label: 'Actualiser', keys: [MOD, 'R'] },
    ],
  },
  {
    title: 'Général',
    icon: '🌐',
    shortcuts: [
      { icon: '❌', label: 'Fermer / Annuler', keys: ['Esc'] },
      { icon: '🔝', label: 'Retour en haut', keys: [MOD, '↑'] },
      { icon: '❓', label: 'Aide', keys: [MOD, '?'] },
    ],
  },
];

const ShortcutsHelp = ({ isOpen, onClose }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setSearchQuery('');
    } else {
      const timer = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const filteredCategories = SHORTCUT_CATEGORIES.map(cat => ({
    ...cat,
    shortcuts: cat.shortcuts.filter(s =>
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keys.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.shortcuts.length > 0);

  if (!visible && !isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Raccourcis clavier"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          background: 'rgba(15,15,25,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: `
            0 0 0 1px rgba(139,92,246,0.15),
            0 25px 60px rgba(0,0,0,0.6),
            0 0 80px rgba(139,92,246,0.08),
            inset 0 1px 0 rgba(255,255,255,0.07)
          `,
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 0',
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 100%)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(59,130,246,0.4))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  boxShadow: '0 0 20px rgba(139,92,246,0.2)',
                }}>
                  ⌨️
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: '700',
                    color: 'rgba(255,255,255,0.95)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}>
                    Raccourcis clavier
                  </h2>
                  <p style={{
                    margin: '2px 0 0',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: '400',
                  }}>
                    Boostez votre productivité
                  </p>
                </div>
              </div>
              <PlatformBadge />
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                lineHeight: 1,
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div style={{
            position: 'relative',
            marginBottom: '16px',
          }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              pointerEvents: 'none',
              color: 'rgba(