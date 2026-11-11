import Icon from './Icon.jsx';
import { recipeVisual } from '../services/recipeVisual.js';

/** Photo of a demo recipe or a decorative illustration of its category. */
export default function RecipeImage({ recipe, className = '', eager = false }) {
  const visual = recipeVisual(recipe);

  if (visual.kind === 'photo') {
    return (
      <div className={`recipe-image ${className}`}>
        <img src={visual.src} alt={visual.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    );
  }

  return (
    <div className={`recipe-image recipe-illustration tone-${visual.tone} ${className}`} aria-hidden="true">
      <Icon name={visual.icon} size={64} strokeWidth={1.3} />
    </div>
  );
}
