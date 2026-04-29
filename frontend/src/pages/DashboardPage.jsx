import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const initialForm = {
  title: "",
  description: "",
  tags: "",
  genre: "Indie",
  thumbnail: "",
  gameLink: "",
  overview: "",
  gameplay: "",
  developerNotes: ""
};

const DashboardPage = () => {
  const [form, setForm] = useState(initialForm);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadGames = async () => {
    try {
      const { data } = await api.get("/games/developer/me");
      setGames(data);
    } catch {
      toast.error("Could not load dashboard games");
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/games", {
        title: form.title,
        description: form.description,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        genre: form.genre,
        thumbnail: form.thumbnail,
        gameLink: form.gameLink,
        structuredDescription: {
          overview: form.overview,
          gameplay: form.gameplay,
          developerNotes: form.developerNotes
        }
      });
      toast.success("Game uploaded");
      setForm(initialForm);
      loadGames();
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
      loadGames();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h1 className="text-2xl font-bold">Upload game</h1>
        <input required placeholder="Title" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <textarea required rows={4} placeholder="Long markdown description" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <input required placeholder="Tags (comma separated)" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
        <input required placeholder="Genre" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.genre} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))} />
        <input required type="url" placeholder="Thumbnail URL" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.thumbnail} onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.value }))} />
        <input required type="url" placeholder="Deployed game link only" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.gameLink} onChange={(e) => setForm((p) => ({ ...p, gameLink: e.target.value }))} />
        <textarea required rows={2} placeholder="Overview" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.overview} onChange={(e) => setForm((p) => ({ ...p, overview: e.target.value }))} />
        <textarea required rows={2} placeholder="Gameplay" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.gameplay} onChange={(e) => setForm((p) => ({ ...p, gameplay: e.target.value }))} />
        <textarea required rows={2} placeholder="Developer Notes" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.developerNotes} onChange={(e) => setForm((p) => ({ ...p, developerNotes: e.target.value }))} />
        <button disabled={loading} className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-black">{loading ? "Uploading..." : "Publish game"}</button>
      </form>

      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-2xl font-bold">Manage games</h2>
        {games.map((game) => (
          <div key={game._id} className="flex items-center justify-between rounded-xl border border-zinc-700 p-3">
            <p>{game.title}</p>
            <button onClick={() => removeGame(game._id)} className="text-sm text-red-300 hover:text-red-200">Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;

