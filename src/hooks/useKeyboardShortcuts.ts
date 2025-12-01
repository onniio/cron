import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command on Mac
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled: boolean = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // 忽略在输入框中的快捷键（除了特定的）
    const target = event.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    
    shortcuts.forEach(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      // 特殊处理：/ 和 ? 即使在输入框也可以使用
      const allowInInput = ['/', '?'].includes(shortcut.key);
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (!isInputField || allowInInput) {
          event.preventDefault();
          shortcut.action();
        }
      }
    });
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// 预定义的快捷键
export const DEFAULT_SHORTCUTS = {
  FOCUS_INPUT: { key: '/', description: '聚焦到输入框' },
  SHOW_HELP: { key: '?', description: '显示快捷键帮助' },
  COPY: { key: 'c', ctrl: true, description: '复制表达式' },
  TOGGLE_HISTORY: { key: 'h', ctrl: true, description: '显示/隐藏历史记录' },
  TOGGLE_VISUAL: { key: 'v', ctrl: true, description: '切换可视化构建器' },
  CLEAR_INPUT: { key: 'k', ctrl: true, description: '清空输入' },
};
