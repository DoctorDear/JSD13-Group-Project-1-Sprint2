export const EUROPEAN_LEAGUES = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
];

export const THAI_LEAGUES = ["Thai League 1"];

export function filterProductsByLeagues(products, leagues) {
  const includedLeagues = new Set(leagues.map((league) => league.trim().toLowerCase()));

  return products.filter((product) =>
    includedLeagues.has(String(product.category || product.league || "").trim().toLowerCase()),
  );
}
