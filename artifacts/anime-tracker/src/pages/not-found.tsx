import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Tv2 } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-900/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-blue-900/10 rounded-full blur-[80px]" />
      </div>

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated TV icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="mb-6 relative"
        >
          <div className="w-24 h-24 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-xl">
            <Tv2 className="w-12 h-12 text-white/20" />
          </div>
          {/* Static / glitch lines on the TV */}
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0, 0.1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full bg-white/60"
                style={{ height: "1px", top: `${15 + i * 12}%` }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-2"
        >
          <span className="text-[88px] font-black leading-none tracking-tighter text-white/[0.06] select-none">
            404
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-2xl font-bold text-white -mt-4 mb-3"
        >
          Page not found
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-white/40 text-sm leading-relaxed mb-8"
        >
          Looks like this episode doesn&apos;t exist — or maybe it got licensed out of
          your region. Head back to keep watching.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-white/[0.06] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.1] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
