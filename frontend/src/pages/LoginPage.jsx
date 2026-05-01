import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setAuth } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  // Receives the raw Google ID token from GoogleAuthButton and posts it to the backend.
  // Backend field name is `googleToken` (confirmed from authController.js).
  const onGoogleAuth = async (googleToken) => {
    if (!googleToken) return;
    try {
      const { data } = await api.post("/auth/google", { googleToken });
      setAuth(data.token, data.user);
      toast.success("Welcome to notSteam");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google login failed");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setAuth(data.token, data.user);
      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/40">
      <p className="text-xs uppercase tracking-[0.25em] text-orange-300">Welcome back</p>
      <h1 className="mt-2 text-3xl font-black text-zinc-100">Login to notSteam</h1>
      <p className="mt-2 text-sm text-zinc-400">Your indie universe in one warm place.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
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
        <button
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6">
        <GoogleAuthButton onCredentialResponse={onGoogleAuth} />
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        New here?{" "}
        <Link to="/signup" className="font-medium text-orange-300 hover:text-orange-200">
          Create your account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;