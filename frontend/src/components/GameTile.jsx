import { memo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // 1. Imported useNavigate
import { Play, Star } from "lucide-react";

const GameTile = ({ game, index = 0 }) => {
  const navigate = useNavigate(); // 2. Initialized useNavigate

  // 3. Changed this function to route to the GamePage instead of opening the external link
  const goToGamePage = () => {
    navigate(`/game/${game._id}`);
  };

  return (
    <motion.article
      onClick={goToGamePage} // 4. Attached the new routing function here
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18) }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/70 shadow-[0_8px_30px_rgba(0,0,0,0.22)] cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-transparent opacity-0 transition group-hover:opacity-100" />
      
      <div className="block w-full text-left">
        <img src={game.thumbnail} alt={game.title} loading="lazy" className="h-48 w-full object-cover sm:h-56" />
      </div>
      
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">{game.genre}</p>
        <h3 className="text-xl font-semibold">{game.title}</h3>
        <div className="flex flex-wrap gap-2">
          {game.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">#{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-sm text-zinc-300">
            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
            {game.averageRating || 0} ({game.ratingCount || 0})
          </span>
          <div className="flex items-center gap-3">
            {/* This Play link will still open the external game because of e.stopPropagation() */}
            <a
              href={game.gameLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()} 
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-200 hover:text-white"
            >
              <Play className="h-4 w-4" />
              Play
            </a>
            {/* The Read button now does the exact same thing as clicking the card */}
            <Link 
              className="text-sm font-medium text-orange-300 hover:text-orange-200" 
              to={`/game/${game._id}`} 
              onClick={(e) => e.stopPropagation()}
            >
              Read
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default memo(GameTile);