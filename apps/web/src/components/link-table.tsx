import { escapeHtml } from "../lib/dom";
import { formatDate, statusOf } from "../lib/format";
import { statusPill } from "./status-pill";

interface LinkTableProps {
  links: Array<{
    id: string;
    originalUrl: string;
    shortCode: string;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  compact?: boolean;
  empty?: string;
}

export const LinkTable: React.FC<LinkTableProps> = ({ links, compact = false, empty = "No links in this view." }) => {
  if (!links.length) {
    return (
      <div className="empty grid place-items-center min-h-24 p-4 border-2 border-dashed border-control rounded-3xl text-muted text-center">
        {escapeHtml(empty)}
        <span className="hint block text-faint text-xs mt-1">Create a link or try another filter.</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="table-wrap overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Link</th>
              <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Status</th>
              <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Expires</th>
              <th scope="col" className="n h-9 px-3 text-right font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Created</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id}>
                <td className="primary-cell p-3.5 min-h-[14px] border-b border-rule align-middle" data-label="Link">
                  <a className="truncate block max-w-[32ch] overflow-hidden text-ellipsis whitespace-nowrap" href={`#/links/${escapeHtml(link.id)}`}>
                    {escapeHtml(link.originalUrl)}
                  </a>
                  <span className="sub block text-xs text-muted mt-0.5">{escapeHtml(link.shortCode)}</span>
                </td>
                <td data-label="Status" className="p-3.5 min-h-[14px] border-b border-rule align-middle">
                  {statusPill(statusOf(link))}
                </td>
                <td data-label="Expires" className="p-3.5 min-h-[14px] border-b border-rule align-middle">
                  {formatDate(link.expiresAt)}
                </td>
                <td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right" data-label="Created">
                  {formatDate(link.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrap overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Link</th>
            <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Short code</th>
            <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Status</th>
            <th scope="col" className="h-9 px-3 text-left font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Expires</th>
            <th scope="col" className="n h-9 px-3 text-right font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Created</th>
            <th scope="col" className="n h-9 px-3 text-right font-400 text-xs text-muted border-b border-rule whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td className="primary-cell p-3.5 min-h-[14px] border-b border-rule align-middle" data-label="Link">
                <a className="truncate block max-w-[32ch] overflow-hidden text-ellipsis whitespace-nowrap" href={`#/links/${escapeHtml(link.id)}`}>
                  {escapeHtml(link.originalUrl)}
                </a>
              </td>
              <td data-label="Short code" className="p-3.5 min-h-[14px] border-b border-rule align-middle">
                <span className="code font-mono text-xs text-white">{escapeHtml(link.shortCode)}</span>
              </td>
              <td data-label="Status" className="p-3.5 min-h-[14px] border-b border-rule align-middle">
                {statusPill(statusOf(link))}
              </td>
              <td data-label="Expires" className="p-3.5 min-h-[14px] border-b border-rule align-middle">
                {formatDate(link.expiresAt)}
              </td>
              <td className="n num p-3.5 min-h-[14px] border-b border-rule align-middle text-right" data-label="Created">
                {formatDate(link.createdAt)}
              </td>
              <td className="n row-actions-cell p-3.5 min-h-[14px] border-b border-rule align-middle text-right" data-label="Actions">
                <div className="row-actions flex gap-1 justify-end">
                  <button
                    className="icon-btn w-7.5 h-7.5 inline-grid place-items-center p-0 border-0 rounded-sm bg-transparent text-muted cursor-pointer transition-all hover:bg-raised hover:text-white"
                    data-action="copy"
                    data-id={escapeHtml(link.id)}
                    aria-label={`Copy short URL for ${escapeHtml(link.shortCode)}`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true" className="w-3.75 h-3.75 stroke-1.5"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 5H5a2 2 0 0 0-2 2v8"/></svg>
                  </button>
                  <button
                    className="icon-btn w-7.5 h-7.5 inline-grid place-items-center p-0 border-0 rounded-sm bg-transparent text-muted cursor-pointer transition-all hover:bg-raised hover:text-white"
                    data-action="edit"
                    data-id={escapeHtml(link.id)}
                    aria-label={`Edit ${escapeHtml(link.shortCode)}`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true" className="w-3.75 h-3.75 stroke-1.5"><path d="M13.5 3.5 16.5 6.5M3 17l3.5-.8L16 6.7a2 2 0 0 0-2.8-2.8L3.7 13.4 3 17Z"/></svg>
                  </button>
                  <button
                    className="icon-btn w-7.5 h-7.5 inline-grid place-items-center p-0 border-0 rounded-sm bg-transparent text-muted cursor-pointer transition-all hover:bg-raised hover:text-white"
                    data-action="delete"
                    data-id={escapeHtml(link.id)}
                    aria-label={`Delete ${escapeHtml(link.shortCode)}`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true" className="w-3.75 h-3.75 stroke-1.5"><path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6M8.5 9v4M11.5 9v4"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
