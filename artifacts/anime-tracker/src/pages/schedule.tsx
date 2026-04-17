import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useTrendingAnime, useUpcomingAnime } from "@/hooks/use-anime";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PlatformBadges } from "@/components/ui/platform-badges";
import { Anime } from "@/lib/anilist";
import { useAppSettings } from "@/hooks/use-app-settings";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(timestamp: number, showJST: boolean) {
  const date = new Date(timestamp * 1000);
  const local = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!showJST) return local;

  const jst = new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
  return `${local} (${jst} JST)`;
}

function ScheduleItem({ anime }: { anime: Anime }) {
  const { showJST } = useAppSettings();
  if (!anime.nextAiringEpisode) return null;
  const title = anime.title.english || anime.title.romaji;
  const isLive = anime.nextAiringEpisode.timeUntilAiring <= 0;

  return (
    <Link href={`/anime/${anime.id}`}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isLive
            ? "bg-primary/10 border border-primary/20"
            : "bg-[#141414] hover:bg-[#1c1c1c] border border-white/5"
        }`}
      >
        <img
          src={anime.coverImage.large}
          alt={title}
          className="w-10 h-14 object-cover rounded flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{title}</p>
          <p className="text-white/50 text-xs mt-0.5">
            Ep {anime.nextAiringEpisode.episode} &middot;{" "}
            {formatTime(anime.nextAiringEpisode.airingAt, showJST)}
          </p>
          <div className="mt-1">
            <PlatformBadges links={anime.externalLinks} limit={2} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {isLive ? (
            <span className="flex items-center gap-1 text-primary text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              LIVE
            </span>
          ) : (
            <CountdownTimer
              airingAt={anime.nextAiringEpisode.airingAt}
              className="text-xs text-white/60"
            />
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function SchedulePage() {
  const trending = useTrendingAnime();
  const upcoming = useUpcomingAnime();
  const allAnime = useMemo(() => {
    return [...(trending.data ?? []), ...(upcoming.data ?? [])].filter(
      a => a.nextAiringEpisode
    );
  }, [trending.data, upcoming.data]);

  const today = new Date().getDay();

  const byDay = useMemo(() => {
    const map: Record<number, Anime[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];

    allAnime.forEach(anime => {
      if (!anime.nextAiringEpisode) return;
      const date = new Date(anime.nextAiringEpisode.airingAt * 1000);
      const dayOfWeek = date.getDay();
      map[dayOfWeek].push(anime);
    });

    Object.values(map).forEach(arr =>
      arr.sort((a, b) => (a.nextAiringEpisode?.airingAt ?? 0) - (b.nextAiringEpisode?.airingAt ?? 0))
    );

    return map;
  }, [allAnime]);

  const isLoading = trending.isLoading || upcoming.isLoading;

  return (
    <div className="pt-20 pb-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-black text-white">Weekly Schedule</h1>
        </div>

        {/* Day tabs */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`text-center py-2 rounded-t text-xs sm:text-sm font-bold ${
                i === today
                  ? "bg-primary text-white"
                  : "bg-[#141414] text-white/50"
              }`}
            >
              <span className="hidden sm:block">{day}</span>
              <span className="sm:hidden">{SHORT_DAYS[i]}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 min-h-[400px]">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`rounded-b p-2 space-y-2 ${
                i === today ? "bg-primary/5 border border-primary/20" : "bg-[#0d0d0d] border border-white/5"
              }`}
            >
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(j => (
                    <div key={j} className="h-16 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : byDay[i].length === 0 ? (
                <p className="text-white/20 text-xs text-center pt-4">—</p>
              ) : (
                byDay[i].map(anime => (
                  <ScheduleItem key={anime.id} anime={anime} />
                ))
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
