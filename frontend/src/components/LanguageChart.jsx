import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './LanguageChart.css';

const COLORS = [
  '#00ff88', '#7c6aff', '#ff6b6b', '#ffd93d', '#4ecdc4',
  '#a8e6cf', '#ff8b94', '#b5b5ff', '#ffa07a', '#98d8c8',
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value, percent } = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <div className="tooltip-date mono">{name}</div>
        <div className="tooltip-val mono">
          {value} repos <span>({(percent * 100).toFixed(1)}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="#000"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={9}
      fontFamily="Space Mono"
      fontWeight="700"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export default function LanguageChart({ data, loading }) {
  const [active, setActive] = useState(null);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 160, height: 160, borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 14, width: `${70 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) return <p className="no-data">No language data available.</p>;

  const top = data.slice(0, 8);
  const total = top.reduce((a, b) => a + b.count, 0);

  return (
    <div className="lang-chart">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={top}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            dataKey="count"
            nameKey="name"
            labelLine={false}
            label={renderCustomLabel}
            onMouseEnter={(_, i) => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            {top.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={COLORS[i % COLORS.length]}
                opacity={active === null || active === i ? 1 : 0.4}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="lang-legend">
        {top.map((lang, i) => (
          <div
            key={lang.name}
            className={`lang-entry ${active === i ? 'active' : ''}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="lang-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="lang-name mono">{lang.name}</span>
            <span className="lang-pct mono">{((lang.count / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
