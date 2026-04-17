import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Info, Star, Play } from "lucide-react";
import { Anime } from "@/lib/anilist";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PlatformBadges } from "@/components/ui/platform-badges";
import { useFollowsContext } from "@/hooks/use-follows";

interface HeroSectionProps {
  anime: Anime[] | undefined;
  isLoading?: boolean;
}

export function HeroSection({ anime, isLoading }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isFollowing, follow, unfollow } = useFollowsContext();

  const featured = anime?.[currentIndex];
  const followed = featured ? isFollowing(featured.id) : false;

  useEffect(() => {
    if (!anime || anime.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % Math.min(5, anime.length));
    }, 8000);
    return () => clearInterval(interval);
  }, [anime]);

  const handleFollowClick = () => {
    if (!featured) return;
    const title = featured.title.english || featured.title.romaji;
    if (followed) {
      unfollow(featured.id);
    } else {
      follow({
        animeId: featured.id,
        animeTitle: title,
        animeCoverImage: featured.coverImage.large,
        notifyBeforeMinutes: 10,
      });
    }
  };

  if (isLoading || !featured) {
    return (
      <div className="relative w-full h-[70vh] min-h-[480px] bg-[#141414] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-16 left-4 md:left-8 lg:left-12 space-y-4 max-w-xl">
          <div className="h-10 w-64 bg-white/10 rounded" />
          <div className="h-4 w-48 bg-white/10 rounded" />
          <div className="flex gap-3 mt-4">
            <div className="h-10 w-32 bg-white/10 rounded" />
            <div className="h-10 w-32 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const title = featured.title.english || featured.title.romaji;
  const bannerImage = featured.bannerImage || featured.coverImage.extraLarge;

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {bannerImage && (
            <img
              src={bannerImage}
              alt={title}
              className="w-full h-full object-cover object-top"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />

      {/* Content */}
      <div className="absolute bottom-20 left-4 md:left-8 lg:left-12 max-w-xl z-10">
        <motion.div
          key={`content-${featured.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-3">
            {featured.nextAiringEpisode && featured.nextAiringEpisode.timeUntilAiring <= 0 ? (
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                NOW AIRING
              </span>
            ) : featured.status === "RELEASING" ? (
              <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30">
                AIRING
              </span>
            ) : featured.status === "NOT_YET_RELEASED" ? (
              <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
                UPCOMING
              </span>
            ) : null}

            {featured.averageScore && (
              <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {(featured.averageScore / 10).toFixed(1)}
              </span>
            )}

            {featured.season && (
              <span className="text-white/50 text-sm">
                {featured.season} {featured.seasonYear}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 leading-tight">
            {title}
          </h1>

          {/* Episode countdown */}
          {featured.nextAiringEpisode && (
            <div className="text-white/80 text-base mb-4 font-medium">
              Episode {featured.nextAiringEpisode.episode}{" "}
              {featured.nextAiringEpisode.timeUntilAiring <= 0 ? (
                <span className="text-primary font-bold">is airing now</span>
              ) : (
                <>
                  airs{" "}
                  <CountdownTimer
                    airingAt={featured.nextAiringEpisode.airingAt}
                    className="text-primary font-bold"
                  />
                </>
              )}
            </div>
          )}

          {/* Platforms */}
          <div className="mb-5">
            <PlatformBadges links={featured.externalLinks} limit={4} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleFollowClick}
              className={`flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm transition-all ${
                followed
                  ? "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  : "bg-white text-black hover:bg-white/90"
              }`}
            >
              {followed ? (
                <>
                  <Check className="w-4 h-4" /> Following
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Follow
                </>
              )}
            </button>

            <Link href={`/anime/${featured.id}`}>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded font-bold text-sm transition-all border border-white/20">
                <Info className="w-4 h-4" /> More Info
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Hero indicators */}
      {anime && anime.length > 1 && (
        <div className="absolute bottom-8 left-4 md:left-8 lg:left-12 flex gap-1.5 z-10">
          {Array.from({ length: Math.min(5, anime.length) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-0.5 transition-all rounded-full ${
                i === currentIndex ? "w-6 bg-white" : "w-3 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
