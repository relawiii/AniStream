import { useQueryClient } from "@tanstack/react-query";
import { HeroSection } from "@/components/anime/hero-section";
import { AnimeRow } from "@/components/anime/anime-row";
import {
  useTrendingAnime,
  usePopularAnime,
  useUpcomingAnime,
  useAiringToday,
} from "@/hooks/use-anime";

export default function HomePage() {
  const trending = useTrendingAnime();
  const popular = usePopularAnime();
  const upcoming = useUpcomingAnime();
  const airingToday = useAiringToday();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <HeroSection anime={trending.data} isLoading={trending.isLoading} />

      {/* Rows */}
      <div className="relative z-10 -mt-16 pb-16 space-y-10">
        {/* Airing Today */}
        <AnimeRow
          title="Airing Today"
          anime={airingToday.data}
          isLoading={airingToday.isLoading}
        />

        {/* Trending */}
        <AnimeRow
          title="Trending Now"
          anime={trending.data}
          isLoading={trending.isLoading}
        />

        {/* Popular This Season */}
        <AnimeRow
          title="Popular This Season"
          anime={popular.data}
          isLoading={popular.isLoading}
        />

        {/* Coming Soon */}
        <AnimeRow
          title="Coming Soon"
          anime={upcoming.data}
          isLoading={upcoming.isLoading}
        />
      </div>
    </div>
  );
}
