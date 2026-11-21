export const Dialogs = () => (
  <>
    <dialog id="edit-dialog" className="w-[min(440px,calc(100vw-32px))] p-5.5 rounded-card bg-surface text-white border-0">
      <form id="edit-form" noValidate>
        <h2 className="text-section font-600 mb-2">Edit link</h2>
        <p className="text-muted mb-4.5">Change the destination or the expiry. The short code stays the same.</p>
        <div className="field grid gap-2">
          <label htmlFor="edit-url" className="text-body font-500">Original URL</label>
          <input className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white" id="edit-url" type="url" required />
        </div>
        <div className="field grid gap-2 mt-3.5">
          <label htmlFor="edit-expiry" className="text-body font-500">
            Expires at <span className="meta">leave empty for no expiry</span>
          </label>
          <input className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white" id="edit-expiry" type="datetime-local" />
        </div>
        <p className="form-error text-negative text-xs min-h-[18px]" id="edit-error" role="alert"></p>
        <div className="dialog-actions flex justify-end gap-2 mt-5">
          <button className="btn" type="button" data-action="close-dialog">Cancel</button>
          <button className="btn primary" type="submit">Save changes</button>
        </div>
      </form>
    </dialog>

    <dialog id="delete-dialog" className="w-[min(440px,calc(100vw-32px))] p-5.5 rounded-card bg-surface text-white border-0">
      <h2 className="text-section font-600 mb-2">Delete this link</h2>
      <p id="delete-copy" className="text-muted mb-4.5">This soft-deletes the record. The short code stays reserved.</p>
      <div className="dialog-actions flex justify-end gap-2 mt-5">
        <button className="btn" type="button" data-action="close-dialog">Cancel</button>
        <button className="btn danger" type="button" data-action="confirm-delete">Delete link</button>
      </div>
    </dialog>
  </>
);
