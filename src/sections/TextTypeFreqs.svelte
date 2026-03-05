<script>
  import { fetchTextTypeFreqs } from '../lib/api.js'
  import SectionCard from '../components/SectionCard.svelte'
  import LoadingSpinner from '../components/LoadingSpinner.svelte'
  import ErrorMessage from '../components/ErrorMessage.svelte'
  import { shared } from '../lib/shared.svelte.js'

  let { corpusId } = $props()
  let attr = $state('doc.pubyear')
  let maxItems = $state(20)
  let flimit = $state(1)

  let loading = $state(false)
  let error = $state(null)
  let items = $state([])

  async function search() {
    if (!corpusId || !shared.query) return
    loading = true
    error = null
    items = []
    try {
      const result = await fetchTextTypeFreqs(corpusId, { q: shared.query, attr, maxItems, flimit })
      items = Array.isArray(result) ? result : (result.freqs ?? result.data ?? [])
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }

  let maxFreq = $derived(items.length ? Math.max(...items.map(i => i.freq ?? i.count ?? 0)) : 1)
</script>

<SectionCard title="Text Type Frequencies">
  <form onsubmit={(e) => { e.preventDefault(); search() }}>
    <div class="form-grid">
      <label>
        Query (CQL)
        <input type="text" bind:value={shared.query} placeholder='[lemma="run"]' required />
      </label>
      <label>
        Structural attribute
        <input type="text" bind:value={attr} placeholder="doc.pubyear" />
      </label>
      <label>
        Max items
        <input type="number" bind:value={maxItems} min="1" max="1000" />
      </label>
      <label>
        Min frequency
        <input type="number" bind:value={flimit} min="1" />
      </label>
    </div>
    <div class="form-actions">
      <button type="submit">Get Distribution</button>
    </div>
  </form>

  {#if loading}
    <LoadingSpinner />
  {:else if error}
    <ErrorMessage message={error} />
  {:else if items.length > 0}
    <table class="freq-table">
      <thead>
        <tr>
          <th class="rank">#</th>
          <th>{attr}</th>
          <th class="num">Frequency</th>
          <th class="num">IPM</th>
          <th class="bar-col"></th>
        </tr>
      </thead>
      <tbody>
        {#each items as item, i}
          {@const freq = item.freq ?? item.count ?? 0}
          {@const ipm = item.ipm != null ? item.ipm.toFixed(2) : '—'}
          <tr>
            <td class="rank">{i + 1}</td>
            <td class="value">{item.word ?? item.value ?? item.str ?? ''}</td>
            <td class="num">{freq.toLocaleString()}</td>
            <td class="num">{ipm}</td>
            <td class="bar-col">
              <div class="bar" style="width: {(freq / maxFreq * 100).toFixed(1)}%"></div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if !loading && error === null}
    <p class="empty">No results yet. Enter a query and click "Get Distribution".</p>
  {/if}
</SectionCard>

<style>
  .form-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    align-items: flex-end;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #444;
  }

  label input[type="text"] { width: 18rem; }
  label input[type="number"] { width: 6rem; }

  input {
    padding: 0.4rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 0.9rem;
  }

  input[type="text"] {
    font-family: monospace;
    font-size: 1rem;
  }

  .form-actions { margin-top: 0.75rem; }

  button[type="submit"] {
    padding: 0.45rem 1.1rem;
    background: #1a3a5c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  button[type="submit"]:hover { background: #255080; }

  .freq-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-size: 0.875rem;
  }

  .freq-table th {
    text-align: left;
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #888;
    border-bottom: 2px solid #e5e7eb;
  }

  .freq-table td {
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .rank { color: #aaa; width: 2.5rem; }
  .value { font-weight: 500; }
  .num { text-align: right; width: 6rem; color: #444; }
  .bar-col { width: 35%; padding-left: 0.75rem; }

  .bar {
    height: 12px;
    background: #86efac;
    border-radius: 2px;
    min-width: 2px;
  }

  .empty { color: #888; margin-top: 1rem; font-size: 0.9rem; }
</style>
