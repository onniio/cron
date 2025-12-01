import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { getHistory, getFavorites, toggleFavorite, deleteHistoryItem, clearHistory, CronHistory } from '../lib/database';

interface HistoryPanelProps {
  onSelect: (item: CronHistory) => void;
}

export default function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';
  
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  
  const history = useLiveQuery(() => getHistory(20), []);
  const favorites = useLiveQuery(() => getFavorites(), []);
  
  const displayItems = activeTab === 'recent' ? history : favorites;

  const handleToggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await toggleFavorite(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm(isZh ? '确定要删除这条记录吗？' : 'Delete this record?')) {
      await deleteHistoryItem(id);
    }
  };

  const handleClearAll = async () => {
    if (confirm(isZh ? '确定要清空所有历史记录吗？' : 'Clear all history?')) {
      await clearHistory();
    }
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="label">📚 {isZh ? '历史记录' : 'History'}</div>
          <small style={{ color: 'var(--muted)' }}>
            {isZh ? '最近使用的表达式' : 'Recently used expressions'}
          </small>
        </div>
        {history && history.length > 0 && (
          <button 
            className="btn" 
            onClick={handleClearAll}
            style={{ fontSize: 13 }}
          >
            {isZh ? '清空全部' : 'Clear All'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'recent' ? '3px solid var(--accent)' : 'none',
            borderRadius: activeTab === 'recent' ? '6px 6px 0 0' : '6px',
            fontWeight: activeTab === 'recent' ? 600 : 400
          }}
          onClick={() => setActiveTab('recent')}
        >
          {isZh ? '最近' : 'Recent'} {history ? `(${history.length})` : '(0)'}
        </button>
        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'favorites' ? '3px solid var(--accent)' : 'none',
            borderRadius: activeTab === 'favorites' ? '6px 6px 0 0' : '6px',
            fontWeight: activeTab === 'favorites' ? 600 : 400
          }}
          onClick={() => setActiveTab('favorites')}
        >
          ⭐ {isZh ? '收藏' : 'Favorites'} {favorites ? `(${favorites.length})` : '(0)'}
        </button>
      </div>

      {displayItems && displayItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayItems.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px',
                background: 'var(--bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onClick={() => onSelect(item)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <code className="mono" style={{ 
                    fontSize: 14, 
                    fontWeight: 600,
                    color: 'var(--accent)'
                  }}>
                    {item.expression}
                  </code>
                  <div style={{ 
                    marginTop: 6, 
                    fontSize: 13, 
                    color: 'var(--text-secondary)'
                  }}>
                    {item.description}
                  </div>
                  <div style={{ 
                    marginTop: 6, 
                    fontSize: 12, 
                    color: 'var(--muted)',
                    display: 'flex',
                    gap: 12
                  }}>
                    <span>{item.timezone}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn"
                    onClick={(e) => handleToggleFavorite(e, item.id!)}
                    style={{ padding: '4px 8px', fontSize: 16 }}
                    title={isZh ? '收藏/取消收藏' : 'Toggle favorite'}
                  >
                    {item.isFavorite ? '⭐' : '☆'}
                  </button>
                  <button
                    className="btn"
                    onClick={(e) => handleDelete(e, item.id!)}
                    style={{ padding: '4px 8px', fontSize: 16, color: 'var(--danger)' }}
                    title={isZh ? '删除' : 'Delete'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: 'var(--muted)',
          fontSize: 14
        }}>
          {activeTab === 'recent' 
            ? (isZh ? '还没有历史记录' : 'No history yet')
            : (isZh ? '还没有收藏' : 'No favorites yet')
          }
        </div>
      )}
    </div>
  );
}
