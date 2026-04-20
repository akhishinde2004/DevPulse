import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

export const fetchProfile = (username) => axios.get(`${BASE}/github/profile/${username}`).then(r => r.data);
export const fetchRepos = (username) => axios.get(`${BASE}/github/repos/${username}`).then(r => r.data);
export const fetchCommits = (username) => axios.get(`${BASE}/github/commits/${username}`).then(r => r.data);
export const fetchPRStats = (username) => axios.get(`${BASE}/github/prstats/${username}`).then(r => r.data);
export const fetchHeatmap = (username) => axios.get(`${BASE}/github/heatmap/${username}`).then(r => r.data);
