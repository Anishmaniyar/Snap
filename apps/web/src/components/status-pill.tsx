interface StatusPillProps {
  status: string;
}

export const statusPill = (status: string) => {
  const label = status === "active" ? "Active" : status === "expired" ? "Expired" : "Inactive";
  const tone = status === "active" ? "pos" : status === "expired" ? "warn" : "neg";
  return (
    <span className={`pill inline-flex items-center h-[22px] px-2.25 rounded-full text-xs font-500 whitespace-nowrap ${tone === "pos" ? "bg-pill-positive-bg text-pill-positive-ink" : tone === "neg" ? "bg-pill-negative-bg text-pill-negative-ink" : tone === "warn" ? "bg-pill-warning-bg text-pill-warning-ink" : "bg-pill-neutral-bg text-pill-neutral-ink"}`}>
      {label}
    </span>
  );
};
