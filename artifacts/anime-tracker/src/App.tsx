import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSettingsProvider } from "@/hooks/use-app-settings";
import { FollowsProvider } from "@/hooks/use-follows";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import AnimeDetailPage from "@/pages/anime-detail";
import SchedulePage from "@/pages/schedule";
import FollowingPage from "@/pages/following";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/anime/:id" component={AnimeDetailPage} />
        <Route path="/schedule" component={SchedulePage} />
        <Route path="/following" component={FollowingPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <FollowsProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </FollowsProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
