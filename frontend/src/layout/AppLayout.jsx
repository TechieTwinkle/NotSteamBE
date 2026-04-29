import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = ({ games }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1d1d20,#0a0a0b_40%)] text-zinc-100">
      <Navbar games={games} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

