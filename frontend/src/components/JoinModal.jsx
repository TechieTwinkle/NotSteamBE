import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const JoinModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h3 className="text-2xl font-semibold">Choose your side</h3>
        <p className="mt-2 text-zinc-400">Join as a creator or a player and unlock your personal feed.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/signup?role=developer" onClick={onClose} className="rounded-xl bg-orange-500 px-4 py-3 text-center font-semibold text-black">Join as Developer</Link>
          <Link to="/signup?role=player" onClick={onClose} className="rounded-xl border border-zinc-700 px-4 py-3 text-center hover:border-orange-300">Join as Player</Link>
        </div>
        <button onClick={onClose} className="mt-4 text-sm text-zinc-500 hover:text-zinc-300">Maybe later</button>
      </motion.div>
    </div>
  );
};

export default JoinModal;

