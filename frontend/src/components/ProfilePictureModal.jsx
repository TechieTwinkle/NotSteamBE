import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Check, Sparkles, Image } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client";

// ── Pre-defined avatar collection ─────────────────────────────────────────────
// These match the PRESET_AVATARS list on the backend so validation passes.
const PRESET_AVATARS = [
  { url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Midnight", label: "Midnight" },
  { url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Blaze",    label: "Blaze" },
  { url: "https://api.dicebear.com/8.x/avataaars/svg?seed=Storm",     label: "Storm" },
  { url: "https://api.dicebear.com/8.x/avataaars/svg?seed=Neon",      label: "Neon" },
  { url: "https://api.dicebear.com/8.x/micah/svg?seed=Pixel",         label: "Pixel" },
  { url: "https://api.dicebear.com/8.x/micah/svg?seed=Aurora",        label: "Aurora" },
  { url: "https://api.dicebear.com/8.x/bottts/svg?seed=Circuit",      label: "Circuit" },
  { url: "https://api.dicebear.com/8.x/bottts/svg?seed=Voltage",      label: "Voltage" },
];

const TABS = [
  { id: "avatar", label: "Choose Avatar", icon: Sparkles },
  { id: "upload", label: "Upload Photo",  icon: Upload },
];

// ─── Component ────────────────────────────────────────────────────────────────

const ProfilePictureModal = ({ currentSrc, onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState(null);   // URL string
  const [uploadedFile, setUploadedFile] = useState(null);       // File object
  const [uploadPreview, setUploadPreview] = useState(null);     // data-URL for preview
  const [saving, setSaving] = useState(false);

  // Build a live preview from whichever option is active
  const previewSrc =
    activeTab === "upload" && uploadPreview
      ? uploadPreview
      : activeTab === "avatar" && selectedAvatar
      ? selectedAvatar
      : currentSrc;

  // Create a blob URL when a file is selected so we can preview it instantly
  useEffect(() => {
    if (!uploadedFile) {
      setUploadPreview(null);
      return;
    }
    const url = URL.createObjectURL(uploadedFile);
    setUploadPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── file handler ────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    setUploadedFile(file);
  };

  // ── save handler ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      let res;

      if (activeTab === "upload" && uploadedFile) {
        // Option B — upload the file as multipart/form-data
        const fd = new FormData();
        fd.append("profilePicture", uploadedFile);
        res = await api.put("/users/profile-picture", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (activeTab === "avatar" && selectedAvatar) {
        // Option A — send the pre-defined avatar URL as JSON
        res = await api.put("/users/profile-picture", { avatarUrl: selectedAvatar });
      } else {
        toast.error("Select an avatar or upload a photo first");
        setSaving(false);
        return;
      }

      toast.success("Profile picture updated!");
      onSaved(res.data);  // pass the updated fields back to the parent
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update picture");
    } finally {
      setSaving(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {/* backdrop */}
      <motion.div
        key="pp-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        {/* modal card */}
        <motion.div
          key="pp-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl shadow-black/60"
        >
          {/* orange accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

          {/* header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-400" />
              <h2 className="text-lg font-bold text-zinc-100">Change Profile Picture</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── live preview ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="relative">
              <div className="h-28 w-28 overflow-hidden rounded-full border-[3px] border-orange-500/50 shadow-lg shadow-orange-500/10">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-3xl font-black text-zinc-600">
                    ?
                  </div>
                )}
              </div>
              {/* little badge showing which mode is active */}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-orange-300">
                Preview
              </span>
            </div>
          </div>

          {/* ── tab switcher ─────────────────────────────────────────────── */}
          <div className="mx-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
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

          {/* ── tab content ──────────────────────────────────────────────── */}
          <div className="min-h-[200px] p-6">
            <AnimatePresence mode="wait">
              {activeTab === "avatar" && (
                <motion.div
                  key="tab-avatar"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                    Pick a style that fits you
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {PRESET_AVATARS.map(({ url, label }) => {
                      const isSelected = selectedAvatar === url;
                      return (
                        <button
                          key={url}
                          onClick={() => setSelectedAvatar(url)}
                          className={`group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition ${
                            isSelected
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600"
                          }`}
                        >
                          <img
                            src={url}
                            alt={label}
                            className={`h-14 w-14 rounded-full transition group-hover:scale-110 ${
                              isSelected ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-zinc-900" : ""
                            }`}
                          />
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isSelected ? "text-orange-300" : "text-zinc-500"
                          }`}>
                            {label}
                          </span>
                          {isSelected && (
                            <motion.div
                              layoutId="avatar-check"
                              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-black"
                            >
                              <Check className="h-3 w-3" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === "upload" && (
                <motion.div
                  key="tab-upload"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                    Upload from your device
                  </p>

                  <label
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950/50 px-4 py-8 transition hover:border-orange-500/50 hover:bg-zinc-900/60"
                  >
                    <Image className="h-8 w-8 text-zinc-600" />
                    {uploadedFile ? (
                      <div className="text-center">
                        <p className="text-sm font-medium text-orange-300">{uploadedFile.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {(uploadedFile.size / 1024).toFixed(0)} KB — Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-300">
                          Drop an image or <span className="text-orange-400">browse</span>
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">JPG, PNG or WEBP — max 2 MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── action bar ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-6 py-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfilePictureModal;
