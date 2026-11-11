import korenckovaJuha from '../assets/photos/korenckova-juha.jpg';
import palacinke from '../assets/photos/palacinke.jpg';
import testenine from '../assets/photos/testenine-s-paradiznikovo-omako.jpg';

// Photos exist only for the demo recipes from the seed script (sources in README).
const PHOTOS = {
  'korenčkova juha': korenckovaJuha,
  'palačinke': palacinke,
  'testenine s paradižnikovo omako': testenine,
};

const CATEGORY_ILLUSTRATIONS = {
  'Zajtrk': { icon: 'sun', tone: 'honey' },
  'Glavne jedi': { icon: 'pot', tone: 'terracotta' },
  'Juhe': { icon: 'bowl', tone: 'carrot' },
  'Solate': { icon: 'leaf', tone: 'sage' },
  'Sladice': { icon: 'cake', tone: 'berry' },
  'Prigrizki': { icon: 'cookie', tone: 'cocoa' },
};

const DEFAULT_ILLUSTRATION = { icon: 'plate', tone: 'olive' };

/** Picks a photo for known demo recipes, otherwise an illustration of the recipe's category. */
export function recipeVisual(recipe) {
  const title = recipe.title.trim();
  const src = PHOTOS[title.toLocaleLowerCase('sl')];
  if (src) return { kind: 'photo', src, alt: `Fotografija jedi: ${title}` };

  return { kind: 'illustration', ...(CATEGORY_ILLUSTRATIONS[recipe.category.name] ?? DEFAULT_ILLUSTRATION) };
}
