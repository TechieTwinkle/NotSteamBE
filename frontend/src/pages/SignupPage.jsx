import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

const SignupPage = () => {
  const [params] = useSearchParams();
  const defaultRole = params.get("role") === "developer" ? "developer" : "player";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
    gender: "other",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setAuth } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  // Passes the currently selected role so new Google users are registered
  // as developer or player based on what the user chose on this page.
  const onGoogleAuth = async (googleToken) => {
    if (!googleToken) return;
    try {
      const { data } = await api.post("/auth/google", {
        googleToken,
        role: form.role,
      });
      setAuth(data.token, data.user);
      toast.success("Account created with Google");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google signup failed");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // No profile picture at signup — users start with a default avatar
      // and can change it later on their profile page.
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        gender: form.gender,
      });
      setAuth(data.token, data.user);
      toast.success("Welcome to notSteam");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/40">
      <p className="text-xs uppercase tracking-[0.25em] text-orange-300">Get started</p>
      <h1 className="mt-2 text-3xl font-black text-zinc-100">Create your notSteam account</h1>
      <p className="mt-2 text-sm text-zinc-400">Quick setup — you can personalize your avatar later.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          required
          placeholder="Name"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus:border-orange-400 focus:outline-none"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus:border-orange-400 focus:outline-none"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus:border-orange-400 focus:outline-none"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus:border-orange-400 focus:outline-none"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="developer">Developer</option>
            <option value="player">Player</option>
          </select>
          <select
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus:border-orange-400 focus:outline-none"
            value={form.gender}
            onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      {/* Google button renders below the form. Role is already selected above,
          so Google-registered users inherit the chosen role automatically. */}
      <div className="mt-6">
        <p className="mb-2 text-xs text-zinc-500">
          Signing up with Google will use the <span className="text-orange-300">{form.role}</span> role selected above.
        </p>
        <GoogleAuthButton onCredentialResponse={onGoogleAuth} />
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-orange-300 hover:text-orange-200">
          Login instead
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;