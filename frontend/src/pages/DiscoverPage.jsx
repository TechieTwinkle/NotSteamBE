import { useMemo, useState } from "react";
import GameTile from "../components/GameTile";

const DiscoverPage = ({ games, loading }) => {
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("new");
  const [search, setSearch] = useState("");

  const genres = useMemo(() => ["all", ...new Set(games.map((game) => game.genre))], [games]);

  const filtered = useMemo(() => {
    const base = games.filter((game) => {
      const genreMatch = genre === "all" || game.genre === genre;
      const searchMatch = game.title.toLowerCase().includes(search.toLowerCase());
      return genreMatch && searchMatch;
    });

    if (sort === "popular") {
      return [...base].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    return [...base].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [games, genre, search, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title" className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
          {genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
          <option value="new">New</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      {loading ? <p className="text-zinc-400">Loading games...</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((game, index) => <GameTile key={game._id} game={game} index={index} />)}
      </div>
    </div>
  );
};

export default DiscoverPage;

