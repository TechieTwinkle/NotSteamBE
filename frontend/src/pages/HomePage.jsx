import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import GameTile from "../components/GameTile";

const HomePage = ({ stats, games = [], loading }) => {
  const { user } = useAuth();
  const featuredGames = games.slice(0, 6);

  return (
    <div className="space-y-16">
      <section className="grid gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:grid-cols-[1.3fr_0.9fr] md:p-12">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
            Where indie games find their people.
          </motion.h1>
          <p className="mt-5 max-w-xl text-sm text-zinc-300 sm:text-base">Explore deployed builds, read developer wikis, and share feedback that shapes the games you love.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {!user && <Link to="/signup" className="rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-black">Join</Link>}
            <Link to="/discover" className="rounded-xl border border-zinc-700 px-5 py-3 text-center hover:border-orange-300">Browse games</Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <p className="text-3xl font-black text-orange-300">{item.value}</p>
              <p className="mt-1 text-zinc-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-orange-300">Fresh from Indies</p>
            <h2 className="text-2xl font-bold sm:text-3xl">Live game entries</h2>
          </div>
          <p className="max-w-md text-sm text-zinc-400">Check out the game's story, or launch the build and experience it yourself.</p>
        </div>

        {loading ? <p className="text-zinc-400">Loading live game cards...</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featuredGames.map((game, index) => (
            <GameTile key={game._id} game={game} index={index} />
          ))}
        </div>

        {!loading && featuredGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-6 text-zinc-400">
            No games found in the database yet. Upload one from a developer account to populate the home page.
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default HomePage;

