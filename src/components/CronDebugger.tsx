import React from 'react';
import { useTranslation } from 'react-i18next';

interface DebuggerProps {
  expression: string;
}

interface FieldExplanation {
  value: string;
  meaning: string;
  examples?: string[];
  warning?: string;
}

export default function CronDebugger({ expression }: DebuggerProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';

  const fields = expression.trim().split(/\s+/);
  
  if (fields.length !== 5) {
    return null;
  }

  const [minute, hour, day, month, weekday] = fields;

  const explainField = (value: string, fieldType: string): FieldExplanation => {
    const explanations: Record<string, any> = {
      minute: {
        '*': { 
          zh: '每分钟', 
          en: 'Every minute',
          examples: isZh ? ['每分钟都执行'] : ['Runs every minute']
        },
        '0': {
          zh: '整点（0分）',
          en: 'At minute 0',
          examples: isZh ? ['9:00, 10:00, 11:00...'] : ['9:00, 10:00, 11:00...']
        },
        '*/5': {
          zh: '每5分钟',
          en: 'Every 5 minutes',
          examples: isZh ? ['0, 5, 10, 15, 20...'] : ['0, 5, 10, 15, 20...']
        },
        '0,30': {
          zh: '第0分钟和第30分钟',
          en: 'At minute 0 and 30',
          examples: isZh ? ['9:00, 9:30, 10:00, 10:30...'] : ['9:00, 9:30, 10:00, 10:30...']
        },
        '15-45': {
          zh: '第15分钟到第45分钟',
          en: 'Minutes 15 through 45',
          examples: isZh ? ['每小时的15-45分'] : ['Minutes 15-45 of every hour']
        }
      },
      hour: {
        '*': {
          zh: '每小时',
          en: 'Every hour',
          examples: isZh ? ['0:00, 1:00, 2:00...'] : ['0:00, 1:00, 2:00...']
        },
        '9': {
          zh: '9点',
          en: 'At 9 AM',
          examples: isZh ? ['每天9:00执行'] : ['Runs at 9:00 AM every day']
        },
        '*/2': {
          zh: '每2小时',
          en: 'Every 2 hours',
          examples: isZh ? ['0:00, 2:00, 4:00...'] : ['0:00, 2:00, 4:00...']
        },
        '9-17': {
          zh: '9点到17点',
          en: '9 AM to 5 PM',
          examples: isZh ? ['工作时间段'] : ['Business hours']
        }
      },
      day: {
        '*': {
          zh: '每天',
          en: 'Every day',
          examples: isZh ? ['每月的每一天'] : ['Every day of the month']
        },
        '1': {
          zh: '每月1号',
          en: '1st of month',
          examples: isZh ? ['月初'] : ['First day of each month']
        },
        '*/2': {
          zh: '每隔一天',
          en: 'Every other day',
          examples: isZh ? ['1号, 3号, 5号...'] : ['1st, 3rd, 5th...']
        },
        '1-7': {
          zh: '每月前7天',
          en: 'First week of month',
          examples: isZh ? ['每月1-7号'] : ['Days 1-7 of each month']
        }
      },
      month: {
        '*': {
          zh: '每月',
          en: 'Every month',
          examples: isZh ? ['全年每个月'] : ['All months']
        },
        '1': {
          zh: '1月',
          en: 'January',
          examples: isZh ? ['仅在1月执行'] : ['Only in January']
        },
        '*/3': {
          zh: '每3个月',
          en: 'Every 3 months',
          examples: isZh ? ['季度：1月, 4月, 7月, 10月'] : ['Quarterly: Jan, Apr, Jul, Oct']
        },
        '1-6': {
          zh: '上半年（1-6月）',
          en: 'First half of year',
          examples: isZh ? ['1月到6月'] : ['January to June']
        }
      },
      weekday: {
        '*': {
          zh: '每天（任意星期）',
          en: 'Every day of week',
          examples: isZh ? ['周一到周日'] : ['Monday to Sunday']
        },
        '1': {
          zh: '周一',
          en: 'Monday',
          examples: isZh ? ['仅周一执行'] : ['Only on Mondays']
        },
        '1-5': {
          zh: '工作日（周一到周五）',
          en: 'Weekdays (Mon-Fri)',
          examples: isZh ? ['周一至周五'] : ['Monday through Friday']
        },
        '0,6': {
          zh: '周末（周日和周六）',
          en: 'Weekend (Sun, Sat)',
          examples: isZh ? ['周末'] : ['Saturdays and Sundays']
        }
      }
    };

    // 通用解析逻辑
    const parseValue = (val: string, type: string): string => {
      if (val === '*') {
        return explanations[type]['*'][isZh ? 'zh' : 'en'];
      }
      
      if (val.includes('/')) {
        const interval = val.split('/')[1];
        return isZh ? `每${interval}${getUnitName(type)}` : `Every ${interval} ${getUnitName(type)}`;
      }
      
      if (val.includes('-')) {
        const [start, end] = val.split('-');
        return isZh 
          ? `${start}到${end}${getUnitName(type)}`
          : `${getUnitName(type)} ${start} to ${end}`;
      }
      
      if (val.includes(',')) {
        const values = val.split(',');
        return isZh
          ? `${getUnitName(type)}：${values.join(', ')}`
          : `${getUnitName(type)}: ${values.join(', ')}`;
      }
      
      // 具体的值
      if (type === 'weekday') {
        const weekdays = isZh 
          ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
          : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return weekdays[parseInt(val)] || val;
      }
      
      if (type === 'month') {
        const months = isZh
          ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
          : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[parseInt(val) - 1] || val;
      }
      
      return isZh ? `第${val}${getUnitName(type)}` : `${getUnitName(type)} ${val}`;
    };

    const getUnitName = (type: string): string => {
      const units: Record<string, { zh: string; en: string }> = {
        minute: { zh: '分钟', en: 'minute' },
        hour: { zh: '小时', en: 'hour' },
        day: { zh: '天', en: 'day' },
        month: { zh: '月', en: 'month' },
        weekday: { zh: '', en: '' }
      };
      return units[type][isZh ? 'zh' : 'en'];
    };

    const meaning = parseValue(value, fieldType);
    const example = explanations[fieldType][value];
    
    return {
      value,
      meaning,
      examples: example?.examples,
      warning: undefined
    };
  };

  const fieldTypes = [
    { value: minute, type: 'minute', icon: '⏱️', label: isZh ? '分钟' : 'Minute' },
    { value: hour, type: 'hour', icon: '🕐', label: isZh ? '小时' : 'Hour' },
    { value: day, type: 'day', icon: '📅', label: isZh ? '日期' : 'Day' },
    { value: month, type: 'month', icon: '📆', label: isZh ? '月份' : 'Month' },
    { value: weekday, type: 'weekday', icon: '📌', label: isZh ? '星期' : 'Weekday' }
  ];

  // 检测潜在问题
  const warnings: string[] = [];
  if (day !== '*' && weekday !== '*') {
    warnings.push(
      isZh 
        ? '⚠️ 注意：日期和星期字段同时设置时是 OR 关系（满足任一条件即执行）'
        : '⚠️ Warning: Day and weekday fields are ORed (executes when either condition matches)'
    );
  }
  
  if (minute.startsWith('*/1') || minute === '*') {
    if (hour === '*' && day === '*' && month === '*' && weekday === '*') {
      warnings.push(
        isZh
          ? '⚠️ 这将每分钟执行一次，确定这是你想要的吗？'
          : '⚠️ This will run every minute. Are you sure?'
      );
    }
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="label">🔍 {isZh ? '表达式调试器' : 'Expression Debugger'}</div>
        <small style={{ color: 'var(--muted)' }}>
          {isZh ? '分步解释每个字段的含义' : 'Step-by-step explanation of each field'}
        </small>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fieldTypes.map(({ value, type, icon, label }) => {
          const explanation = explainField(value, type);
          
          return (
            <div key={type} style={{ 
              padding: '16px', 
              background: 'var(--bg)', 
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge">{label}</span>
                    <code className="mono" style={{ 
                      padding: '4px 8px', 
                      background: 'var(--accent-light)', 
                      color: 'var(--accent)',
                      borderRadius: '4px',
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      {value}
                    </code>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 15, fontWeight: 500 }}>
                    {explanation.meaning}
                  </div>
                  {explanation.examples && explanation.examples.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)' }}>
                      {isZh ? '示例：' : 'Example: '}{explanation.examples[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {warnings.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          background: 'var(--danger-light)',
          border: '1px solid var(--danger)',
          borderRadius: '8px',
          fontSize: 14
        }}>
          {warnings.map((warning, i) => (
            <div key={i} style={{ marginTop: i > 0 ? 8 : 0 }}>
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
