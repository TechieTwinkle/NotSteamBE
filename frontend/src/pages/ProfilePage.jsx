import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  User,
  Gamepad2,
  Activity,
  Edit3,
  Check,
  X,
  Star,
  ExternalLink,
  LayoutDashboard,
  ShieldCheck,
  Camera,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ProfilePictureModal from "../components/ProfilePictureModal";

// ─── helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-zinc-700/80 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition";

const TABS = [
  { id: "bio",      label: "Bio",      icon: User },
  { id: "games",    label: "Games",    icon: Gamepad2 },
  { id: "activity", label: "Activity", icon: Activity },
];

// ─── avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ src, name, size = 20 }) => {
  const [err, setErr] = useState(false);
  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className="rounded-full object-cover border-2 border-zinc-700"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-800 font-black text-orange-400"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
};

// ─── game card ────────────────────────────────────────────────────────────────

const GameCard = ({ game, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
  >
    <Link
      to={`/game/${game._id}`}
      className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition hover:border-orange-500/40"
    >
      {game.thumbnail ? (
        <img
          src={game.thumbnail}
          alt={game.title}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 font-black text-zinc-500">
          {game.title?.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-zinc-100 group-hover:text-orange-300 transition">
          {game.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
          {game.genre && (
            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-orange-300">
              {game.genre}
            </span>
          )}
          {game.ratingCount > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
              {game.averageRating?.toFixed(1)} ({game.ratingCount})
            </span>
          )}
        </div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition" />
    </Link>
  </motion.div>
);

// ─── activity item ────────────────────────────────────────────────────────────

const ActivityItem = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.04 }}
    className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
  >
    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {item.gameId?.title || "Status"}
      </p>
      <p className="mt-1 text-sm text-zinc-200">{item.text}</p>
    </div>
  </motion.div>
);

// ─── main component ───────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("bio");
  const [editing, setEditing] = useState(false);
  const [editable, setEditable] = useState({ bio: "", activity: "", gender: "other" });
  const [saving, setSaving] = useState(false);
  const [showPicModal, setShowPicModal] = useState(false);

  const isOwner = user?.id === id;

  // Called when the ProfilePictureModal saves successfully
  const handlePictureSaved = (data) => {
    setProfile((prev) => ({
      ...prev,
      avatar: data.avatar,
      profilePictureUrl: data.profilePictureUrl,
    }));
    // Keep the global auth context in sync (e.g. navbar avatar)
    if (updateUser) {
      updateUser({ avatar: data.avatar, profilePictureUrl: data.profilePictureUrl });
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const endpoint = isOwner ? "/users/me" : `/users/${id}`;
        const { data } = await api.get(endpoint);
        setProfile(data);
        setEditable({ bio: data.bio || "", activity: data.activity || "", gender: data.gender || "other" });
      } catch {
        toast.error("Profile unavailable");
      }
    };
    load();
  }, [id, isOwner]);

  const activityItems = useMemo(() => {
    if (!profile) return [];
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

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
      </div>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", editable);
      setProfile((prev) => ({ ...prev, ...data }));
      toast.success("Profile updated");
      setEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditable({ bio: profile.bio || "", activity: profile.activity || "", gender: profile.gender || "other" });
    setEditing(false);
  };

  const avatarSrc = profile.profilePictureUrl || profile.avatar;
  const isDev = profile.role === "developer";

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {/* ── hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"
      >
        {/* top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 opacity-70" />

        <div className="flex flex-wrap items-center gap-5 p-6">
          {/* ── clickable avatar (owner only) ── */}
          {isOwner ? (
            <button
              onClick={() => setShowPicModal(true)}
              className="group relative shrink-0 cursor-pointer"
              title="Change profile picture"
            >
              <Avatar src={avatarSrc} name={profile.name} size={80} />
              {/* camera overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
          ) : (
            <Avatar src={avatarSrc} name={profile.name} size={80} />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-100">{profile.name}</h1>
              <span
                className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest ${
                  isDev
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400"
                }`}
              >
                {isDev ? <ShieldCheck className="h-3 w-3" /> : <Gamepad2 className="h-3 w-3" />}
                {profile.role}
              </span>
            </div>

            <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
              {profile.gender !== "other" ? profile.gender : ""}
              {profile.gender !== "other" && profile.games?.length > 0 ? " · " : ""}
              {isDev && profile.games?.length > 0
                ? `${profile.games.length} game${profile.games.length !== 1 ? "s" : ""} published`
                : ""}
            </p>

            {profile.bio && !editing && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400 line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {isOwner && isDev && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
              >
                <LayoutDashboard className="h-4 w-4" />
                Studio
              </Link>
            )}
            {isOwner && (
              <button
                onClick={() => setEditing((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* inline edit panel */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-zinc-800"
            >
              <div className="space-y-3 p-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">Bio</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Tell players about yourself..."
                    value={editable.bio}
                    onChange={(e) => setEditable((p) => ({ ...p, bio: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Current activity
                  </label>
                  <textarea
                    rows={2}
                    className={inputCls}
                    placeholder="What are you building or playing right now?"
                    value={editable.activity}
                    onChange={(e) => setEditable((p) => ({ ...p, activity: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">Gender</label>
                  <select
                    className={inputCls}
                    value={editable.gender}
                    onChange={(e) => setEditable((p) => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / prefer not to say</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── tab bar ── */}
      <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
        {TABS.map(({ id: tid, label, icon: Icon }) => {
          const count =
            tid === "games" ? profile.games?.length ?? 0
            : tid === "activity" ? activityItems.length
            : null;
          return (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === tid
                  ? "bg-orange-500 text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {count !== null && count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-black ${
                    tab === tid ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── tab content ── */}
      <AnimatePresence mode="wait">

        {tab === "bio" && (
          <motion.div
            key="bio"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
          >
            {profile.bio ? (
              <p className="text-sm leading-relaxed text-zinc-300">{profile.bio}</p>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <User className="h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-500">No bio yet.</p>
                {isOwner && (
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-1 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-orange-500/40 hover:text-orange-300"
                  >
                    Add a bio
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {tab === "games" && (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {(profile.games || []).length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 py-14 text-center">
                <Gamepad2 className="h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-500">
                  {isDev ? "No games published yet." : "No games in library yet."}
                </p>
                {isOwner && isDev && (
                  <Link
                    to="/dashboard"
                    className="mt-1 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-orange-500/40 hover:text-orange-300"
                  >
                    Upload your first game
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {profile.games.map((game, i) => (
                  <GameCard key={game._id} game={game} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-3"
          >
            {activityItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 py-14 text-center">
                <Activity className="h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-500">No activity yet.</p>
                {isOwner && (
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-1 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-orange-500/40 hover:text-orange-300"
                  >
                    Set a status
                  </button>
                )}
              </div>
            ) : (
              activityItems.map((item, i) => (
                <ActivityItem key={item._id} item={item} index={i} />
              ))
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── profile picture modal ── */}
      {showPicModal && (
        <ProfilePictureModal
          currentSrc={avatarSrc}
          onClose={() => setShowPicModal(false)}
          onSaved={handlePictureSaved}
        />
      )}
    </div>
  );
};

export default ProfilePage;