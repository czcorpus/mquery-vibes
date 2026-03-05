<script>
  import { fetchConcordance } from '../lib/api.js'
  import SectionCard from '../components/SectionCard.svelte'
  import LoadingSpinner from '../components/LoadingSpinner.svelte'
  import ErrorMessage from '../components/ErrorMessage.svelte'
  import { shared } from '../lib/shared.svelte.js'

  let { corpusId } = $props()
  let contextWidth = $state(10)
  let maxRows = $state(20)
  let rowsOffset = $state(0)
  let showTextProps = $state(false)

  let loading = $state(false)
  let error = $state(null)
  let lines = $state([])
  let concSize = $state(null)
  let ipm = $state(null)

  const kwicAttrNames = $derived((() => {
    for (const line of lines) {
      const tok = (line.text ?? []).find(t => t.type === 'token' && t.strong)
      if (tok?.attrs) return Object.keys(tok.attrs)
    }
    return []
  })())

  async function search() {
    if (!corpusId || !shared.query) return
    loading = true
    error = null
    lines = []
    concSize = null
    ipm = null
    try {
      const result = await fetchConcordance(corpusId, {
        q: shared.query,
        contextWidth,
        maxRows,
        rowsOffset,
        showTextProps: showTextProps ? 1 : 0,
      })
      lines = result.lines ?? []
      concSize = result.concSize ?? null
      ipm = result.ipm ?? null
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }

  function prev() {
    rowsOffset = Math.max(0, rowsOffset - maxRows)
    search()
  }

  function next() {
    rowsOffset = rowsOffset + maxRows
    search()
  }

  // Join a slice of text items into a plain string, respecting <g/> glue
  function joinTokens(items) {
    let out = ''
    let glue = true
    for (const item of items) {
      if (item.type === 'markup') {
        if (item.name === 'g') glue = true
      } else if (item.type === 'token') {
        if (!glue) out += ' '
        out += item.word
        glue = false
      }
    }
    return out
  }

  // Convert a KWIC slice into a flat list of renderable token objects
  function parseKwicItems(slice) {
    const result = []
    let needsSpace = false
    for (const item of slice) {
      if (item.type === 'markup' && item.name === 'g') {
        needsSpace = false
      } else if (item.type === 'token') {
        result.push({ word: item.word, attrs: Object.values(item.attrs ?? {}), needsSpace })
        needsSpace = true
      }
    }
    return result
  }

  function parseLine(line) {
    const tokens = line.text ?? []
    const firstStrong = tokens.findIndex(t => t.type === 'token' && t.strong)
    const lastStrong = tokens.findLastIndex(t => t.type === 'token' && t.strong)
    if (firstStrong === -1) {
      return { left: joinTokens(tokens), kwicItems: [], right: '' }
    }
    return {
      left: joinTokens(tokens.slice(0, firstStrong)),
      kwicItems: parseKwicItems(tokens.slice(firstStrong, lastStrong + 1)),
      right: joinTokens(tokens.slice(lastStrong + 1)),
    }
  }
</script>

<SectionCard title="Concordance">
  <form onsubmit={(e) => { e.preventDefault(); rowsOffset = 0; search() }}>
    <div class="form-grid">
      <label>
        Query (CQL)
        <input type="text" bind:value={shared.query} placeholder='[lemma="pes"]' required />
      </label>
      <label>
        Context width
        <input type="number" bind:value={contextWidth} min="1" max="50" />
      </label>
      <label>
        Max rows
        <input type="number" bind:value={maxRows} min="1" max="200" />
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showTextProps} />
        Show text properties
      </label>
    </div>
    <div class="form-actions">
      <button type="submit">Search</button>
    </div>
  </form>

  {#if loading}
    <LoadingSpinner />
  {:else if error}
    <ErrorMessage message={error} />
  {:else if lines.length > 0}
    <div class="results-header">
      <span class="total">
        {#if concSize != null}
          {concSize.toLocaleString()} hits
          {#if ipm != null}
            &nbsp;·&nbsp; {ipm.toFixed(2)} ipm
          {/if}
        {/if}
      </span>
      <div class="pagination">
        <button onclick={prev} disabled={rowsOffset === 0}>← Prev</button>
        <span>rows {rowsOffset + 1}–{rowsOffset + lines.length}</span>
        <button onclick={next}>Next →</button>
      </div>
    </div>

    <table class="kwic-table">
      <thead>
        <tr>
          <th class="col-ref">Ref</th>
          <th class="col-left">Left context</th>
          <th class="col-kwic">KWIC{#if kwicAttrNames.length} <span class="kwic-attr-names">({kwicAttrNames.join(', ')})</span>{/if}</th>
          <th class="col-right">Right context</th>
          {#if showTextProps}<th class="col-props">Properties</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each lines as line, i}
          {@const parsed = parseLine(line)}
          <tr class:even={i % 2 === 0}>
            <td class="col-ref">{line.ref ?? ''}</td>
            <td class="col-left">{parsed.left}</td>
            <td class="col-kwic">
              {#each parsed.kwicItems as tok}
                {#if tok.needsSpace}<span class="kwic-space"> </span>{/if}<span class="kwic-token"
                  ><span class="kwic-word">{tok.word}</span>{#each tok.attrs as val}<span class="kwic-sep"> / </span><span class="kwic-attr">{val}</span>{/each}</span>
              {/each}
            </td>
            <td class="col-right">{parsed.right}</td>
            {#if showTextProps}
              <td class="col-props">
                {#if line.props}
                  {#each Object.entries(line.props) as [k, v]}
                    <span class="prop"><b>{k}:</b> {v}</span>
                  {/each}
                {/if}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if lines.length === 0 && !loading && concSize !== null}
    <p class="empty">No results found.</p>
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

  label input[type="text"] { width: 22rem; }
  label input[type="number"] { width: 6rem; }

  input[type="text"],
  input[type="number"] {
    padding: 0.4rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    font-size: 0.9rem;
  }

  input[type="text"] {
    font-family: monospace;
    font-size: 1rem;
  }

  .checkbox-label {
    flex-direction: row;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
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

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #555;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pagination button {
    padding: 0.25rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .kwic-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    table-layout: fixed;
  }

  .kwic-table th {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #888;
    border-bottom: 2px solid #e5e7eb;
  }

  .kwic-table td {
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tr.even td { background: #fafafa; }

  .col-ref {
    width: 7rem;
    color: #aaa;
    font-size: 0.75rem;
  }

  .col-left {
    text-align: right;
    color: #555;
    width: 33%;
  }

  .col-kwic {
    text-align: center;
    width: 20rem;
    white-space: nowrap;
  }

  .kwic-attr-names { font-weight: 400; opacity: 0.7; }

  .kwic-token { display: inline; }
  .kwic-word  { font-weight: 700; color: #1a3a5c; }
  .kwic-sep   { color: #bbb; font-weight: 400; }
  .kwic-attr  { color: #777; font-weight: 400; font-size: 0.8rem; }

  .col-right {
    text-align: left;
    color: #555;
    width: 33%;
  }

  .col-props {
    font-size: 0.78rem;
    color: #666;
    width: 14rem;
  }

  .prop {
    display: block;
  }

  .empty {
    color: #888;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
</style>
