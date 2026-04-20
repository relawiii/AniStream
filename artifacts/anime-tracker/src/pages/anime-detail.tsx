import { useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Plus, Check, Star, Tv, Calendar, Info, Share2, Link as LinkIcon, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import { useAnimeDetail } from "@/hooks/use-anime";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PlatformBadges } from "@/components/ui/platform-badges";
import { useFollowsContext } from "@/hooks/use-follows";
import { useAppSettings } from "@/hooks/use-app-settings";
import { Skeleton } from "@/components/ui/skeleton";

function formatAiringTime(timestamp: number, showJST: boolean) {
  const date = new Date(timestamp * 1000);
  const localStr = date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!showJST) return localStr;
  const jstStr = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
  return `${localStr} (${jstStr} JST)`;
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${title} on AniStream`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard also failed — do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2.5 rounded font-bold text-sm transition-all border ${
        copied
          ? "bg-primary/20 text-primary border-primary/30"
          : "bg-white/[0.06] text-white/70 border-white/10 hover:bg-white/[0.1] hover:text-white hover:border-white/20"
      }`}
    >
      {copied ? (
        <>
          <LinkIcon className="w-4 h-4" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}

export default function AnimeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const { data: anime, isLoading, error } = useAnimeDetail(id);
  const { isFollowing, follow, unfollow, getWatchedEpisodes, updateProgress } = useFollowsContext();
  const { showJST } = useAppSettings();

  const followed = anime ? isFollowing(anime.id) : false;
  const watchedEpisodes = anime ? getWatchedEpisodes(anime.id) : 0;

  if (isLoading) {
    return (
      <div className="pt-0 min-h-screen bg-[#0a0a0a]">
        <div className="w-full h-[50vh] bg-[#141414] animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-4">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-4 w-48 bg-white/5" />
          <Skeleton className="h-24 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Info className="w-12 h-12 text-white/20 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Anime not found</h2>
        <p className="text-white/50">Could not load data for this title.</p>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const isNowAiring = anime.nextAiringEpisode && anime.nextAiringEpisode.timeUntilAiring <= 0;
  const totalEpisodes = anime.episodes ?? anime.nextAiringEpisode?.episode ?? null;
  const latestAired = anime.nextAiringEpisode
    ? anime.nextAiringEpisode.episode - 1
    : (anime.episodes ?? 0);
  const behind = latestAired - watchedEpisodes;
  const progress = latestAired > 0 ? Math.min(watchedEpisodes / latestAired, 1) : 0;
  const isCaughtUp = behind <= 0 && latestAired > 0;
  const isFinished = anime.status === "FINISHED" && watchedEpisodes === totalEpisodes;

  const handleFollowToggle = () => {
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Banner */}
      <div className="relative w-full h-[50vh] min-h-[300px] overflow-hidden">
        {(anime.bannerImage || anime.coverImage.extraLarge) && (
          <motion.img
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            src={anime.bannerImage || anime.coverImage.extraLarge}
            alt={title}
            className="w-full h-full object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 md:px-10 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-7">
          {/* Cover image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-shrink-0"
          >
            <img
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              className="w-36 md:w-44 rounded-xl shadow-2xl border border-white/10"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 pt-4 md:pt-16"
          >
            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {isNowAiring ? (
                <span className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  NOW AIRING
                </span>
              ) : anime.status === "RELEASING" ? (
                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30">
                  AIRING
                </span>
              ) : anime.status === "NOT_YET_RELEASED" ? (
                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
                  UPCOMING
                </span>
              ) : (
                <span className="bg-white/10 text-white/60 text-xs font-bold px-3 py-1 rounded-full">
                  FINISHED
                </span>
              )}

              {anime.averageScore && (
                <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white mb-1">{title}</h1>
            {anime.title.english && anime.title.romaji !== anime.title.english && (
              <p className="text-white/40 text-sm mb-3">{anime.title.romaji}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/50 text-sm mb-5">
              {anime.season && (
                <span>{anime.season} {anime.seasonYear}</span>
              )}
              {anime.episodes && (
                <span className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" /> {anime.episodes} episodes
                </span>
              )}
              {Array.isArray(anime.genres) && anime.genres.slice(0, 3).map(g => (
                <span key={g} className="bg-white/[0.07] px-2.5 py-0.5 rounded-full text-xs text-white/55 border border-white/10">
                  {g}
                </span>
              ))}
            </div>

            {/* Next episode info */}
            {anime.nextAiringEpisode && (
              <div className={`p-4 rounded-xl mb-5 border ${
                isNowAiring
                  ? "bg-primary/10 border-primary/30"
                  : "bg-white/[0.04] border-white/[0.08]"
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-white/60 text-sm font-medium">Next Episode</span>
                </div>
                <p className="text-white font-bold text-base">
                  Episode {anime.nextAiringEpisode.episode}
                </p>
                {isNowAiring ? (
                  <p className="text-primary font-bold text-sm mt-1">Airing now</p>
                ) : (
                  <>
                    <p className="text-white/50 text-sm mt-0.5">
                      {formatAiringTime(anime.nextAiringEpisode.airingAt, showJST)}
                    </p>
                    <div className="mt-2 text-primary font-bold">
                      <CountdownTimer airingAt={anime.nextAiringEpisode.airingAt} />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Episode progress — only visible when following */}
            {followed && latestAired > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl mb-5 border bg-white/[0.03] border-white/[0.07]"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                    Your Progress
                  </p>
                  {isFinished ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : isCaughtUp ? (
                    <span className="text-primary text-xs font-bold">Up to date</span>
                  ) : (
                    <span className={`text-xs font-bold ${behind >= 3 ? "text-red-400" : "text-amber-400"}`}>
                      {behind} ep{behind !== 1 ? "s" : ""} behind
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mb-3">
                  <motion.div
                    className={`h-full rounded-full ${
                      isFinished ? "bg-emerald-500" : isCaughtUp ? "bg-primary" : behind >= 3 ? "bg-red-500" : "bg-amber-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">
                    {watchedEpisodes} / {totalEpisodes ?? latestAired} eps watched
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateProgress(anime.id, Math.max(watchedEpisodes - 1, 0))}
                      disabled={watchedEpisodes === 0}
                      className="p-1.5 rounded bg-white/[0.07] hover:bg-white/[0.13] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white text-sm font-bold tabular-nums w-6 text-center">
                      {watchedEpisodes}
                    </span>
                    <button
                      onClick={() => updateProgress(anime.id, Math.min(watchedEpisodes + 1, totalEpisodes ?? latestAired))}
                      disabled={isCaughtUp || isFinished}
                      className="p-1.5 rounded bg-white/[0.07] hover:bg-white/[0.13] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    {behind > 1 && (
                      <button
                        onClick={() => updateProgress(anime.id, latestAired)}
                        className="ml-1 px-2.5 py-1 rounded bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-colors"
                      >
                        Catch up
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Platforms */}
            <div className="mb-6">
              <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-2.5">
                Where to Watch
              </p>
              <PlatformBadges links={anime.externalLinks} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm transition-all ${
                  followed
                    ? "bg-white/[0.08] text-white hover:bg-white/[0.13] border border-white/15"
                    : "bg-primary text-white hover:bg-primary/85 shadow-lg shadow-primary/20"
                }`}
              >
                {followed ? (
                  <><Check className="w-4 h-4" /> Following</>
                ) : (
                  <><Plus className="w-4 h-4" /> Follow</>
                )}
              </button>

              <ShareButton title={title} />
            </div>
          </motion.div>
        </div>

        {/* Description */}
        {anime.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 border-t border-white/[0.07] pt-8"
          >
            <h2 className="text-base font-bold text-white mb-3 uppercase tracking-widest text-xs text-white/40">
              About
            </h2>
            <p
              className="text-white/55 text-sm leading-7 max-w-3xl"
              dangerouslySetInnerHTML={{
                __html: anime.description.replace(/<br>/gi, " ").replace(/<[^>]+>/g, ""),
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function formatAiringTime(timestamp: number, showJST: boolean) {
  const date = new Date(timestamp * 1000);
  const localStr = date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!showJST) return localStr;
  const jstStr = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
  return `${localStr} (${jstStr} JST)`;
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${title} on AniStream`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard also failed — do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2.5 rounded font-bold text-sm transition-all border ${
        copied
          ? "bg-primary/20 text-primary border-primary/30"
          : "bg-white/[0.06] text-white/70 border-white/10 hover:bg-white/[0.1] hover:text-white hover:border-white/20"
      }`}
    >
      {copied ? (
        <>
          <LinkIcon className="w-4 h-4" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}
