export const formatCurrency = (value: string, currency = "USD") => {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(numeric);
};
