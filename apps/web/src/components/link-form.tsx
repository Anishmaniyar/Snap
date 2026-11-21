interface LinkFormProps {
  baseUrl: string;
  onSubmit?: (e: React.FormEvent) => void;
  onInput?: () => void;
  alias?: string;
  url?: string;
  expiry?: string;
  error?: string;
  result?: string;
  resultClass?: string;
  submitDisabled?: boolean;
}

export const CreateForm: React.FC<LinkFormProps> = ({
  baseUrl,
  onSubmit,
  alias = "",
  url = "",
  expiry = "",
  error = "",
  result = "",
  resultClass = "result",
  submitDisabled = false,
}) => (
  <section className="panel span-7">
    <header className="flex items-baseline justify-between gap-3 mb-4.5">
      <h2 className="text-section leading-1.3 font-600">Create a short link</h2>
      <span className="meta text-faint text-xs">POST /api/v1/urls</span>
    </header>
    <form id="create-form" noValidate onSubmit={onSubmit} className="">
      <div className="form-grid grid grid-cols-[1fr_1fr] gap-3.5">
        <div className="field wide grid gap-2 grid-col-1 grid-row-1 min-w-0">
          <label htmlFor="create-url" className="text-body font-500">Original URL</label>
          <input
            className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white min-w-0 placeholder-faint"
            id="create-url"
            name="originalUrl"
            type="url"
            required
            placeholder="https://nodejs.org/en/learn"
            autoComplete="url"
            defaultValue={url}
          />
        </div>
        <div className="field grid gap-2 min-w-0">
          <label htmlFor="create-alias" className="text-body font-500">
            Custom alias <span className="meta">optional</span>
          </label>
          <input
            className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white min-w-0"
            id="create-alias"
            name="customAlias"
            type="text"
            minLength={3}
            maxLength={10}
            placeholder="docs-md"
            defaultValue={alias}
          />
        </div>
        <div className="field grid gap-2 min-w-0">
          <label htmlFor="create-expiry" className="text-body font-500">
            Expires at <span className="meta">optional</span>
          </label>
          <input
            className="input w-full h-[38px] px-3 border border-control rounded-lg bg-ground text-white min-w-0"
            id="create-expiry"
            name="expiresAt"
            type="datetime-local"
            defaultValue={expiry}
          />
        </div>
      </div>
      <div className="preview flex items-center gap-2.5 flex-wrap mt-3.5 p-3 bg-raised rounded-2xl">
        <span className="preview-label text-faint text-xs">Short URL</span>
        <span className="preview-url text-accent text-body break-anywhere">{baseUrl}/{alias ? alias : "······"}</span>
      </div>
      <p className="form-error text-negative text-xs min-h-[18px]" id="create-error" role="alert">
        {error}
      </p>
      <div className="form-actions flex items-center gap-2.5 mt-4.5 flex-wrap">
        <button className="btn primary" type="submit" id="create-submit" disabled={submitDisabled}>
          Create link
        </button>
        <span className="meta text-faint text-xs">Six characters from a 62-character alphabet, or your alias.</span>
      </div>
      <p className={`result mt-2.5 min-h-[20px] text-body ${resultClass}`} id="create-result" aria-live="polite">
        {result}
      </p>
    </form>
  </section>
);
