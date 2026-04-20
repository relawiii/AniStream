import { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetFollows,
  useFollowAnime,
  useUnfollowAnime,
  useUpdateFollowProgress,
  getGetFollowsQueryKey,
} from "@workspace/api-client-react";

interface FollowInput {
  animeId: number;
  animeTitle: string;
  animeCoverImage: string | null;
  notifyBeforeMinutes: number;
}

interface FollowsContextType {
  follows: ReturnType<typeof useGetFollows>["data"];
  isLoading: boolean;
  isFollowing: (animeId: number) => boolean;
  getWatchedEpisodes: (animeId: number) => number;
  follow: (input: FollowInput) => void;
  unfollow: (animeId: number) => void;
  updateProgress: (animeId: number, watchedEpisodes: number) => void;
}

const FollowsContext = createContext<FollowsContextType | undefined>(undefined);

export function FollowsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: follows, isLoading } = useGetFollows();
  const followMutation = useFollowAnime();
  const unfollowMutation = useUnfollowAnime();
  const progressMutation = useUpdateFollowProgress();

  const isFollowing = useCallback(
    (animeId: number) => {
      const safeFollows = Array.isArray(follows) ? follows : [];
      return safeFollows.some((f: { animeId: number }) => f.animeId === animeId);
    },
    [follows]
  );

  const getWatchedEpisodes = useCallback(
    (animeId: number) => {
      const safeFollows = Array.isArray(follows) ? follows : [];
      const follow = safeFollows.find((f: { animeId: number }) => f.animeId === animeId);
      return follow?.watchedEpisodes ?? 0;
    },
    [follows]
  );

  const follow = useCallback(
    (input: FollowInput) => {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      followMutation.mutate(
        {
          data: {
            animeId: input.animeId,
            animeTitle: input.animeTitle,
            animeCoverImage: input.animeCoverImage ?? undefined,
            notifyBeforeMinutes: input.notifyBeforeMinutes,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetFollowsQueryKey() });
          },
        }
      );
    },
    [followMutation, queryClient]
  );

  const unfollow = useCallback(
    (animeId: number) => {
      unfollowMutation.mutate(
        { animeId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetFollowsQueryKey() });
          },
        }
      );
    },
    [unfollowMutation, queryClient]
  );

  const updateProgress = useCallback(
    (animeId: number, watchedEpisodes: number) => {
      progressMutation.mutate(
        { animeId, data: { watchedEpisodes } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetFollowsQueryKey() });
          },
        }
      );
    },
    [progressMutation, queryClient]
  );

  const safeFollows = Array.isArray(follows) ? follows : [];

  return (
    <FollowsContext.Provider value={{ follows: safeFollows, isLoading, isFollowing, getWatchedEpisodes, follow, unfollow, updateProgress }}>
      {children}
    </FollowsContext.Provider>
  );
}

export function useFollowsContext() {
  const context = useContext(FollowsContext);
  if (!context) {
    throw new Error("useFollowsContext must be used within FollowsProvider");
  }
  return context;
}
