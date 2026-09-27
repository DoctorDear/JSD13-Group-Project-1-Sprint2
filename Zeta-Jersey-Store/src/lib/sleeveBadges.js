export const SLEEVE_BADGES = [
  { id: 'none', label: 'None', price: 0 },
  { id: 'premier-league', label: 'Premier League', price: 450 },
  { id: 'premier-league-racism', label: 'Premier League + No Room for Racism', price: 850 },
];

export function getSleeveBadge(id = 'none') {
  const badge = SLEEVE_BADGES.find((entry) => entry.id === id);
  if (!badge) throw new Error('Invalid sleeve badge');
  return badge;
}
