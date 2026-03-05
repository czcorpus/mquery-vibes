<div class="spinner-wrap">
  <span class="spinner"></span>
  <span class="label">Loading…</span>
</div>

<style>
  .spinner-wrap {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: #555;
    font-size: 0.9rem;
    margin-top: 1rem;
  }

  .spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid #ccc;
    border-top-color: #1a3a5c;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
