import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
      <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }} className="text-center">
        <p className="text-4xl font-black tracking-tight text-orange-300">notSteam</p>
        <p className="mt-2 text-sm text-zinc-400">Loading indie worlds...</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

