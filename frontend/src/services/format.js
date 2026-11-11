const quantityFormat = new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 2 });

export const formatQuantity = (value) => quantityFormat.format(value);

// Slovenian has singular, dual and two plural forms (1 porcija, 2 porciji, 3 porcije, 5 porcij).
function pluralize(n, [one, two, few, many]) {
  const mod = n % 100;
  if (mod === 1) return `${n} ${one}`;
  if (mod === 2) return `${n} ${two}`;
  if (mod === 3 || mod === 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

export const formatServings = (n) => pluralize(n, ['porcija', 'porciji', 'porcije', 'porcij']);

export const formatRecipeCount = (n) => pluralize(n, ['recept', 'recepta', 'recepti', 'receptov']);

/**
 * Splits instructions into steps: one step per line, or per sentence when the
 * author wrote a single paragraph. A sentence ends with . ! or ? followed by a capital.
 */
export function splitSteps(text) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 1) return lines;
  return lines[0].split(/(?<=[.!?])\s+(?=\p{Lu})/u);
}
