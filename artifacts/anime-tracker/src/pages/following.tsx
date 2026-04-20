import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bookmark, Plus, ChevronUp, ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { useFollowsContext } from "@/hooks/use-follows";
import { useAnimeByIds } from "@/hooks/use-anime";
import { Skeleton } from "@/components/ui/skeleton";
import { Anime } from "@/lib/anilist";

interface ProgressCardProps {
  anime: Anime;
  watchedEpisodes: number;
  onUpdateProgress: (n: number) => void;
  index: number;
}

function ProgressCard({ anime, watchedEpisodes, onUpdateProgress, index }: ProgressCardProps) {
  const title = anime.title.english || anime.title.romaji;
  const totalEpisodes = anime.episodes ?? anime.nextAiringEpisode?.episode ?? null;
  const latestAired = anime.nextAiringEpisode
    ? anime.nextAiringEpisode.episode - 1
    : (anime.episodes ?? 0);

  const behind = latestAired - watchedEpisodes;
  const progress = latestAired > 0 ? Math.min(watchedEpisodes / latestAired, 1) : 0;
  const isCaughtUp = behind <= 0 && latestAired > 0;
  const isFinished = anime.status === "FINISHED" && watchedEpisodes === totalEpisodes;

  const statusColor = isFinished
    ? "text-emerald-400"
    : isCaughtUp
    ? "text-primary"
    : behind >= 3
    ? "text-red-400"
    : "text-amber-400";

  const statusLabel = isFinished
    ? "Finished"
    : isCaughtUp
    ? "Up to date"
    : `${behind} ep${behind !== 1 ? "s" : ""} behind`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors"
    >
      {/* Cover */}
      <Link href={`/anime/${anime.id}`}>
        <div className="flex-shrink-0 w-14 h-20 rounded-md overflow-hidden bg-[#1a1a1a] cursor-pointer">
          {anime.coverImage.large ? (
            <img
              src={anime.coverImage.large}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px] text-center p-1">
              {title}
            </div>
          )}
        </div>
      </Link>

      {/* Info + controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/anime/${anime.id}`}>
              <p className="text-white text-sm font-semibold line-clamp-1 hover:text-primary transition-colors cursor-pointer">
                {title}
              </p>
            </Link>
            <p className={`text-xs mt-0.5 font-medium ${statusColor}`}>
              {statusLabel}
            </p>
          </div>

          {/* Episode stepper */}
          <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
            <button
              onClick={() => onUpdateProgress(Math.min(watchedEpisodes + 1, totalEpisodes ?? latestAired))}
              disabled={isCaughtUp && !totalEpisodes}
              className="p-1 rounded bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="text-white text-xs font-bold tabular-nums min-w-[1.5rem] text-center">
              {watchedEpisodes}
            </span>
            <button
              onClick={() => onUpdateProgress(Math.max(watchedEpisodes - 1, 0))}
              disabled={watchedEpisodes === 0}
              className="p-1 rounded bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isFinished ? "bg-emerald-500" : isCaughtUp ? "bg-primary" : behind >= 3 ? "bg-red-500" : "bg-amber-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30">
              {watchedEpisodes} / {totalEpisodes ?? latestAired ?? "?"} eps
            </span>
            <div className="flex items-center gap-1 text-[10px] text-white/30">
              {isFinished ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : anime.nextAiringEpisode ? (
                <Clock className="w-3 h-3" />
              ) : null}
              {anime.nextAiringEpisode && !isFinished && (
                <span>Ep {anime.nextAiringEpisode.episode} next</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FollowingPage() {
  const { follows, isLoading: followsLoading, getWatchedEpisodes, updateProgress } = useFollowsContext();
  const safeFollows = Array.isArray(follows) ? follows : [];
  const followedIds = safeFollows.map(f => f.animeId);
  const { data: animeList, isLoading: animeLoading } = useAnimeByIds(followedIds);

  const isLoading = followsLoading || animeLoading;
  const safeAnime = Array.isArray(animeList) ? animeList : [];

  // Sort: behind first, then up to date, then finished
  const sorted = [...safeAnime].sort((a, b) => {
    const getScore = (anime: Anime) => {
      const watched = getWatchedEpisodes(anime.id);
      const latest = anime.nextAiringEpisode
        ? anime.nextAiringEpisode.episode - 1
        : (anime.episodes ?? 0);
      return latest - watched;
    };
    return getScore(b) - getScore(a);
  });

  return (
    <div className="pt-20 pb-16 px-4 md:px-8 lg:px-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-black text-white">My List</h1>
          {safeFollows.length > 0 && (
            <span className="ml-1 bg-primary/20 text-primary text-sm font-bold px-2.5 py-0.5 rounded-full">
              {safeFollows.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Skeleton className="w-14 h-20 rounded-md bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3.5 w-2/3 bg-white/5 rounded" />
                  <Skeleton className="h-3 w-1/3 bg-white/5 rounded" />
                  <Skeleton className="h-1 w-full bg-white/5 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : safeFollows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#141414] flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-white/30" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your list is empty</h2>
            <p className="text-white/50 text-sm mb-6 max-w-sm">
              Follow anime to track your progress and get notified when new episodes air.
            </p>
            <Link href="/">
              <button className="bg-primary text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-primary/90 transition-colors">
                Browse Anime
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {sorted.map((anime, i) => (
              <ProgressCard
                key={anime.id}
                anime={anime}
                watchedEpisodes={getWatchedEpisodes(anime.id)}
                onUpdateProgress={(n) => updateProgress(anime.id, n)}
                index={i}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
