export const dialogs = () => `
  <dialog id="edit-dialog">
    <form id="edit-form" novalidate>
      <h2>Edit link</h2>
      <p>Change the destination or the expiry. The short code stays the same.</p>
      <div class="field">
        <label for="edit-url">Original URL</label>
        <input class="input" id="edit-url" type="url" required>
      </div>
      <div class="field" style="margin-top:14px">
        <label for="edit-expiry">Expires at <span class="meta">leave empty for no expiry</span></label>
        <input class="input" id="edit-expiry" type="datetime-local">
      </div>
      <p class="form-error" id="edit-error" role="alert"></p>
      <div class="dialog-actions">
        <button class="btn" type="button" data-action="close-dialog">Cancel</button>
        <button class="btn primary" type="submit">Save changes</button>
      </div>
    </form>
  </dialog>

  <dialog id="delete-dialog">
    <h2>Delete this link</h2>
    <p id="delete-copy">This soft-deletes the record. The short code stays reserved.</p>
    <div class="dialog-actions">
      <button class="btn" type="button" data-action="close-dialog">Cancel</button>
      <button class="btn danger" type="button" data-action="confirm-delete">Delete link</button>
    </div>
  </dialog>`;
