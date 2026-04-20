import React, { useMemo } from 'react';
import './Heatmap.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getColor(count) {
  if (!count) return 'var(--bg3)';
  if (count <= 2) return '#003d22';
  if (count <= 5) return '#006437';
  if (count <= 10) return '#00a854';
  return '#00ff88';
}

function buildGrid(heatmapData) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Align to Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const weeks = [];
  let current = new Date(startDate);

  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0];
      const isFuture = current > today;
      week.push({
        date: dateStr,
        count: isFuture ? null : (heatmapData?.[dateStr] || 0),
        month: current.getMonth(),
        dayOfWeek: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function getMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const month = week[0]?.month;
    if (month !== lastMonth) {
      labels.push({ index: i, label: MONTHS[month] });
      lastMonth = month;
    }
  });
  return labels;
}

export default function Heatmap({ data, loading }) {
  const weeks = useMemo(() => buildGrid(data), [data]);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

  if (loading) {
    return <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />;
  }

  const total = data
    ? Object.values(data).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-total mono">{total} contributions in the last year</div>
      <div className="heatmap-scroll">
        <div className="heatmap-grid">
          {/* Month labels */}
          <div className="heatmap-month-row">
            <div className="heatmap-day-labels-spacer" />
            {weeks.map((_, i) => {
              const found = monthLabels.find((m) => m.index === i);
              return (
                <div key={i} className="heatmap-month-cell mono">
                  {found ? found.label : ''}
                </div>
              );
            })}
          </div>

          {/* Day rows */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
            <div key={dayIdx} className="heatmap-row">
              <div className="heatmap-day-label mono">
                {dayIdx % 2 === 1 ? DAYS[dayIdx] : ''}
              </div>
              {weeks.map((week, wi) => {
                const cell = week[dayIdx];
                return (
                  <div
                    key={wi}
                    className="heatmap-cell"
                    style={{
                      background: cell?.count === null ? 'transparent' : getColor(cell?.count),
                    }}
                    title={cell?.count !== null ? `${cell.date}: ${cell.count} commits` : ''}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span className="mono">Less</span>
          {[0, 2, 5, 10, 15].map((v) => (
            <div
              key={v}
              className="heatmap-cell"
              style={{ background: getColor(v) }}
            />
          ))}
          <span className="mono">More</span>
        </div>
      </div>
    </div>
  );
}
