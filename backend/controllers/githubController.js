const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache

const GH_API = 'https://api.github.com';
const headers = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
});

// ─── Profile ────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  const { username } = req.params;
  const cacheKey = `profile_${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const { data } = await axios.get(`${GH_API}/users/${username}`, { headers: headers() });
    const profile = {
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      location: data.location,
      blog: data.blog,
      followers: data.followers,
      following: data.following,
      public_repos: data.public_repos,
      created_at: data.created_at,
      html_url: data.html_url,
    };
    cache.set(cacheKey, profile);
    res.json(profile);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};

// ─── Repos ───────────────────────────────────────────────────────────────────
const getRepos = async (req, res) => {
  const { username } = req.params;
  const cacheKey = `repos_${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const { data } = await axios.get(
      `${GH_API}/users/${username}/repos?sort=updated&per_page=100`,
      { headers: headers() }
    );

    // Language distribution
    const langMap = {};
    data.forEach((repo) => {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      }
    });

    const languages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Top repos by stars
    const topByStars = [...data]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        updated_at: r.updated_at,
        html_url: r.html_url,
      }));

    // Most recently active
    const recentlyActive = [...data]
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        updated_at: r.updated_at,
        pushed_at: r.pushed_at,
        html_url: r.html_url,
      }));

    const result = { languages, topByStars, recentlyActive, total: data.length };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};

// ─── Commits (last 90 days via Search API) ───────────────────────────────────
const getCommits = async (req, res) => {
  const { username } = req.params;
  const cacheKey = `commits_${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const today = new Date();
    const since90 = new Date(today);
    since90.setDate(since90.getDate() - 90);
    const sinceStr = since90.toISOString().split('T')[0];

    // Build daily map using commit search API — searches all public repos
    const dailyMap = {};

    // Fetch commits day by day would be too slow, so use weekly buckets via search
    // Strategy: get user's repos, fetch commit activity per repo
    const reposRes = await axios.get(
      `${GH_API}/users/${username}/repos?sort=pushed&per_page=100`,
      { headers: headers() }
    );
    const repos = reposRes.data.filter(r => !r.fork); // exclude forks to avoid noise

    // For top 10 most recently pushed repos, fetch commit stats
    const topRepos = repos.slice(0, 10);

    await Promise.all(
      topRepos.map(async (repo) => {
        try {
          let page = 1;
          let hasMore = true;
          while (hasMore) {
            const res = await axios.get(
              `${GH_API}/repos/${username}/${repo.name}/commits?author=${username}&since=${sinceStr}T00:00:00Z&per_page=100&page=${page}`,
              { headers: headers() }
            );
            const commits = res.data;
            if (!Array.isArray(commits) || commits.length === 0) {
              hasMore = false;
            } else {
              commits.forEach((c) => {
                const date = c.commit.author.date.split('T')[0];
                dailyMap[date] = (dailyMap[date] || 0) + 1;
              });
              if (commits.length < 100) hasMore = false;
              else page++;
            }
          }
        } catch {
          // skip repos we can't access
        }
      })
    );

    // Calculate streaks
    const today2 = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < 90; i++) {
      const d = new Date(today2);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (dailyMap[dateStr]) {
        if (i === 0 || currentStreak > 0) currentStreak++;
      } else {
        if (i === 0) currentStreak = 0;
        else break;
      }
    }

    const sortedDates = Object.keys(dailyMap).sort();
    sortedDates.forEach((date, i) => {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(date);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    });

    // Last 90 days array
    const last90 = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today2);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last90.push({ date: dateStr, count: dailyMap[dateStr] || 0 });
    }

    const result = {
      daily: last90,
      currentStreak,
      longestStreak,
      totalCommits: Object.values(dailyMap).reduce((a, b) => a + b, 0),
    };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};

// ─── PR & Issue Stats ────────────────────────────────────────────────────────
const getPRStats = async (req, res) => {
  const { username } = req.params;
  const cacheKey = `prstats_${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [prOpen, prMerged, prClosed, issuesOpen, issuesClosed] = await Promise.all([
      axios.get(`${GH_API}/search/issues?q=author:${username}+type:pr+state:open&per_page=1`, { headers: headers() }),
      axios.get(`${GH_API}/search/issues?q=author:${username}+type:pr+is:merged&per_page=1`, { headers: headers() }),
      axios.get(`${GH_API}/search/issues?q=author:${username}+type:pr+state:closed&per_page=1`, { headers: headers() }),
      axios.get(`${GH_API}/search/issues?q=author:${username}+type:issue+state:open&per_page=1`, { headers: headers() }),
      axios.get(`${GH_API}/search/issues?q=author:${username}+type:issue+state:closed&per_page=1`, { headers: headers() }),
    ]);

    const result = {
      prs: {
        open: prOpen.data.total_count,
        merged: prMerged.data.total_count,
        closed: prClosed.data.total_count - prMerged.data.total_count,
      },
      issues: {
        open: issuesOpen.data.total_count,
        closed: issuesClosed.data.total_count,
      },
    };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};

// ─── Contribution Heatmap (full year via repo commits) ───────────────────────
const getHeatmap = async (req, res) => {
  const { username } = req.params;
  const cacheKey = `heatmap_${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    const sinceStr = since.toISOString().split('T')[0];

    const reposRes = await axios.get(
      `${GH_API}/users/${username}/repos?sort=pushed&per_page=100`,
      { headers: headers() }
    );
    const repos = reposRes.data.filter((r) => !r.fork).slice(0, 15);

    const heatmap = {};

    await Promise.all(
      repos.map(async (repo) => {
        try {
          let page = 1;
          let hasMore = true;
          while (hasMore) {
            const res = await axios.get(
              `${GH_API}/repos/${username}/${repo.name}/commits?author=${username}&since=${sinceStr}T00:00:00Z&per_page=100&page=${page}`,
              { headers: headers() }
            );
            const commits = res.data;
            if (!Array.isArray(commits) || commits.length === 0) {
              hasMore = false;
            } else {
              commits.forEach((c) => {
                const date = c.commit.author.date.split('T')[0];
                heatmap[date] = (heatmap[date] || 0) + 1;
              });
              if (commits.length < 100) hasMore = false;
              else page++;
            }
          }
        } catch {
          // skip inaccessible repos
        }
      })
    );

    cache.set(cacheKey, heatmap);
    res.json(heatmap);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};

module.exports = { getProfile, getRepos, getCommits, getPRStats, getHeatmap };