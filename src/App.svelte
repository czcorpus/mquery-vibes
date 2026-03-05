<script>
  import { fetchCorpusInfo } from './lib/api.js'
  import Concordance from './sections/Concordance.svelte'
  import TokenFreqs from './sections/TokenFreqs.svelte'
  import TextTypeFreqs from './sections/TextTypeFreqs.svelte'
  import Collocations from './sections/Collocations.svelte'
  import CorpusInfo from './sections/CorpusInfo.svelte'

  const SECTIONS = [
    { id: 'concordance',    label: 'Concordance',         component: Concordance },
    { id: 'token-freqs',    label: 'Token Frequencies',   component: TokenFreqs },
    { id: 'text-types',     label: 'Text Type Freqs',     component: TextTypeFreqs },
    { id: 'collocations',   label: 'Collocations',        component: Collocations },
    { id: 'corpus-info',    label: 'Corpus Info',         component: CorpusInfo },
  ]

  let activeId = $state(SECTIONS[0].id)
  let corpusId = $state('syn2020')
  // 'ok' | 'error' | 'checking' | null
  let corpusStatus = $state(null)
  let corpusErrorMsg = $state('')

  const active = $derived(SECTIONS.find(s => s.id === activeId))

  async function checkCorpus() {
    if (!corpusId) { corpusStatus = null; return }
    corpusStatus = 'checking'
    const id = corpusId
    try {
      await fetchCorpusInfo(id)
      if (corpusId === id) corpusStatus = 'ok'
    } catch {
      if (corpusId === id) {
        corpusStatus = 'error'
        corpusErrorMsg = `Corpus "${id}" not found`
      }
    }
  }
</script>

<header>
  <div class="header-inner">
    <h1>MQuery Vibes</h1>
    <div class="corpus-selector">
      <label for="corpus-id">Corpus</label>
      <div class="corpus-input-wrap">
        <input
          id="corpus-id"
          type="text"
          bind:value={corpusId}
          oninput={() => corpusStatus = null}
          onblur={checkCorpus}
          placeholder="e.g. syn2020"
          class:input-ok={corpusStatus === 'ok'}
          class:input-error={corpusStatus === 'error'}
        />
        {#if corpusStatus === 'checking'}
          <span class="status-icon checking" title="Checking…">⋯</span>
        {:else if corpusStatus === 'ok'}
          <span class="status-icon ok" title="Corpus found">✓</span>
        {:else if corpusStatus === 'error'}
          <span class="status-icon error" title={corpusErrorMsg}>✗</span>
        {/if}
      </div>
      {#if corpusStatus === 'error'}
        <span class="corpus-error-msg">{corpusErrorMsg}</span>
      {/if}
    </div>
  </div>
</header>

<nav>
  {#each SECTIONS as section}
    <button
      class:active={activeId === section.id}
      onclick={() => activeId = section.id}
    >
      {section.label}
    </button>
  {/each}
</nav>

<main>
  {#each SECTIONS as section}
    <div hidden={activeId !== section.id}>
      <section.component {corpusId} />
    </div>
  {/each}
</main>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #f5f5f5;
    color: #1a1a1a;
  }

  header {
    background: #1a3a5c;
    color: white;
    padding: 0.75rem 1.5rem;
  }

  .header-inner {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .corpus-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .corpus-selector label {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .corpus-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .corpus-selector input {
    padding: 0.3rem 1.8rem 0.3rem 0.6rem;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 4px;
    background: rgba(255,255,255,0.15);
    color: white;
    font-size: 0.9rem;
    width: 12rem;
    transition: border-color 0.2s;
  }

  .corpus-selector input::placeholder {
    color: rgba(255,255,255,0.5);
  }

  .corpus-selector input.input-ok   { border-color: #4ade80; }
  .corpus-selector input.input-error { border-color: #f87171; }

  .status-icon {
    position: absolute;
    right: 0.45rem;
    font-size: 0.85rem;
    line-height: 1;
    pointer-events: none;
  }

  .status-icon.checking { color: rgba(255,255,255,0.6); letter-spacing: -0.1em; }
  .status-icon.ok       { color: #4ade80; }
  .status-icon.error    { color: #f87171; }

  .corpus-error-msg {
    font-size: 0.75rem;
    color: #fca5a5;
    margin-top: 0.25rem;
    display: block;
  }

  nav {
    background: #1a3a5c;
    border-top: 1px solid rgba(255,255,255,0.15);
    display: flex;
    gap: 0;
    max-width: 100%;
    padding: 0 1.5rem;
  }

  nav button {
    background: none;
    border: none;
    color: rgba(255,255,255,0.75);
    padding: 0.6rem 1.1rem;
    cursor: pointer;
    font-size: 0.875rem;
    border-bottom: 3px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }

  nav button:hover {
    color: white;
  }

  nav button.active {
    color: white;
    border-bottom-color: #6ab0f5;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
  }
</style>
