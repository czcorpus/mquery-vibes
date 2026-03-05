<script>
  let { message } = $props()
</script>

{#if message}
  <div class="error">
    <strong>Error:</strong> {message}
  </div>
{/if}

<style>
  .error {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    color: #b91c1c;
    padding: 0.75rem 1rem;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
</style>
