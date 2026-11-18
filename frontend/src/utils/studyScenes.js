/**
 * Study Room background scene registry.
 *
 * Imports the image assets, so unlike constants.js this module must stay
 * out of reach of the plain-node test suite (Vite resolves the imports).
 */
import nightArt from '../assets/study-room-night.webp';
import sakuraArt from '../assets/study-room-sakura.webp';
import sunnyArt from '../assets/study-room-sunny.webp';

/**
 * ratio  — intrinsic artwork aspect ratio, used for the cover-fit sizing
 * cover  — ratio as a number, used for the cover width calculation (w/h * 100cqh)
 * overlay— which ambient motion layer the scene supports
 */
export const STUDY_SCENES = [
  {
    id: 'night',
    name: 'Night Study',
    desc: 'Starry city skyline with gentle snowfall.',
    art: nightArt,
    ratio: '780 / 438',
    cover: 1.78082,
    overlay: 'snow',
    toggleLabel: 'Snow',
    toggleIcon: 'fa-snowflake',
    alt: 'A late-night desk framed by bookshelves, overlooking a city through a starry window.'
  },
  {
    id: 'sakura',
    name: 'Sakura Study',
    desc: 'Pink blossoms, drifting petals, gentle spring breeze.',
    art: sakuraArt,
    ratio: '744 / 593',
    cover: 1.25464,
    overlay: 'petals',
    toggleLabel: 'Petals',
    toggleIcon: 'fa-spa',
    alt: 'A girl studying at a wooden desk by a large window, cherry blossom trees in bloom outside.'
  },
  {
    id: 'sunny',
    name: 'Sunny Afternoon Study',
    desc: 'Golden sunlight, cozy desk, greenery and moving curtains.',
    art: sunnyArt,
    ratio: '782 / 607',
    cover: 1.28830,
    overlay: 'breeze',
    toggleLabel: 'Breeze',
    toggleIcon: 'fa-wind',
    alt: 'A girl writing in a notebook at a cozy desk while afternoon sunlight streams through the window.'
  }
];

export const DEFAULT_SCENE_ID = 'night';

/** Returns the scene for an id, falling back to the default scene. */
export function resolveScene(sceneId) {
  return STUDY_SCENES.find((scene) => scene.id === sceneId) ?? STUDY_SCENES[0];
}
