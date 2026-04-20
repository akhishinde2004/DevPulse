import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfile, fetchRepos, fetchCommits, fetchPRStats, fetchHeatmap } from '../utils/api';
import ProfileCard from '../components/ProfileCard';
import CommitChart from '../components/CommitChart';
import Heatmap from '../components/Heatmap';
import RepoList from '../components/RepoList';
import LanguageChart from '../components/LanguageChart';
import StatsBar from '../components/StatsBar';
import './Dashboard.css';

export default function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState(null);
  const [commits, setCommits] = useState(null);
  const [prStats, setPrStats] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchProfile(username).catch(() => null),
      fetchRepos(username).catch(() => null),
      fetchCommits(username).catch(() => null),
      fetchPRStats(username).catch(() => null),
      fetchHeatmap(username).catch(() => null),
    ]).then(([p, r, c, pr, h]) => {
      if (!p) {
        setError(`User "${username}" not found on GitHub.`);
      } else {
        setProfile(p);
        setRepos(r);
        setCommits(c);
        setPrStats(pr);
        setHeatmap(h);
      }
      setLoading(false);
    });
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="dash-error">
        <p className="mono">{error}</p>
        <button className="home-btn mono" onClick={() => navigate('/')}>← BACK</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <button className="back-btn mono" onClick={() => navigate('/')}>
          ← DevPulse
        </button>
        <div className="dash-header-right">
          <span className="dash-user mono">/{username}</span>
          <button className="share-btn mono" onClick={handleShare}>
            {copied ? 'COPIED ✓' : 'SHARE LINK'}
          </button>
        </div>
      </header>

      <div className="container">
        <div className="dash-grid">
          {/* Profile */}
          <div className="dash-profile">
            <ProfileCard profile={profile} loading={loading} />
          </div>

          {/* Stats bar */}
          <div className="dash-statsbar">
            <StatsBar commits={commits} prStats={prStats} loading={loading} />
          </div>

          {/* Commit chart */}
          <div className="dash-commits card fade-in">
            <div className="card-title">COMMIT ACTIVITY — LAST 90 DAYS</div>
            <CommitChart data={commits?.daily} loading={loading} />
          </div>

          {/* Heatmap */}
          <div className="dash-heatmap card fade-in">
            <div className="card-title">CONTRIBUTION HEATMAP</div>
            <Heatmap data={heatmap} loading={loading} />
          </div>

          {/* Repos */}
          <div className="dash-repos card fade-in">
            <div className="card-title">TOP REPOSITORIES</div>
            <RepoList repos={repos?.topByStars} loading={loading} />
          </div>

          {/* Language chart */}
          <div className="dash-langs card fade-in">
            <div className="card-title">LANGUAGE BREAKDOWN</div>
            <LanguageChart data={repos?.languages} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
