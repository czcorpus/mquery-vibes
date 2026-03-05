const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function get(path, params = {}) {
  console.log("path = ", path);
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  }
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

export function fetchCorpusInfo(corpusId, locale = "en") {
  return get(`/info/${corpusId}`, { locale });
}

export function fetchConcordance(corpusId, params) {
  return get(`/concordance/${corpusId}`, params);
}

export function fetchTokenFreqs(corpusId, params) {
  return get(`/freqs/${corpusId}`, params);
}

export function fetchTextTypeFreqs(corpusId, params) {
  return get(`/text-types/${corpusId}`, params);
}

export function fetchCollocations(corpusId, params) {
  return get(`/collocations/${corpusId}`, params);
}
