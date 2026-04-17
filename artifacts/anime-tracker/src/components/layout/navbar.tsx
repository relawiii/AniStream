import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Bell, Menu, X, Bookmark } from "lucide-react";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useFollowsContext } from "@/hooks/use-follows";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showJST, setShowJST } = useAppSettings();
  const { follows } = useFollowsContext();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/schedule", label: "Schedule" },
    { href: "/following", label: "My List" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? "bg-[#0a0a0a]/95 backdrop-blur-sm shadow-lg"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="text-2xl font-black text-primary tracking-tighter cursor-pointer select-none">
              Ani<span className="text-white">Stream</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`cursor-pointer transition-colors ${
                    location === link.href
                      ? "text-white font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* JST Toggle */}
          <button
            onClick={() => setShowJST(!showJST)}
            className={`hidden md:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded transition-all border ${
              showJST
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
            }`}
          >
            JST
          </button>

          {/* Following count */}
          <Link href="/following">
            <button className="relative text-white/70 hover:text-white transition-colors p-1.5">
              <Bookmark className="w-5 h-5" />
              {follows && follows.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {follows.length > 9 ? "9+" : follows.length}
                </span>
              )}
            </button>
          </Link>

          {/* Notification bell */}
          <button className="relative text-white/70 hover:text-white transition-colors p-1.5">
            <Bell className="w-5 h-5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white p-1.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-4 bg-[#0a0a0a]/95 backdrop-blur-sm">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <div
                className={`text-base font-medium cursor-pointer py-1 ${
                  location === link.href ? "text-white font-bold" : "text-white/60"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </div>
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => setShowJST(!showJST)}
              className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded border ${
                showJST
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-white/5 text-white/50 border-white/10"
              }`}
            >
              {showJST ? "JST On" : "JST Off"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
