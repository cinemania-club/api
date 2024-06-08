export function normalizeRating(stars: number, min: number, max: number) {
  return (4 * (stars - min)) / (max - min) + 1;
}
