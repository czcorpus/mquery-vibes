<script>
  import { fetchCorpusInfo } from '../lib/api.js'
  import SectionCard from '../components/SectionCard.svelte'
  import LoadingSpinner from '../components/LoadingSpinner.svelte'
  import ErrorMessage from '../components/ErrorMessage.svelte'

  let { corpusId } = $props()

  let loading = $state(false)
  let error = $state(null)
  let info = $state(null)

  $effect(() => { load(corpusId) })

  async function load(id) {
    if (!id) return
    loading = true
    error = null
    info = null
    try {
      const result = await fetchCorpusInfo(corpusId)
      info = result?.corpus?.data ?? null
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }
</script>

<SectionCard title="Corpus Info">
  {#if loading}
    <LoadingSpinner />
  {:else if error}
    <ErrorMessage message={error} />
  {:else if info}
    <dl class="info-grid">
      <dt>Name</dt>
      <dd>{info.corpname ?? corpusId}</dd>

      {#if info.description}
        <dt>Description</dt>
        <dd>{info.description}</dd>
      {/if}

      {#if info.size != null}
        <dt>Size (tokens)</dt>
        <dd>{info.size.toLocaleString()}</dd>
      {/if}

      {#if info.textProperties?.length}
        <dt>Text properties</dt>
        <dd>{info.textProperties.join(', ')}</dd>
      {/if}
    </dl>

    {#if info.attrList?.length}
      <h3 class="section-heading">Positional attributes</h3>
      <table class="attr-table">
        <thead>
          <tr><th>Name</th><th class="num">Unique values</th></tr>
        </thead>
        <tbody>
          {#each info.attrList as attr}
            <tr>
              <td class="name">{attr.name}</td>
              <td class="num">{attr.size.toLocaleString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    {#if info.structList?.length}
      <h3 class="section-heading">Structures</h3>
      <table class="attr-table">
        <thead>
          <tr><th>Name</th><th class="num">Count</th></tr>
        </thead>
        <tbody>
          {#each info.structList as struct}
            <tr>
              <td class="name">{struct.name}</td>
              <td class="num">{struct.size.toLocaleString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/if}
</SectionCard>

<style>
  .info-grid {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.4rem 1.5rem;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  dt {
    font-weight: 600;
    color: #555;
  }

  dd { margin: 0; }

  .section-heading {
    font-size: 0.8rem;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 1.25rem 0 0.4rem;
  }

  .attr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .attr-table th {
    text-align: left;
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #888;
    border-bottom: 2px solid #e5e7eb;
  }

  .attr-table td {
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .name { font-family: monospace; font-size: 0.85rem; }
  .num { text-align: right; width: 10rem; color: #555; }
</style>
