import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import StarRating from "../components/StarRating";
import { formatDate } from "../utils/format";

const GamePage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  const fetchGame = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/games/${id}`);
      setGame(data);
    } catch {
      toast.error("Could not load game details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [id]);

  const discussion = useMemo(() => game?.comments?.filter((c) => !c.parentCommentId) || [], [game]);

  const onRate = async (value) => {
    if (!user) return toast.error("Login to rate");
    if (user.role !== "player") return toast.error("Only players can rate games");
    try {
      await api.post("/ratings", { gameId: game._id, value });
      toast.success("Rating saved");
      fetchGame();
    } catch {
      toast.error("Unable to rate");
    }
  };

  const onComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Login to comment");
    if (user.role !== "player") return toast.error("Only players can leave feedback");
    try {
      await api.post("/comments", { gameId: game._id, text: commentText });
      setCommentText("");
      toast.success("Comment posted");
      fetchGame();
    } catch {
      toast.error("Failed to comment");
    }
  };

  if (loading) return <p className="text-zinc-400">Loading game page...</p>;
  if (!game) return <p className="text-zinc-400">Game not found.</p>;

  return (
    <div className="space-y-6">
      <img src={game.thumbnail} alt={game.title} className="h-72 w-full rounded-3xl border border-zinc-800 object-cover" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">{game.title}</h1>
          <p className="mt-2 text-zinc-300">by {game.developerId?.name}</p>
        </div>
        <a href={game.gameLink} target="_blank" rel="noreferrer" className="rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black">Play now</a>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-xl font-semibold">Playable Link</h2>
        <a href={game.gameLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-orange-300 hover:text-orange-200">
          {game.gameLink}
        </a>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 md:col-span-2">
          <h2 className="text-2xl font-semibold">Description</h2>
          <div className="prose prose-invert mt-3 max-w-none">
            <ReactMarkdown>{game.description}</ReactMarkdown>
          </div>
          <div className="mt-6 space-y-4">
            <article>
              <h3 className="text-xl font-semibold text-orange-300">Overview</h3>
              <p className="mt-2 text-zinc-300">{game.structuredDescription?.overview}</p>
            </article>
            <article>
              <h3 className="text-xl font-semibold text-orange-300">Gameplay</h3>
              <p className="mt-2 text-zinc-300">{game.structuredDescription?.gameplay}</p>
            </article>
            <article>
              <h3 className="text-xl font-semibold text-orange-300">Developer Notes</h3>
              <p className="mt-2 text-zinc-300">{game.structuredDescription?.developerNotes}</p>
            </article>
          </div>
        </div>

        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="text-lg font-semibold">Community rating</h3>
          <p className="mt-1 text-zinc-400">{game.averageRating} / 5 from {game.ratingCount} players</p>
          <div className="mt-3"><StarRating value={Math.round(game.averageRating)} onRate={onRate} /></div>
        </aside>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="text-2xl font-semibold">Direct feedback</h3>
        <form onSubmit={onComment} className="mt-4 flex gap-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Share your thoughts" className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <button className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-black">Post</button>
        </form>
        <div className="mt-4 space-y-3">
          {discussion.map((comment) => (
            <div key={comment._id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-sm text-zinc-400">{comment.userId?.name} · {formatDate(comment.createdAt)}</p>
              <p className="mt-1 text-zinc-200">{comment.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GamePage;

