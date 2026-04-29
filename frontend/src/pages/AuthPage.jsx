import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";

const AuthPage = () => {
  const [params] = useSearchParams();
  const defaultRole = params.get("role") || "player";
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: defaultRole, gender: "other" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    setForm((prev) => ({ ...prev, role: defaultRole }));
  }, [defaultRole]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(endpoint, payload);
      setAuth(data.token, data.user);
      toast.success("Welcome to notSteam");
      navigate("/discover");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h1 className="text-3xl font-black">{isLogin ? "Welcome back" : "Create account"}</h1>
      <form onSubmit={submit} className="mt-5 space-y-3">
        {!isLogin && <input required placeholder="Name" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />}
        <input required type="email" placeholder="Email" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input required type="password" placeholder="Password" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        {!isLogin && (
          <select className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="developer">Developer</option>
            <option value="player">Player</option>
          </select>
        )}
        {!isLogin && (
          <select className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        )}
        <button disabled={loading} className="w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-black">{loading ? "Please wait..." : isLogin ? "Login" : "Register"}</button>
      </form>
      <button onClick={() => setIsLogin((v) => !v)} className="mt-3 text-sm text-zinc-400 hover:text-zinc-200">{isLogin ? "Need an account? Register" : "Already have an account? Login"}</button>
    </div>
  );
};

export default AuthPage;

