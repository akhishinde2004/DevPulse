import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const u = input.trim().replace('@', '');
    if (u) navigate(`/${u}`);
  };

  return (
    <div className="home">
      <div className="home-grid-bg" />

      <div className="home-content">
        <div className="home-badge mono">DEVELOPER ANALYTICS</div>
        <h1 className="home-title">
          Dev<span className="accent">Pulse</span>
        </h1>
        <p className="home-sub">
          Enter any GitHub username. Get a complete activity dashboard — commits, streaks, repos, and more.
        </p>

        <form onSubmit={handleSubmit} className="home-form">
          <div className="input-wrap">
            <span className="input-prefix mono">github.com/</span>
            <input
              type="text"
              placeholder="akhishinde2004"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              spellCheck={false}
              className="home-input mono"
            />
          </div>
          <button type="submit" className="home-btn mono" disabled={!input.trim()}>
            VIEW PULSE →
          </button>
        </form>

        <div className="home-features">
          {['Commit Activity', 'Streaks', 'Repo Stats', 'Language Breakdown', 'Contribution Heatmap', 'PR & Issues'].map((f) => (
            <span key={f} className="tag">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
