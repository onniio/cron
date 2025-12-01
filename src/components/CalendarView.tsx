import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface CalendarViewProps {
  nextRuns: Date[];
  timezone: string;
}

export default function CalendarView({ nextRuns, timezone }: CalendarViewProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';

  const calendarData = useMemo(() => {
    if (nextRuns.length === 0) return { weeks: [], monthYear: '' };

    const firstDate = nextRuns[0];
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks: Array<Array<{ date: number; hasRun: boolean; runTimes: Date[] }>> = [];
    let currentWeek: Array<{ date: number; hasRun: boolean; runTimes: Date[] }> = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: 0, hasRun: false, runTimes: [] });
    }

    for (let date = 1; date <= lastDay.getDate(); date++) {
      const runTimes = nextRuns.filter(d => {
        return d.getFullYear() === year && 
               d.getMonth() === month && 
               d.getDate() === date;
      });

      currentWeek.push({
        date,
        hasRun: runTimes.length > 0,
        runTimes
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: 0, hasRun: false, runTimes: [] });
      }
      weeks.push(currentWeek);
    }

    const monthNames = isZh
      ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const monthYear = isZh ? `${year}年${monthNames[month]}` : `${monthNames[month]} ${year}`;

    return { weeks, monthYear };
  }, [nextRuns, isZh]);

  const weekDayNames = isZh
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (nextRuns.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="label">📅 {isZh ? '日历视图' : 'Calendar View'}</div>
        <small style={{ color: 'var(--muted)' }}>
          {isZh ? '直观显示执行时间分布' : 'Visual distribution of execution times'} ({timezone})
        </small>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
        {calendarData.monthYear}
      </div>

      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        textAlign: 'center'
      }}>
        <thead>
          <tr>
            {weekDayNames.map((day, i) => (
              <th key={i} style={{ 
                padding: '12px 8px', 
                color: i === 0 || i === 6 ? 'var(--danger)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 14,
                borderBottom: '2px solid var(--border)'
              }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarData.weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                const isWeekend = dayIndex === 0 || dayIndex === 6;
                
                return (
                  <td key={dayIndex} style={{
                    padding: '12px 8px',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    background: day.hasRun ? 'var(--accent-light)' : 'transparent',
                    verticalAlign: 'top',
                    height: 60
                  }}>
                    {day.date > 0 && (
                      <>
                        <div style={{ 
                          fontWeight: day.hasRun ? 600 : 400,
                          color: isWeekend ? 'var(--danger)' : day.hasRun ? 'var(--accent)' : 'var(--text)',
                          fontSize: 16
                        }}>
                          {day.date}
                        </div>
                        {day.hasRun && (
                          <div style={{ 
                            marginTop: 4, 
                            fontSize: 11, 
                            color: 'var(--accent)',
                            fontWeight: 600
                          }}>
                            {day.runTimes.length} {isZh ? '次' : 'runs'}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ 
        marginTop: 16, 
        padding: '12px',
        background: 'var(--bg)',
        borderRadius: '6px',
        display: 'flex',
        gap: 16,
        fontSize: 13,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            width: 16, 
            height: 16, 
            background: 'var(--accent-light)',
            border: '1px solid var(--accent)',
            borderRadius: '4px'
          }} />
          <span>{isZh ? '有执行计划' : 'Scheduled execution'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            width: 16, 
            height: 16, 
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '4px'
          }} />
          <span>{isZh ? '无执行计划' : 'No execution'}</span>
        </div>
      </div>
    </div>
  );
}
