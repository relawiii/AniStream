import { useState, useEffect } from "react";
import { Megaphone, AlertTriangle } from "lucide-react";

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

function announcementId(a: Announcement): string {
  return btoa(encodeURIComponent(`${a.Heading}||${a.Description}`)).slice(0, 32);
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDismissed(getDismissedIds());
    fetch(RAW_URL)
      .then((r) => r.json())
      .then((data) => {
        const items: Announcement[] = Array.isArray(data) ? data : [data];
        setAnnouncements(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  // Forced ones always show; normal ones only if not dismissed
  const visible = announcements.filter((a) =>
    a.Forced ? true : !dismissed.includes(announcementId(a))
  );

  if (visible.length === 0) return null;

  // Clamp index in case list shrinks after a dismiss
  const safeIndex = Math.min(index, visible.length - 1);
  const announcement = visible[safeIndex];
  const isForced = announcement.Forced;
  const isLast = safeIndex >= visible.length - 1;

  const handleGotIt = () => {
    // Dismiss this normal announcement so it never shows again
    const id = announcementId(announcement);
    dismissAnnouncement(id);
    const next = [...dismissed, id];
    setDismissed(next);

    // After dismissing, the visible list shrinks — don't advance index,
    // the same index will now point to the next item (or list will be empty)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden
          ${isForced ? "bg-[#1a1200] border-amber-500/40" : "bg-[#111827] border-white/10"}`}
      >
        {/* Accent bar */}
        <div className={`h-1 w-full ${isForced ? "bg-amber-500" : "bg-primary"}`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className={`mt-0.5 p-2 rounded-lg ${isForced ? "bg-amber-500/15" : "bg-primary/15"}`}>
              {isForced
                ? <AlertTriangle className="w-5 h-5 text-amber-400" />
                : <Megaphone className="w-5 h-5 text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${isForced ? "text-amber-500" : "text-primary"}`}>
                {isForced ? "Important" : "Announcement"}
              </p>
              <h2 className="text-white font-bold text-lg leading-snug">{announcement.Heading}</h2>
            </div>
          </div>

          {/* Body */}
          <p className="text-white/70 text-sm leading-relaxed mb-6">{announcement.Description}</p>

          {/* Footer — normal announcements only; forced = no buttons */}
          {!isForced && (
            <div className="flex items-center justify-between gap-3">
              {visible.filter((a) => !a.Forced).length > 1 && (
                <span className="text-white/30 text-xs">{safeIndex + 1} / {visible.length}</span>
              )}
              <div className="ml-auto">
                <button
                  onClick={handleGotIt}
                  className="px-4 py-2 text-sm rounded-lg font-medium bg-primary hover:bg-primary/80 text-white transition-all"
                >
                  {isLast ? "Got it" : "Got it"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}