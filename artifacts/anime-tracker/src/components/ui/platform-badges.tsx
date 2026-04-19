import { AnimeExternalLink } from "@/lib/anilist";

interface PlatformBadgesProps {
  links: AnimeExternalLink[];
  className?: string;
  limit?: number;
}

interface PlatformConfig {
  label: string;
  bg: string;
  text: string;
  price: string | null; // monthly subscription price, null = free / no sub needed
}

function getPlatformConfig(site: string): PlatformConfig | null {
  const s = site.toLowerCase();
  if (s.includes("crunchyroll"))
    return { label: "Crunchyroll", bg: "#F47521", text: "#fff", price: "$7.99/mo" };
  if (s.includes("netflix"))
    return { label: "Netflix", bg: "#E50914", text: "#fff", price: "$17.99/mo" };
  if (s.includes("funimation"))
    return { label: "Funimation", bg: "#5B0BB5", text: "#fff", price: "$7.99/mo" };
  if (s.includes("amazon") || s.includes("prime"))
    return { label: "Prime Video", bg: "#00A8E1", text: "#fff", price: "$8.99/mo" };
  if (s.includes("hidive"))
    return { label: "HIDIVE", bg: "#00AEEF", text: "#fff", price: "$4.99/mo" };
  if (s.includes("disney"))
    return { label: "Disney+", bg: "#113CCF", text: "#fff", price: "$9.99/mo" };
  if (s.includes("hulu"))
    return { label: "Hulu", bg: "#1CE783", text: "#000", price: "$7.99/mo" };
  if (s.includes("bilibili"))
    return { label: "Bilibili", bg: "#00A1D6", text: "#fff", price: null };
  if (s.includes("vrv"))
    return { label: "VRV", bg: "#FFE000", text: "#000", price: "$9.99/mo" };
  return null;
}

export function PlatformBadges({ links, className = "", limit }: PlatformBadgesProps) {
  const safeLinks = Array.isArray(links) ? links : []
  const streamingLinks = safeLinks
    .map(link => ({ link, config: getPlatformConfig(link.site) }))
    .filter(({ config }) => config !== null) as Array<{ link: AnimeExternalLink; config: PlatformConfig }>;

  if (streamingLinks.length === 0) {
    return (
      <span className={`text-xs text-white/30 ${className}`}>
        No official stream info
      </span>
    );
  }

  const displayed = limit ? streamingLinks.slice(0, limit) : streamingLinks;
  const extra = limit ? streamingLinks.length - limit : 0;

  return (
    <div className={`flex flex-wrap gap-1.5 items-center ${className}`}>
      {displayed.map(({ link, config }, i) => (
        <a
          key={`${link.site}-${i}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ backgroundColor: config.bg, color: config.text }}
          className="group/badge relative flex flex-col items-center text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity"
          title={config.price ? `${config.label} — ${config.price}` : config.label}
        >
          <span>{config.label}</span>
          {config.price && (
            <span
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none bg-black/80 text-white/80 text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap z-20"
            >
              {config.price}
            </span>
          )}
        </a>
      ))}
      {extra > 0 && (
        <span className="text-[11px] text-white/40 font-medium">+{extra}</span>
      )}
    </div>
  );
}
