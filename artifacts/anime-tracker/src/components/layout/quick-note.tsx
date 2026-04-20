import { useState, useRef, useEffect } from "react";
import { Plus, X, StickyNote, Trash2, ChevronDown } from "lucide-react";

interface Note {
  id: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = "anitime-quick-notes";

function loadNotes(): Note[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function QuickNote() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus textarea when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [open]);

  // Close on backdrop tap (mobile-friendly)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const addNote = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const next = [
      { id: Date.now().toString(), text: trimmed, createdAt: Date.now() },
      ...notes,
    ];
    setNotes(next);
    saveNotes(next);
    setInput("");
    textareaRef.current?.focus();
  };

  const deleteNote = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    saveNotes(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      addNote();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick note"
        className="fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #427AB5 0%, #406AAF 100%)",
          boxShadow: "0 4px 24px rgba(66,122,181,0.45), 0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Sheet — slides up from bottom on mobile, centered on md+ */}
          <div
            ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 md:relative md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto md:max-w-lg md:mx-auto md:rounded-2xl rounded-t-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #16243a 0%, #111827 100%)",
              border: "1px solid rgba(66,122,181,0.25)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(247,221,125,0.08)",
              maxHeight: "85dvh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "rgba(66,122,181,0.2)" }}
            >
              <div className="flex items-center gap-2.5">
                <StickyNote className="w-4.5 h-4.5" style={{ color: "#F7DD7D" }} />
                <span className="font-bold text-sm tracking-wide" style={{ color: "#F7DD7D" }}>
                  Quick Notes
                </span>
                {notes.length > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(247,221,125,0.15)", color: "#F7DD7D" }}
                  >
                    {notes.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
              >
                <ChevronDown className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Input area */}
            <div className="px-5 pt-4 pb-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jot something down…"
                rows={3}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-white/25"
                style={{
                  background: "rgba(66,122,181,0.1)",
                  border: "1px solid rgba(66,122,181,0.25)",
                  color: "#FFE8BE",
                  caretColor: "#F7DD7D",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(247,221,125,0.45)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(66,122,181,0.25)")
                }
              />
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[11px] text-white/25">
                  ⌘↵ to save
                </span>
                <button
                  onClick={addNote}
                  disabled={!input.trim()}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #427AB5, #406AAF)"
                      : "rgba(66,122,181,0.2)",
                    color: "#fff",
                    boxShadow: input.trim()
                      ? "0 2px 12px rgba(66,122,181,0.4)"
                      : "none",
                  }}
                >
                  Save note
                </button>
              </div>
            </div>

            {/* Notes list */}
            {notes.length > 0 && (
              <div
                className="overflow-y-auto px-5 pb-6 space-y-2.5"
                style={{
                  maxHeight: "40dvh",
                  borderTop: "1px solid rgba(66,122,181,0.15)",
                  paddingTop: "12px",
                }}
              >
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="group rounded-xl px-4 py-3 flex gap-3"
                    style={{
                      background: "rgba(66,122,181,0.07)",
                      border: "1px solid rgba(66,122,181,0.15)",
                    }}
                  >
                    <p
                      className="flex-1 text-sm leading-relaxed whitespace-pre-wrap break-words"
                      style={{ color: "#FFE8BE" }}
                    >
                      {note.text}
                    </p>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-white/25 mt-auto">
                        {formatTime(note.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notes.length === 0 && (
              <div className="px-5 pb-8 pt-4 text-center text-white/20 text-sm">
                No notes yet. Type something above ✦
              </div>
            )}

            {/* Safe area spacer for iOS */}
            <div className="h-[env(safe-area-inset-bottom,0px)]" />
          </div>
        </div>
      )}
    </>
  );
}
