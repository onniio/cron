import React from 'react';
import { useTranslation } from 'react-i18next';

interface ShortcutHelpProps {
  onClose: () => void;
}

export default function ShortcutHelp({ onClose }: ShortcutHelpProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';

  const shortcuts = [
    { key: '/', desc: isZh ? '聚焦到输入框' : 'Focus input field' },
    { key: '?', desc: isZh ? '显示此帮助' : 'Show this help' },
    { key: 'Ctrl + C', desc: isZh ? '复制表达式' : 'Copy expression' },
    { key: 'Ctrl + H', desc: isZh ? '显示/隐藏历史记录' : 'Toggle history' },
    { key: 'Ctrl + V', desc: isZh ? '切换可视化构建器' : 'Toggle visual builder' },
    { key: 'Ctrl + K', desc: isZh ? '清空输入' : 'Clear input' },
    { key: 'Esc', desc: isZh ? '关闭对话框' : 'Close dialog' }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        className="card"
        style={{ 
          maxWidth: 500, 
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>
            ⌨️ {isZh ? '键盘快捷键' : 'Keyboard Shortcuts'}
          </h2>
          <button className="btn" onClick={onClose} style={{ fontSize: 18 }}>
            ✕
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {shortcuts.map((shortcut, i) => (
              <tr key={i} style={{ borderBottom: i === shortcuts.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0' }}>
                  <code className="kbd" style={{ padding: '6px 12px', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    {shortcut.key}
                  </code>
                </td>
                <td style={{ padding: '12px 0 12px 16px', color: 'var(--text-secondary)' }}>
                  {shortcut.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20, padding: '12px', background: 'var(--bg)', borderRadius: '6px', fontSize: 13, color: 'var(--muted)' }}>
          💡 {isZh 
            ? '提示：大多数快捷键在输入框聚焦时不可用，以免干扰输入。'
            : 'Tip: Most shortcuts are disabled when input is focused to avoid interference.'}
        </div>
      </div>
    </div>
  );
}
