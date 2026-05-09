const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const API = {
  getSectors: () =>
    fetch(`${API_BASE}/sectors`).then((res) => res.json()),

  searchCompanies: (q) =>
    fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`).then((res) => res.json()),

  getReport: (id) =>
    fetch(`${API_BASE}/report/${id}`).then((res) => res.json()),

  getSectorCompanies: (sector) =>
    fetch(`${API_BASE}/sectors/${encodeURIComponent(sector)}`).then((res) => res.json()),
};
