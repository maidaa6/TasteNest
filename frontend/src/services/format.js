const quantityFormat = new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 2 });

export const formatQuantity = (value) => quantityFormat.format(value);

// Slovenian has singular, dual and two plural forms (1 porcija, 2 porciji, 3 porcije, 5 porcij).
export function formatServings(n) {
  const mod = n % 100;
  if (mod === 1) return `${n} porcija`;
  if (mod === 2) return `${n} porciji`;
  if (mod === 3 || mod === 4) return `${n} porcije`;
  return `${n} porcij`;
}
