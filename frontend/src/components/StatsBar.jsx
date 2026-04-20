import React from 'react';
import './StatsBar.css';

export default function StatsBar({ commits, prStats, loading }) {
  const stats = [
    {
      label: 'CURRENT STREAK',
      value: commits?.currentStreak ?? '—',
      suffix: 'days',
      accent: true,
    },
    {
      label: 'LONGEST STREAK',
      value: commits?.longestStreak ?? '—',
      suffix: 'days',
    },
    {
      label: 'TOTAL COMMITS',
      value: commits?.totalCommits?.toLocaleString() ?? '—',
      suffix: '',
    },
    {
      label: 'PRs MERGED',
      value: prStats?.prs?.merged?.toLocaleString() ?? '—',
      suffix: '',
    },
    {
      label: 'ISSUES CLOSED',
      value: prStats?.issues?.closed?.toLocaleString() ?? '—',
      suffix: '',
    },
  ];

  return (
    <div className="stats-bar card fade-in">
      {stats.map((s, i) => (
        <div className="stat-item" key={i}>
          <div className={`stat-value mono ${s.accent ? 'accent' : ''}`}>
            {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 40, height: 28 }} /> : s.value}
            {!loading && s.suffix && <span className="stat-suffix"> {s.suffix}</span>}
          </div>
          <div className="stat-label mono">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
