<script>
  let { title, children } = $props()
</script>

<section class="card">
  <h2>{title}</h2>
  {@render children()}
</section>

<style>
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    padding: 1.25rem 1.5rem;
  }

  h2 {
    margin: 0 0 1.25rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a3a5c;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.6rem;
  }
</style>
