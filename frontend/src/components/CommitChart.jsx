import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import './CommitChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-date mono">{label}</div>
        <div className="tooltip-val mono">
          {payload[0].value} <span>commits</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function CommitChart({ data, loading }) {
  const [range, setRange] = useState(90);

  if (loading) {
    return <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />;
  }

  if (!data) return <p className="no-data">No commit data available.</p>;

  const sliced = data.slice(data.length - range);

  // Format dates for display
  const formatted = sliced.map((d) => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }));

  return (
    <div className="commit-chart">
      <div className="chart-controls">
        {[30, 60, 90].map((r) => (
          <button
            key={r}
            className={`range-btn mono ${range === r ? 'active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r}d
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={formatted} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#555566', fontSize: 10, fontFamily: 'Space Mono' }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(sliced.length / 6)}
          />
          <YAxis
            tick={{ fill: '#555566', fontSize: 10, fontFamily: 'Space Mono' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#00ff88"
            strokeWidth={2}
            fill="url(#commitGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#00ff88', stroke: '#0a0a0f', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
