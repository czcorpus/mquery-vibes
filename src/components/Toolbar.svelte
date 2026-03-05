<script>
  const url = import.meta.env.VITE_TOOLBAR_URL

  async function fetchToolbar() {
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`Toolbar fetch failed: ${resp.status}`)
    const data = await resp.json()

    if (data.styles) {
      for (const entry of Object.values(data.styles)) {
        if (!entry.url) continue
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = entry.url
        document.head.appendChild(link)
      }
    }

    return data.html ?? ''
  }
</script>

{#if url}
  <div class="toolbar-bar">
    {#await fetchToolbar()}
      <!-- loading silently -->
    {:then html}
      {@html html}
    {:catch}
      <!-- toolbar unavailable, render nothing -->
    {/await}
  </div>
{/if}

<style>
  .toolbar-bar {
    height: 40px;
    overflow: hidden;
    width: 100%;
  }
</style>
