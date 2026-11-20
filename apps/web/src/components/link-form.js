export const createForm = (baseUrl) => `
  <section class="panel span-7">
    <header><h2>Create a short link</h2><span class="meta">POST /api/v1/urls</span></header>
    <form id="create-form" novalidate>
      <div class="form-grid">
        <div class="field wide">
          <label for="create-url">Original URL</label>
          <input class="input" id="create-url" name="originalUrl" type="url" required placeholder="https://nodejs.org/en/learn" autocomplete="url">
        </div>
        <div class="field">
          <label for="create-alias">Custom alias <span class="meta">optional</span></label>
          <input class="input" id="create-alias" name="customAlias" type="text" minlength="3" maxlength="10" placeholder="docs-md">
        </div>
        <div class="field">
          <label for="create-expiry">Expires at <span class="meta">optional</span></label>
          <input class="input" id="create-expiry" name="expiresAt" type="datetime-local">
        </div>
      </div>
      <div class="preview">
        <span class="preview-label">Short URL</span>
        <span class="preview-url" id="preview-url">${baseUrl}/······</span>
      </div>
      <p class="form-error" id="create-error" role="alert"></p>
      <div class="form-actions">
        <button class="btn primary" type="submit" id="create-submit">Create link</button>
        <span class="meta">Six characters from a 62-character alphabet, or your alias.</span>
      </div>
      <p class="result" id="create-result" aria-live="polite"></p>
    </form>
  </section>`;
