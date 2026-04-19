import { useState, useCallback } from "react";
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

  const [heroIndex, setHeroIndex] = useState(0);
  const handleIndexChange = useCallback((i: number) => setHeroIndex(i), []);

  const heroCount = Math.min(5, trending.data?.length ?? 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <HeroSection
        anime={trending.data}
        isLoading={trending.isLoading}
        currentIndex={heroIndex}
        onIndexChange={handleIndexChange}
      />

      <div className="relative z-10 -mt-12 pb-20 space-y-12">
        {/* Dot indicator — sits right above the first row */}
        {heroCount > 1 && (
          <div className="flex items-center gap-1.5 px-5 md:px-10 lg:px-14 pt-2">
            {Array.from({ length: heroCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleIndexChange(i)}
                className={`h-0.5 transition-all duration-300 rounded-full ${
                  i === heroIndex ? "w-6 bg-white" : "w-3 bg-white/25 hover:bg-white/45"
                }`}
              />
            ))}
          </div>
        )}

        {airingToday.data && airingToday.data.length > 0 && (
          <AnimeRow
            title="Airing Today"
            anime={airingToday.data}
            isLoading={airingToday.isLoading}
            accent
          />
        )}

        <AnimeRow
          title="Trending Now"
          anime={trending.data}
          isLoading={trending.isLoading}
        />

        <AnimeRow
          title="Popular This Season"
          anime={popular.data}
          isLoading={popular.isLoading}
        />

        <AnimeRow
          title="Coming Soon"
          anime={upcoming.data}
          isLoading={upcoming.isLoading}
        />
      </div>
    </div>
  );
}
