import React from 'react';
import './RepoList.css';

const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Ruby: '#701516',
  Kotlin: '#7F52FF',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function RepoList({ repos, loading }) {
  if (loading) {
    return (
      <div className="repo-list">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="repo-item">
            <div className="skeleton" style={{ width: '50%', height: 16 }} />
            <div className="skeleton" style={{ width: '80%', height: 12, marginTop: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!repos?.length) return <p className="no-data">No repositories found.</p>;

  return (
    <div className="repo-list">
      {repos.map((repo) => (
        <a
          key={repo.name}
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="repo-item"
        >
          <div className="repo-top">
            <span className="repo-name mono">{repo.name}</span>
            <span className="repo-updated mono">{timeAgo(repo.updated_at)}</span>
          </div>
          {repo.description && (
            <p className="repo-desc">{repo.description}</p>
          )}
          <div className="repo-meta">
            {repo.language && (
              <span className="repo-lang">
                <span
                  className="lang-dot"
                  style={{ background: LANG_COLORS[repo.language] || '#888' }}
                />
                {repo.language}
              </span>
            )}
            <span className="repo-stat">⭐ {repo.stars}</span>
            <span className="repo-stat">🍴 {repo.forks}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
