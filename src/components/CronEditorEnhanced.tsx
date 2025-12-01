import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

import { getNextRuns, normalizeExpr, shouldWarnDomDowOr, toHuman, type CronDialect } from '../lib/cron';
import { TIMEZONES, getDefaultTimezone } from '../lib/timezones';
import { addToHistory, CronHistory } from '../lib/database';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

// 组件导入
import VisualBuilder from './VisualBuilder';
import CronDebugger from './CronDebugger';
import CalendarView from './CalendarView';
import HistoryPanel from './HistoryPanel';
import ShortcutHelp from './ShortcutHelp';

function getQuery(name: string) {
  return new URL(window.location.href).searchParams.get(name) || '';
}

function setQueryMerge(params: Record<string, string>) {
  const u = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  window.history.replaceState({}, '', u.toString());
}

type CronData =
  | { clean: string; human: string; warnDomDowOr: boolean; nextRuns: Date[] }
  | { clean: string; human: string; warnDomDowOr: boolean; error: string };

export default function CronEditorEnhanced() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  // 基础状态
  const [expr, setExpr] = useState(getQuery('expr') || '*/5 * * * *');
  const [tz, setTz] = useState(getQuery('tz') || getDefaultTimezone());
  const [dialect, setDialect] = useState<CronDialect>((getQuery('dialect') as CronDialect) || 'crontab5');
  const [count, setCount] = useState(10);
  const [copied, setCopied] = useState(false);

  // UI 状态
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebugger, setShowDebugger] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 键盘快捷键
  useKeyboardShortcuts([
    {
      ...DEFAULT_SHORTCUTS.FOCUS_INPUT,
      action: () => inputRef.current?.focus()
    },
    {
      ...DEFAULT_SHORTCUTS.SHOW_HELP,
      action: () => setShowHelp(true)
    },
    {
      ...DEFAULT_SHORTCUTS.COPY,
      action: () => copyShare()
    },
    {
      ...DEFAULT_SHORTCUTS.TOGGLE_HISTORY,
      action: () => setShowHistory(!showHistory)
    },
    {
      ...DEFAULT_SHORTCUTS.TOGGLE_VISUAL,
      action: () => setShowVisualBuilder(!showVisualBuilder)
    },
    {
      ...DEFAULT_SHORTCUTS.CLEAR_INPUT,
      action: () => setExpr('')
    }
  ], true);

  // 关闭帮助的快捷键
  useKeyboardShortcuts([
    {
      key: 'Escape',
      description: '关闭对话框',
      action: () => {
        if (showHelp) setShowHelp(false);
      }
    }
  ], showHelp);

  const shareUrl = useMemo(() => {
    const u = new URL(window.location.href);
    u.pathname = '/';
    u.searchParams.set('expr', expr);
    u.searchParams.set('tz', tz);
    u.searchParams.set('dialect', dialect);
    if (!u.searchParams.get('lang')) u.searchParams.set('lang', i18n.language === 'en' ? 'en' : 'zh-CN');
    if (!u.searchParams.get('theme')) u.searchParams.set('theme', 'light');
    return u.toString();
  }, [expr, tz, dialect]);

  const data = useMemo<CronData>(() => {
    const clean = normalizeExpr(expr);
    if (!clean) {
      return { clean, human: '', warnDomDowOr: false, error: t('emptyExpression') };
    }

    const warnDomDowOr = shouldWarnDomDowOr(clean);
    const locale = i18n.language === 'zh-CN' ? 'zh_CN' : 'en';
    
    let human = '';
    try {
      human = toHuman(clean, locale);
    } catch {
      human = '';
    }

    try {
      const nextRuns = getNextRuns(clean, tz, count, dialect);
      return { clean, human, warnDomDowOr, nextRuns };
    } catch (e: any) {
      return { clean, human, warnDomDowOr, error: e?.message || String(e) };
    }
  }, [expr, tz, count, dialect, t]);

  const parts = useMemo(() => normalizeExpr(expr).split(' ').filter(Boolean), [expr]);

  function syncUrl(nextExpr: string, nextTz: string, nextDialect: CronDialect) {
    setQueryMerge({ expr: nextExpr, tz: nextTz, dialect: nextDialect });
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  // 保存到历史
  useEffect(() => {
    if (data.clean && 'nextRuns' in data) {
      addToHistory({
        expression: data.clean,
        description: data.human,
        timezone: tz,
        dialect: dialect
      });
    }
  }, [data.clean, data.human, tz, dialect]);

  const handleHistorySelect = (item: CronHistory) => {
    setExpr(item.expression);
    setTz(item.timezone);
    setDialect(item.dialect as CronDialect);
    syncUrl(item.expression, item.timezone, item.dialect as CronDialect);
    setShowHistory(false);
  };

  return (
    <div>
      {/* 主输入区域 */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="label">{t('cronExpression')}</label>
            <button 
              className="btn"
              onClick={() => setShowHelp(true)}
              style={{ fontSize: 13 }}
              title="按 ? 查看快捷键"
            >
              ⌨️ 快捷键
            </button>
          </div>
          <input
            ref={inputRef}
            className="input mono"
            value={expr}
            onChange={(e) => {
              const v = e.target.value;
              setExpr(v);
              syncUrl(v, tz, dialect);
            }}
            placeholder="*/5 * * * *"
            style={{ fontSize: 16 }}
          />
        </div>

        <div className="row">
          {/* 时区选择器 - 新功能！ */}
          <div style={{ flex: '1 1 200px' }}>
            <label className="label">{t('timezone')}</label>
            <select
              className="input"
              value={tz}
              onChange={(e) => {
                const v = e.target.value;
                setTz(v);
                syncUrl(expr, v, dialect);
              }}
            >
              <optgroup label="常用">
                {TIMEZONES.filter(t => ['Asia/Shanghai', 'America/New_York', 'Europe/London'].includes(t.value)).map(zone => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label} ({zone.offset})
                  </option>
                ))}
              </optgroup>
              {['亚洲', '欧洲', '美洲', '大洋洲', '非洲', 'UTC'].map(region => (
                <optgroup key={region} label={region}>
                  {TIMEZONES.filter(t => t.region === region).map(zone => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label} ({zone.offset})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div style={{ width: 140 }}>
            <label className="label">{t('dialect')}</label>
            <select
              className="input"
              value={dialect}
              onChange={(e) => {
                const v = e.target.value as CronDialect;
                setDialect(v);
                syncUrl(expr, tz, v);
              }}
            >
              <option value="crontab5">5 fields</option>
              <option value="crontab6">6 fields</option>
            </select>
          </div>

          <div style={{ width: 100 }}>
            <label className="label">{t('next')}</label>
            <input
              className="input"
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={50}
            />
          </div>
        </div>

        {/* 功能切换按钮 */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge mono">{parts.length} {t('fields')}</span>
          <span className="badge">{t('fieldHint')}</span>
          {data.warnDomDowOr && (
            <span className="badge" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              DOM/DOW OR
            </span>
          )}
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              className={`btn ${showVisualBuilder ? 'primary' : ''}`}
              onClick={() => setShowVisualBuilder(!showVisualBuilder)}
            >
              🎨 可视化
            </button>
            <button 
              className={`btn ${showHistory ? 'primary' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
            >
              📚 历史
            </button>
            <button 
              className={`btn ${showDebugger ? 'primary' : ''}`}
              onClick={() => setShowDebugger(!showDebugger)}
            >
              🔍 调试
            </button>
            <button 
              className={`btn ${showCalendar ? 'primary' : ''}`}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              📅 日历
            </button>
            <button className="btn primary" onClick={copyShare}>
              {copied ? '✓ ' + t('copied') : '📋 ' + t('copy')}
            </button>
          </div>
        </div>
      </div>

      {/* 可视化构建器 - 新功能！ */}
      {showVisualBuilder && (
        <VisualBuilder 
          onExpressionChange={(newExpr) => {
            setExpr(newExpr);
            syncUrl(newExpr, tz, dialect);
          }}
          currentExpression={expr}
        />
      )}

      {/* 描述区域 */}
      {data.human && (
        <div className="card">
          <div className="label">{t('description')}</div>
          <div className="description-text">{data.human}</div>
          {data.warnDomDowOr && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              ℹ️ {t('domDowWarn')}
            </div>
          )}
        </div>
      )}

      {/* 表达式调试器 - 新功能！ */}
      {showDebugger && data.clean && (
        <CronDebugger expression={data.clean} />
      )}

      {/* 错误提示 */}
      {'error' in data && (
        <div className="card error">
          <div className="label">{t('validationError')}</div>
          <div style={{ color: 'var(--danger)', fontWeight: 500 }}>{data.error}</div>
        </div>
      )}

      {/* 日历视图 - 新功能！ */}
      {showCalendar && 'nextRuns' in data && data.nextRuns.length > 0 && (
        <CalendarView nextRuns={data.nextRuns} timezone={tz} />
      )}

      {/* 下次执行时间 */}
      {'nextRuns' in data && data.nextRuns.length > 0 && (
        <div className="card">
          <div className="label">{t('nextRuns')} ({tz})</div>
          <ol style={{ margin: '12px 0 0 20px' }}>
            {data.nextRuns.map((d, i) => (
              <li key={i} style={{ padding: '4px 0' }}>
                {d.toLocaleString(undefined, { timeZone: tz })}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 历史记录面板 - 新功能！ */}
      {showHistory && (
        <HistoryPanel onSelect={handleHistorySelect} />
      )}

      {/* 快捷键帮助 - 新功能！ */}
      {showHelp && <ShortcutHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
