import { useState, useEffect } from "react";
import { X, Megaphone, AlertTriangle } from "lucide-react";

interface Announcement {
  Heading: string;
  Description: string;
  Forced: boolean;
}

const GITHUB_USER = "relawiii";
const REPO = "AniTime-announcements";
const BRANCH = "main";
const FILE = "announcements.json";
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/${BRANCH}/${FILE}`;

const DISMISSED_KEY = "anitime_dismissed_announcements";

function getDismissedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function dismissAnnouncement(id: string) {
  const dismissed = getDismissedIds();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }
}

// Stable ID for an announcement (heading + description hash)
function announcementId(a: Announcement): string {
  return btoa(encodeURIComponent(`${a.Heading}||${a.Description}`)).slice(0, 32);
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDismissed(getDismissedIds());
    fetch(RAW_URL)
      .then((r) => r.json())
      .then((data) => {
        // Support both array and single object
        const items: Announcement[] = Array.isArray(data) ? data : [data];
        setAnnouncements(items);
      })
      .catch(() => {
        // Silently fail — no announcements if fetch errors
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const visible = announcements.filter((a) => {
    const id = announcementId(a);
    if (a.Forced) return true; // forced always shows
    return !dismissed.includes(id);
  });

  if (visible.length === 0) return null;

  const handleDismiss = (a: Announcement) => {
    const id = announcementId(a);
    dismissAnnouncement(id);
    setDismissed((prev) => [...prev, id]);
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex flex-col gap-0">
      {visible.map((a) => {
        const isForced = a.Forced;
        return (
          <div
            key={announcementId(a)}
            className={`w-full flex items-start gap-3 px-5 py-3 text-sm transition-all
              ${
                isForced
                  ? "bg-amber-500/20 border-b border-amber-500/30 text-amber-100"
                  : "bg-primary/15 border-b border-primary/25 text-white/90"
              }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isForced ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <Megaphone className="w-4 h-4 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className={`font-semibold mr-2 ${isForced ? "text-amber-300" : "text-primary"}`}>
                {a.Heading}
              </span>
              <span className="text-white/70">{a.Description}</span>
            </div>

            {!isForced && (
              <button
                onClick={() => handleDismiss(a)}
                className="flex-shrink-0 p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                aria-label="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}