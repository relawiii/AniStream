import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus, Check, Star } from "lucide-react";
import { Anime } from "@/lib/anilist";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PlatformBadges } from "@/components/ui/platform-badges";
import { useFollowsContext } from "@/hooks/use-follows";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

export function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const [imageError, setImageError] = useState(false);
  const { isFollowing, follow, unfollow, getWatchedEpisodes } = useFollowsContext();
  const followed = isFollowing(anime.id);
  const [, navigate] = useLocation();

  const title = anime.title.english || anime.title.romaji;
  const coverImage = imageError ? null : (anime.coverImage.extraLarge || anime.coverImage.large);
  const isNowAiring = anime.nextAiringEpisode && anime.nextAiringEpisode.timeUntilAiring <= 0;

  // Behind count — only meaningful when following
  const watchedEpisodes = followed ? getWatchedEpisodes(anime.id) : 0;
  const latestAired = anime.nextAiringEpisode
    ? anime.nextAiringEpisode.episode - 1
    : (anime.episodes ?? 0);
  const behind = followed ? Math.max(latestAired - watchedEpisodes, 0) : 0;

  const handleCardClick = () => {
    navigate(`/anime/${anime.id}`);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (followed) {
      unfollow(anime.id);
    } else {
      follow({
        animeId: anime.id,
        animeTitle: title,
        animeCoverImage: anime.coverImage.large,
        notifyBeforeMinutes: 10,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative group flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-md aspect-[2/3] bg-[#1a1a1a]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white/20 text-xs text-center p-2">
            {title}
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Live badge */}
        {isNowAiring && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              LIVE
            </span>
          </div>
        )}

        {/* Score badge */}
        {anime.averageScore && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-0.5 bg-black/70 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              {(anime.averageScore / 10).toFixed(1)}
            </span>
          </div>
        )}

        {/* Behind badge */}
        {followed && behind > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              behind >= 3 ? "bg-red-500/90 text-white" : "bg-amber-500/90 text-black"
            }`}>
              {behind} behind
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
          {/* Follow button */}
          <button
            onClick={handleFollowClick}
            className={`absolute top-2 left-2 p-1 rounded-full transition-all z-10 ${
              followed
                ? "bg-primary text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {followed ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          {/* Episode + countdown */}
          {anime.nextAiringEpisode && (
            <div className="text-white text-xs font-medium">
              <span className="text-white/70">Ep {anime.nextAiringEpisode.episode} </span>
              <CountdownTimer airingAt={anime.nextAiringEpisode.airingAt} className="text-primary" />
            </div>
          )}

          {/* Platforms — use divs to avoid nested <a> */}
          <div onClick={e => e.stopPropagation()}>
            <PlatformBadges links={anime.externalLinks} limit={2} />
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="mt-2 px-0.5">
        <p className="text-white text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </p>
        {anime.nextAiringEpisode && !isNowAiring && (
          <p className="text-white/50 text-[10px] mt-0.5">
            Ep {anime.nextAiringEpisode.episode} &middot;{" "}
            <CountdownTimer airingAt={anime.nextAiringEpisode.airingAt} />
          </p>
        )}
        {isNowAiring && (
          <p className="text-primary text-[10px] mt-0.5 font-bold">Now Airing</p>
        )}
        {anime.status === "FINISHED" && (
          <p className="text-white/40 text-[10px] mt-0.5">{anime.episodes} episodes</p>
        )}
      </div>
    </motion.div>
  );
}
