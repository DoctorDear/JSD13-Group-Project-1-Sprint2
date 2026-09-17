const leagues = [
  {
    id: 1,
    name: "Premier League",
    image:
      "https://s.yimg.com/lo/mysterio/api/3aca8cc4f6d96c273f4c4937c232083d3b14ee7b5fd2e4dd34005dc8a7cf50ee/lightyear_networkapi/resizefill_w960%3Bquality_80%3Bformat_webp/https%3A%2F%2Fmedia.zenfs.com%2Fen%2Fthe_football_faithful_articles_458%2F8272d1245b72b55420f0911736e58059",
    href: "#",
  },
  {
    id: 2,
    name: "La Liga",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8Ztap1ynqb07jQFqUKJew5FZp_J-HuvkZMu7mxGnxNVGis9hnrKtEdE8&s=10",
    href: "#",
  },
  {
    id: 3,
    name: "Serie A",
    image:
      "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2022%2F07%2Fnike-inter-milan-serie-a-2022-23-home-kit-4.jpg?q=90&w=800&cbr=1&fit=max",
    href: "#",
  },
  {
    id: 4,
    name: "Bundesliga",
    image:
      "https://preview.redd.it/fc-bayern-25-26-ucl-jersey-v0-clb17cc72kgf1.jpg?width=1080&crop=smart&auto=webp&s=a421cb15d430f73c327e3e50843a96e3c0994edf",
    href: "#",
  },
];

const LeagueCard = () => {
  return (
    <section className="px-4 py-8">
      <h2 className="text-3xl text-black font-bold tracking-tight mb-6">
        Shop by League
      </h2>
      <div>
        {/* League Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
          {leagues.map((league) => (
            <a
              key={league.id}
              href={league.href}
              className="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex items-end p-6"
            >
              <img
                src={league.image}
                alt={league.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/80" />
              <div className="relative z-20 transition-transform duration-300 group-hover:translate-x-1">
                <span className="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                  League
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                  {league.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeagueCard;
