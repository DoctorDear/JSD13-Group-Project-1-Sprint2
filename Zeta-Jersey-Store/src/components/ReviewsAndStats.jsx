const reviews = [
  ["P", "Ploy S.", "Beautiful jersey, excellent quality for the price", "5.0"],
  ["T", "Tee K.", "Fast delivery and great packaging", "4.9"],
  ["M", "Mint N.", "Perfect fit and accurate color", "4.8"],
];
const stats = [["1,280", "Total reviews"], ["4.9", "Rating"], ["96%", "Recommend store"], ["32", "Products"]];

function ReviewsAndStats() {
  return (
    <section className="mt-12 grid gap-8 xl:grid-cols-[1fr_1.08fr]">
      <div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-zeta-muted">OUR COLLECTION</p>
            <h2 className="mt-1 text-2xl font-black">Account Ranking</h2>
          </div>
          <span className="badge badge-outline border-zeta-main-lighter text-xs">This month</span>
        </div>
        <div className="rounded-2xl border border-zeta-main-lighter bg-white px-5">
          {reviews.map(([initial, name, quote, score]) => (
            <div key={name} className="flex items-center gap-3 border-b border-zeta-main-lighter py-4 last:border-0">
              <div className="grid size-9 place-items-center rounded-full bg-zeta-sub-lighter text-xs font-black text-zeta-sub-dark">{initial}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{name}</p>
                <p className="truncate text-xs text-zeta-muted">{quote}</p>
              </div>
              <span className="text-xs font-bold text-yellow-600">★ {score}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-zeta-muted">STATS</p>
            <h2 className="mt-1 text-2xl font-black">Your Latest Reviews</h2>
          </div>
          <button className="btn btn-ghost btn-sm text-zeta-muted">View all reviews →</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-zeta-sub-lighter p-4">
              <p className="text-xl font-black text-zeta-sub-dark">{value}</p>
              <p className="mt-2 text-xs font-semibold text-zeta-sub-dark/70">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReviewsAndStats;
