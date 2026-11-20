export const statusPill = (status) => {
  const label = status === "active" ? "Active" : status === "expired" ? "Expired" : "Inactive";
  const tone = status === "active" ? "pos" : status === "expired" ? "warn" : "neg";
  return `<span class="pill ${tone}">${label}</span>`;
};
