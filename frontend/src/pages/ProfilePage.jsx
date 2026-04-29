import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("bio");
  const [editable, setEditable] = useState({ bio: "", activity: "", gender: "other" });
  const [saving, setSaving] = useState(false);
  const isOwner = user && user.id === id;

  useEffect(() => {
    const load = async () => {
      try {
        const endpoint = user && user.id === id ? "/users/me" : `/users/${id}`;
        const { data } = await api.get(endpoint);
        setProfile(data);
        setEditable({
          bio: data.bio || "",
          activity: data.activity || "",
          gender: data.gender || "other"
        });
      } catch {
        toast.error("Profile unavailable");
      }
    };
    load();
  }, [id, user]);

  // ✅ FIX: Moved useMemo ABOVE the early return
  // Added optional chaining (profile?.) to prevent crashes when profile is null
  const activityItems = useMemo(() => {
    if (!profile) return []; // Return empty array if profile hasn't loaded yet

    const activityStatus = typeof profile.activity === "string" ? profile.activity : "";
    const feed = Array.isArray(profile.activityFeed)
      ? profile.activityFeed
      : Array.isArray(profile.reviews)
        ? profile.reviews
        : Array.isArray(profile.activity)
          ? profile.activity
          : [];

    if (activityStatus.trim()) {
      return [{ _id: "status", text: activityStatus, gameId: { title: "Personal status" } }, ...feed];
    }
    return feed;
  }, [profile]);


  // ✅ The early return is now safely AFTER all hooks
  if (!profile) return <p className="text-zinc-400">Loading profile...</p>;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", editable);
      setProfile((prev) => ({ ...prev, ...data }));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center gap-4">
          <img src={profile.avatar} alt={profile.name} className="h-16 w-16 rounded-full border border-zinc-700" />
          <div>
            <h1 className="text-3xl font-black">{profile.name}</h1>
            <p className="text-zinc-400">{profile.role}</p>
          </div>
          {profile.role === "developer" && isOwner && (
            <Link to="/dashboard" className="ml-auto rounded-xl bg-orange-500 px-4 py-2 font-semibold text-black">
              Upload Game
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {["bio", "games", "activity"].map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-4 py-2 capitalize ${tab === item ? "bg-orange-500 text-black" : "border border-zinc-700"}`}>
            {item}
          </button>
        ))}
      </div>

      {tab === "bio" && (
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-300">
          {isOwner ? (
            <>
              <textarea
                rows={4}
                value={editable.bio}
                onChange={(e) => setEditable((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Tell players about you"
              />
              <select
                value={editable.gender}
                onChange={(e) => setEditable((prev) => ({ ...prev, gender: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <button disabled={saving} onClick={saveProfile} className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-black">
                {saving ? "Saving..." : "Save Bio"}
              </button>
            </>
          ) : (
            <p>{profile.bio || "No bio yet."}</p>
          )}
        </div>
      )}
      {tab === "games" && (
        <div className="grid gap-3 md:grid-cols-2">
          {(profile.games || []).map((game) => (
            <Link key={game._id} to={`/game/${game._id}`} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:border-orange-400">
              {game.title}
            </Link>
          ))}
        </div>
      )}
      {tab === "activity" && (
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          {isOwner && (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={editable.activity}
                onChange={(e) => setEditable((prev) => ({ ...prev, activity: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="What are you building or playing right now?"
              />
              <button disabled={saving} onClick={saveProfile} className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-black">
                {saving ? "Saving..." : "Save Activity"}
              </button>
            </div>
          )}
          {activityItems.map((item) => (
            <div key={item._id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-sm text-zinc-400">On {item.gameId?.title || "Profile"}</p>
              <p className="text-zinc-200">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;