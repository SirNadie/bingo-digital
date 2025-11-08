export const formatCredits = (value: number, options?: { showSign?: boolean }) => {
  const absolute = Math.abs(value).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = options?.showSign ? (value >= 0 ? "+" : "-") : "";
  return `${prefix}${absolute} cr`;
};
