import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface VisualBuilderProps {
  onExpressionChange: (expr: string) => void;
  currentExpression?: string;
}

type FieldType = 'minute' | 'hour' | 'day' | 'month' | 'weekday';

interface FieldConfig {
  mode: 'every' | 'specific' | 'interval' | 'range';
  values: number[];
  interval?: number;
  rangeStart?: number;
  rangeEnd?: number;
}

export default function VisualBuilder({ onExpressionChange, currentExpression }: VisualBuilderProps) {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';

  const [activeTab, setActiveTab] = useState<FieldType>('minute');
  const [fields, setFields] = useState<Record<FieldType, FieldConfig>>({
    minute: { mode: 'every', values: [] },
    hour: { mode: 'every', values: [] },
    day: { mode: 'every', values: [] },
    month: { mode: 'every', values: [] },
    weekday: { mode: 'every', values: [] }
  });

  // 字段配置
  const fieldConfigs = {
    minute: { label: isZh ? '分钟' : 'Minute', range: [0, 59] },
    hour: { label: isZh ? '小时' : 'Hour', range: [0, 23] },
    day: { label: isZh ? '日期' : 'Day', range: [1, 31] },
    month: { label: isZh ? '月份' : 'Month', range: [1, 12] },
    weekday: { label: isZh ? '星期' : 'Weekday', range: [0, 6] }
  };

  const weekdayNames = isZh 
    ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = isZh
    ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 生成 Cron 表达式
  useEffect(() => {
    const generateField = (field: FieldType): string => {
      const config = fields[field];
      
      if (config.mode === 'every') {
        return '*';
      }
      
      if (config.mode === 'interval' && config.interval) {
        return `*/${config.interval}`;
      }
      
      if (config.mode === 'range' && config.rangeStart !== undefined && config.rangeEnd !== undefined) {
        return `${config.rangeStart}-${config.rangeEnd}`;
      }
      
      if (config.mode === 'specific' && config.values.length > 0) {
        return config.values.sort((a, b) => a - b).join(',');
      }
      
      return '*';
    };

    const expr = [
      generateField('minute'),
      generateField('hour'),
      generateField('day'),
      generateField('month'),
      generateField('weekday')
    ].join(' ');

    onExpressionChange(expr);
  }, [fields, onExpressionChange]);

  const updateField = (field: FieldType, updates: Partial<FieldConfig>) => {
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], ...updates }
    }));
  };

  const toggleValue = (field: FieldType, value: number) => {
    const current = fields[field].values;
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    updateField(field, { values: newValues, mode: 'specific' });
  };

  const renderFieldEditor = (field: FieldType) => {
    const config = fields[field];
    const { range } = fieldConfigs[field];
    const [min, max] = range;

    return (
      <div style={{ padding: '20px' }}>
        {/* 模式选择 */}
        <div style={{ marginBottom: 20 }}>
          <div className="label">{isZh ? '选择模式' : 'Select Mode'}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className={`btn ${config.mode === 'every' ? 'primary' : ''}`}
              onClick={() => updateField(field, { mode: 'every' })}
            >
              {isZh ? '每' : 'Every'} {fieldConfigs[field].label}
            </button>
            <button
              className={`btn ${config.mode === 'interval' ? 'primary' : ''}`}
              onClick={() => updateField(field, { mode: 'interval', interval: 5 })}
            >
              {isZh ? '间隔' : 'Interval'}
            </button>
            <button
              className={`btn ${config.mode === 'range' ? 'primary' : ''}`}
              onClick={() => updateField(field, { mode: 'range', rangeStart: min, rangeEnd: max })}
            >
              {isZh ? '范围' : 'Range'}
            </button>
            <button
              className={`btn ${config.mode === 'specific' ? 'primary' : ''}`}
              onClick={() => updateField(field, { mode: 'specific', values: [] })}
            >
              {isZh ? '指定值' : 'Specific'}
            </button>
          </div>
        </div>

        {/* 间隔模式 */}
        {config.mode === 'interval' && (
          <div style={{ marginBottom: 20 }}>
            <label className="label">{isZh ? '每' : 'Every'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="number"
                className="input"
                style={{ width: 100 }}
                value={config.interval || 1}
                min={1}
                max={max - min}
                onChange={(e) => updateField(field, { interval: parseInt(e.target.value) || 1 })}
              />
              <span>{fieldConfigs[field].label}</span>
            </div>
          </div>
        )}

        {/* 范围模式 */}
        {config.mode === 'range' && (
          <div style={{ marginBottom: 20 }}>
            <label className="label">{isZh ? '选择范围' : 'Select Range'}</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="number"
                className="input"
                style={{ width: 100 }}
                value={config.rangeStart !== undefined ? config.rangeStart : min}
                min={min}
                max={max}
                onChange={(e) => updateField(field, { rangeStart: parseInt(e.target.value) })}
              />
              <span>-</span>
              <input
                type="number"
                className="input"
                style={{ width: 100 }}
                value={config.rangeEnd !== undefined ? config.rangeEnd : max}
                min={min}
                max={max}
                onChange={(e) => updateField(field, { rangeEnd: parseInt(e.target.value) })}
              />
            </div>
          </div>
        )}

        {/* 指定值模式 */}
        {config.mode === 'specific' && (
          <div>
            <label className="label">{isZh ? '点击选择值' : 'Click to select values'}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(value => {
                const isSelected = config.values.includes(value);
                let displayValue: string | number = value;
                
                if (field === 'weekday') {
                  displayValue = weekdayNames[value];
                } else if (field === 'month') {
                  displayValue = monthNames[value - 1];
                }

                return (
                  <button
                    key={value}
                    className={`btn ${isSelected ? 'primary' : ''}`}
                    onClick={() => toggleValue(field, value)}
                    style={{ minWidth: 60 }}
                  >
                    {displayValue}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="label">🎨 {isZh ? '可视化构建器' : 'Visual Builder'}</div>
        <small style={{ color: 'var(--muted)' }}>
          {isZh ? '通过点击和选择来构建 Cron 表达式' : 'Build Cron expression by clicking and selecting'}
        </small>
      </div>

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        {(Object.keys(fieldConfigs) as FieldType[]).map(field => (
          <button
            key={field}
            className="btn"
            style={{
              borderBottom: activeTab === field ? '3px solid var(--accent)' : 'none',
              borderRadius: activeTab === field ? '6px 6px 0 0' : '6px',
              fontWeight: activeTab === field ? 600 : 400
            }}
            onClick={() => setActiveTab(field)}
          >
            {fieldConfigs[field].label}
          </button>
        ))}
      </div>

      {/* 当前 Tab 的编辑器 */}
      {renderFieldEditor(activeTab)}
    </div>
  );
}
