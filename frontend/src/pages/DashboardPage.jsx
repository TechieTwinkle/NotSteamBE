import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  UploadCloud,
  Gamepad2,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LayoutDashboard,
  Layers,
  FileText,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

// ─── constants ────────────────────────────────────────────────────────────────

const GENRES = [
  "Indie", "Action", "Puzzle", "RPG", "Platformer",
  "Strategy", "Horror", "Adventure", "Simulation", "Other",
];

const initialForm = {
  title: "",
  description: "",
  tags: "",
  genre: "Indie",
  thumbnail: "",
  gameLink: "",
  overview: "",
  gameplay: "",
  developerNotes: "",
};

// ─── small reusable pieces ────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        accent ? "bg-orange-500/15 text-orange-400" : "bg-zinc-800 text-zinc-400"
      }`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-zinc-100">{value}</p>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-xl border border-zinc-700/80 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition";

// ─── player view ─────────────────────────────────────────────────────────────

const PlayerDashboard = ({ user }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center"
  >
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
      <Gamepad2 className="h-8 w-8 text-orange-400" />
    </div>
    <h1 className="text-2xl font-black text-zinc-100">Hey, {user?.name?.split(" ")[0]}!</h1>
    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
      You're logged in as a <span className="font-semibold text-zinc-200">Player</span>.
      Explore games, leave ratings, and switch to a Developer account whenever you're ready to publish.
    </p>
    <a
      href="/discover"
      className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400"
    >
      Browse games
    </a>
  </motion.section>
);

// ─── game row in the manage panel ────────────────────────────────────────────

const GameRow = ({ game, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"
    >
      <div className="flex items-center gap-3 p-3">
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-lg font-black text-zinc-500">
            {game.title?.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-100">{game.title}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-orange-300">
              {game.genre || "Indie"}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
              {game.averageRating?.toFixed(1) || "—"} ({game.ratingCount || 0})
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {game.gameLink && (
            <a
              href={game.gameLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              title="Open game"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => onDelete(game._id)}
            className="rounded-lg border border-red-900/60 p-2 text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
            title="Delete game"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-800 px-4 py-3"
          >
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
              {game.description || "No description provided."}
            </p>
            {game.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── main dashboard ───────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "manage"

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const loadGames = async () => {
    try {
      const { data } = await api.get("/games/developer/me");
      setGames(data);
    } catch {
      toast.error("Could not load your games");
    }
  };

  useEffect(() => {
    if (user?.role !== "developer") return;
    loadGames();
  }, [user?.role]);

  if (user?.role !== "developer") return <PlayerDashboard user={user} />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/games", {
        title: form.title,
        description: form.description,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        genre: form.genre,
        thumbnail: form.thumbnail,
        gameLink: form.gameLink,
        structuredDescription: {
          overview: form.overview,
          gameplay: form.gameplay,
          developerNotes: form.developerNotes,
        },
      });
      toast.success("Game published!");
      setForm(initialForm);
      loadGames();
      setActiveTab("manage");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const removeGame = async (id) => {
    try {
      await api.delete(`/games/${id}`);
      toast.success("Game deleted");
      setGames((prev) => prev.filter((g) => g._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalRatings = games.reduce((acc, g) => acc + (g.ratingCount || 0), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* ── header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15">
            <LayoutDashboard className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-100">Developer Studio</h1>
            <p className="text-xs text-zinc-500">notSteam · {user?.name}</p>
          </div>
        </div>
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400">
          Developer
        </span>
      </motion.div>

      {/* ── stat cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <StatCard icon={Layers} label="Published" value={games.length} accent />
        <StatCard icon={Star} label="Total ratings" value={totalRatings} />
        <StatCard icon={Gamepad2} label="Account" value="Active" />
      </motion.div>

      {/* ── tab switcher ── */}
      <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
        {[
          { id: "upload", label: "Upload game", icon: UploadCloud },
          { id: "manage", label: `Manage games (${games.length})`, icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === id
                ? "bg-orange-500 text-black"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── upload form ── */}
      <AnimatePresence mode="wait">
        {activeTab === "upload" && (
          <motion.form
            key="upload"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={onSubmit}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
          >
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Game details
            </p>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <input required className={inputCls} placeholder="My Awesome Game" value={form.title} onChange={set("title")} />
                </Field>
                <Field label="Genre">
                  <select required className={inputCls} value={form.genre} onChange={set("genre")}>
                    {GENRES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Tags (comma-separated)">
                <input className={inputCls} placeholder="2D, pixel, chill, singleplayer" value={form.tags} onChange={set("tags")} />
              </Field>

              <Field label="Description (markdown supported)">
                <textarea required rows={4} className={inputCls} placeholder="Tell players what makes your game special..." value={form.description} onChange={set("description")} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Thumbnail URL">
                  <input required type="url" className={inputCls} placeholder="https://i.imgur.com/..." value={form.thumbnail} onChange={set("thumbnail")} />
                </Field>
                <Field label="Game link">
                  <input required type="url" className={inputCls} placeholder="https://itch.io/..." value={form.gameLink} onChange={set("gameLink")} />
                </Field>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Structured description
                </p>
                <div className="space-y-3">
                  <Field label="Overview">
                    <textarea required rows={2} className={inputCls} placeholder="What is the game about?" value={form.overview} onChange={set("overview")} />
                  </Field>
                  <Field label="Gameplay">
                    <textarea required rows={2} className={inputCls} placeholder="How does it play? Controls, mechanics..." value={form.gameplay} onChange={set("gameplay")} />
                  </Field>
                  <Field label="Developer notes">
                    <textarea required rows={2} className={inputCls} placeholder="Behind the scenes, inspirations, tools used..." value={form.developerNotes} onChange={set("developerNotes")} />
                  </Field>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
              >
                <UploadCloud className="h-4 w-4" />
                {loading ? "Publishing..." : "Publish game"}
              </button>
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                Clear
              </button>
            </div>
          </motion.form>
        )}

        {/* ── manage panel ── */}
        {activeTab === "manage" && (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Your games
            </p>

            {games.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <Layers className="h-10 w-10 text-zinc-700" />
                <p className="text-sm text-zinc-500">No games published yet.</p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="mt-1 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-orange-500/40 hover:text-orange-300"
                >
                  Upload your first game
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {games.map((game) => (
                    <GameRow key={game._id} game={game} onDelete={removeGame} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;