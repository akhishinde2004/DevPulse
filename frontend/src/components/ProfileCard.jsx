import React from 'react';
import './ProfileCard.css';

function accountAge(createdAt) {
  const years = ((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  return `${years}y`;
}

export default function ProfileCard({ profile, loading }) {
  if (loading) {
    return (
      <div className="profile-card card">
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: '60%', height: 20, marginTop: 16 }} />
        <div className="skeleton" style={{ width: '80%', height: 14, marginTop: 8 }} />
        <div className="skeleton" style={{ width: '90%', height: 14, marginTop: 8 }} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-card card fade-in">
      <div className="profile-avatar-wrap">
        <img src={profile.avatar_url} alt={profile.login} className="profile-avatar" />
        <div className="profile-online-dot" />
      </div>

      <div className="profile-name">{profile.name || profile.login}</div>
      <a
        href={profile.html_url}
        target="_blank"
        rel="noreferrer"
        className="profile-login mono"
      >
        @{profile.login}
      </a>

      {profile.bio && <p className="profile-bio">{profile.bio}</p>}

      <div className="profile-meta">
        {profile.location && (
          <span className="profile-meta-item">
            <span className="meta-icon">📍</span> {profile.location}
          </span>
        )}
        {profile.blog && (
          <a
            href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
            target="_blank"
            rel="noreferrer"
            className="profile-meta-item link"
          >
            <span className="meta-icon">🔗</span> {profile.blog.replace(/https?:\/\//, '')}
          </a>
        )}
        {profile.created_at && (
          <span className="profile-meta-item">
            <span className="meta-icon">🗓</span> {accountAge(profile.created_at)} on GitHub
          </span>
        )}
      </div>

      <div className="profile-stats">
        <div className="pstat">
          <div className="pstat-val mono">{profile.followers?.toLocaleString()}</div>
          <div className="pstat-label">Followers</div>
        </div>
        <div className="pstat-divider" />
        <div className="pstat">
          <div className="pstat-val mono">{profile.following?.toLocaleString()}</div>
          <div className="pstat-label">Following</div>
        </div>
        <div className="pstat-divider" />
        <div className="pstat">
          <div className="pstat-val mono">{profile.public_repos}</div>
          <div className="pstat-label">Repos</div>
        </div>
      </div>
    </div>
  );
}
