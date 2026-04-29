import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, LayoutDashboard, UserCircle2, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const Navbar = ({ games = [] }) => {
  const { user, logout } = useAuthStore();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return games.filter((game) => game.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [games, query]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-black tracking-tight text-orange-300">notSteam</Link>
        <nav className="flex gap-4 text-sm text-zinc-300">
          <NavLink to="/" className="hover:text-white">Home</NavLink>
          <NavLink to="/discover" className="hover:text-white">Discover</NavLink>
        </nav>
        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none"
          />
          {suggestions.length > 0 && (
            <div className="absolute mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-sm">
              {suggestions.map((item) => (
                <Link key={item._id} to={`/game/${item._id}`} className="block rounded-lg px-2 py-1 hover:bg-zinc-800">
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              {user.role === "developer" && (
                <Link to={`/profile/${user.id}`} className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 hover:border-orange-300">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              )}
              <Link to={`/profile/${user.id}`} className="flex items-center gap-1 text-zinc-200 hover:text-white">
                <UserCircle2 className="h-5 w-5" />
              </Link>
              <button onClick={logout} className="rounded-lg border border-zinc-700 px-2 py-2 hover:border-zinc-500">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-xl bg-orange-500 px-4 py-2 font-medium text-black">Join</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

