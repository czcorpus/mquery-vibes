<script>
  import { fetchCollocations } from '../lib/api.js'
  import SectionCard from '../components/SectionCard.svelte'
  import LoadingSpinner from '../components/LoadingSpinner.svelte'
  import ErrorMessage from '../components/ErrorMessage.svelte'
  import { shared } from '../lib/shared.svelte.js'

  let { corpusId } = $props()
  let measure = $state('logDice')
  let srchLeft = $state(5)
  let srchRight = $state(5)
  let minCollFreq = $state(3)
  let maxItems = $state(20)

  const MEASURES = ['logDice', 'MI', 'MI3', 't-score', 'log-likelihood']

  let loading = $state(false)
  let error = $state(null)
  let items = $state([])

  async function search() {
    if (!corpusId || !shared.query) return
    loading = true
    error = null
    items = []
    try {
      const result = await fetchCollocations(corpusId, {
        q: shared.query,
        measure,
        srchLeft,
        srchRight,
        minCollFreq,
        maxItems,
      })
      items = Array.isArray(result) ? result : (result.colls ?? result.data ?? [])
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }
</script>

<SectionCard title="Collocations">
  <form onsubmit={(e) => { e.preventDefault(); search() }}>
    <div class="form-grid">
      <label>
        Query (CQL)
        <input type="text" bind:value={shared.query} placeholder='[lemma="run"]' required />
      </label>
      <label>
        Measure
        <select bind:value={measure}>
          {#each MEASURES as m}
            <option value={m}>{m}</option>
          {/each}
        </select>
      </label>
      <label>
        Left range
        <input type="number" bind:value={srchLeft} min="1" max="10" />
      </label>
      <label>
        Right range
        <input type="number" bind:value={srchRight} min="1" max="10" />
      </label>
      <label>
        Min coll. freq
        <input type="number" bind:value={minCollFreq} min="1" />
      </label>
      <label>
        Max items
        <input type="number" bind:value={maxItems} min="1" max="500" />
      </label>
    </div>
    <div class="form-actions">
      <button type="submit">Get Collocations</button>
    </div>
  </form>

  {#if loading}
    <LoadingSpinner />
  {:else if error}
    <ErrorMessage message={error} />
  {:else if items.length > 0}
    <table class="coll-table">
      <thead>
        <tr>
          <th class="rank">#</th>
          <th>Collocate</th>
          <th class="num">{measure}</th>
          <th class="num">Freq</th>
          <th class="num">Co-freq</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item, i}
          <tr>
            <td class="rank">{i + 1}</td>
            <td class="value">{item.word ?? item.collocate ?? item.str ?? ''}</td>
            <td class="num score">{
              (item.score ?? item.value ?? item.logDice ?? item.mi ?? 0).toFixed(3)
            }</td>
            <td class="num">{(item.freq ?? 0).toLocaleString()}</td>
            <td class="num">{(item.coFreq ?? item.cooccFreq ?? item.collFreq ?? '—')}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if !loading && error === null}
    <p class="empty">No results yet. Enter a query and click "Get Collocations".</p>
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

  input, select {
    padding: 0.4rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 0.9rem;
    background: white;
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

  .coll-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-size: 0.875rem;
  }

  .coll-table th {
    text-align: left;
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #888;
    border-bottom: 2px solid #e5e7eb;
  }

  .coll-table td {
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .rank { color: #aaa; width: 2.5rem; }
  .value { font-weight: 500; }
  .num { text-align: right; width: 7rem; color: #444; }
  .score { color: #1a3a5c; font-weight: 600; }

  .empty { color: #888; margin-top: 1rem; font-size: 0.9rem; }
</style>
