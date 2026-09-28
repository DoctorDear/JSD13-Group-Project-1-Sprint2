import heroImages from '../../data/heroImages.json' with { type: 'json' };

const imageOrigin = new URL(heroImages[0].url).origin;

export function getCardImage(source, useOriginal = false) {
  if (!source || useOriginal) return { src: source };
  try {
    const url = new URL(source);
    if (url.origin !== imageOrigin || url.search || url.hash) return { src: source };
    return {
      src: `${source}.thumb-640.webp`,
      srcSet: `${source}.thumb-320.webp 320w, ${source}.thumb-640.webp 640w`,
      sizes: '290px',
    };
  } catch {
    return { src: source };
  }
}
