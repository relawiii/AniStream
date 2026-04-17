import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Anime } from "@/lib/anilist";
import { AnimeCard } from "./anime-card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnimeRowProps {
  title: string;
  anime: Anime[] | undefined;
  isLoading?: boolean;
  className?: string;
}

export function AnimeRow({ title, anime, isLoading, className = "" }: AnimeRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`relative ${className}`}
    >
      <h2 className="text-lg sm:text-xl font-bold text-white mb-3 px-4 md:px-8 lg:px-12">
        {title}
      </h2>

      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-white drop-shadow" />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12 pb-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 sm:w-44 md:w-48">
                  <Skeleton className="w-full aspect-[2/3] rounded-md bg-white/5" />
                  <Skeleton className="h-3 w-3/4 mt-2 bg-white/5 rounded" />
                </div>
              ))
            : anime?.map((a, i) => (
                <AnimeCard key={a.id} anime={a} index={i} />
              ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-white drop-shadow" />
        </button>
      </div>
    </motion.section>
  );
}
