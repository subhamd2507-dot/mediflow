"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  name: string;
  role: "patient" | "doctor";
};

type Theme = "system" | "light" | "dark";

export default function Navbar() {
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  const menuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register";

  /* =========================================================
     LOAD LOGGED-IN USER
  ========================================================= */

  useEffect(() => {
    async function loadUser(userId: string) {
      setLoading(true);

      /* Check doctor */
      const { data: doctor, error: doctorError } = await supabase
        .from("doctors")
        .select("name")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (doctorError) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (doctor) {
        setProfile({
          name: doctor.name,
          role: "doctor",
        });

        setLoading(false);
        return;
      }

      /* Check patient */
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      if (patientError) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (patient) {
        setProfile({
          name: patient.full_name || "Patient",
          role: "patient",
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setTimeout(() => {
        void loadUser(session.user.id);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  /* =========================================================
     LOAD SAVED THEME
  ========================================================= */

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "mediflow-theme"
    ) as Theme | null;

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      setTheme("system");
      applyTheme("system");
    }
  }, []);

  /* =========================================================
     APPLY THEME
  ========================================================= */

  function applyTheme(selectedTheme: Theme) {
    const root = document.documentElement;

    root.classList.remove("light", "dark");

    if (selectedTheme === "light") {
      root.classList.add("light");
    }

    if (selectedTheme === "dark") {
      root.classList.add("dark");
    }
  }

  function changeTheme(selectedTheme: Theme) {
    setTheme(selectedTheme);

    if (selectedTheme === "system") {
      localStorage.removeItem("mediflow-theme");
      applyTheme("system");
    } else {
      localStorage.setItem("mediflow-theme", selectedTheme);
      applyTheme(selectedTheme);
    }

    setThemeOpen(false);
  }

  /* =========================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        setThemeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     LOGOUT
  ========================================================= */

  async function handleLogout() {
    await supabase.auth.signOut();

    setProfile(null);
    setMenuOpen(false);
    setThemeOpen(false);

    window.location.href = "/login";
  }

  /* =========================================================
     AVATAR INITIALS
  ========================================================= */

  function getInitials(name: string) {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  const displayName =
    loading ? "Loading..." : profile ? profile.name : "Guest";

  const avatarText =
    profile && profile.name
      ? getInitials(profile.name)
      : "G";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-xl">

      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-6">

        {/* =====================================================
            LOGO
        ====================================================== */}

        <Link
          href="/"
          className="group flex items-center gap-3"
        >

          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)] text-lg shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-primary)]">
            <span className="transition-transform duration-300 group-hover:scale-110">
              🩺
            </span>
          </div>

          <div className="hidden sm:block">

            <h1 className="text-lg font-bold leading-tight tracking-tight text-[var(--foreground)]">
              MediFlow
            </h1>

            <p className="text-[11px] font-medium text-[var(--foreground-muted)]">
              Digital Healthcare Platform
            </p>

          </div>

        </Link>


        {/* =====================================================
            CENTER NAVIGATION
        ====================================================== */}

        <nav className="hidden items-center gap-2 md:flex">

          <a
            href="/#features"
            className="group relative rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-300 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
          >
            Features

            <span className="absolute bottom-1 left-4 right-4 h-0.5 origin-left scale-x-0 rounded-full bg-[var(--primary)] transition-transform duration-300 group-hover:scale-x-100" />
          </a>

          <a
            href="/#how-it-works"
            className="group relative rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-300 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
          >
            How It Works

            <span className="absolute bottom-1 left-4 right-4 h-0.5 origin-left scale-x-0 rounded-full bg-[var(--primary)] transition-transform duration-300 group-hover:scale-x-100" />
          </a>

          <a
            href="/#for-users"
            className="group relative rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-300 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
          >
            Patients & Doctors

            <span className="absolute bottom-1 left-4 right-4 h-0.5 origin-left scale-x-0 rounded-full bg-[var(--primary)] transition-transform duration-300 group-hover:scale-x-100" />
          </a>

        </nav>


        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex items-center gap-2">

          {/* Public buttons */}
          {isPublicPage && !profile && !loading && (
            <div className="flex items-center gap-2">

              <Link
                href="/login"
                className="mf-btn mf-btn-ghost hidden sm:inline-flex"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="mf-btn mf-btn-primary"
              >
                <span className="hidden sm:inline">
                  Get Started
                </span>

                <span className="sm:hidden">
                  Start
                </span>

                <span>→</span>
              </Link>

            </div>
          )}


          {/* Profile */}
          {!(isPublicPage && !profile) && (
            <div
              className="relative"
              ref={menuRef}
            >

              <button
                type="button"
                onClick={() => {
                  setMenuOpen((value) => !value);
                  setThemeOpen(false);
                }}
                className={`group flex items-center gap-2 rounded-2xl border px-1.5 py-1.5 pr-3 shadow-sm transition-all duration-300 ${
                  menuOpen
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-[var(--shadow-primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md"
                }`}
              >

                {/* Avatar */}
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gradient-primary)] text-xs font-bold text-white shadow-sm">
                  {avatarText}
                </span>

                {/* Name */}
                <span className="max-w-[100px] truncate text-sm font-semibold text-[var(--foreground)] sm:max-w-[160px]">
                  {displayName}
                </span>

                {/* Arrow */}
                <span
                  className={`text-xs text-[var(--foreground-muted)] transition-transform duration-300 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>

              </button>


              {/* =================================================
                  DROPDOWN
              ================================================== */}

              {menuOpen && (
                <div className="mf-glass absolute right-0 mt-3 w-[300px] overflow-hidden rounded-3xl border border-[var(--border)] shadow-xl">

                  {/* Profile header */}
                  <div className="bg-[var(--gradient-soft)] p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gradient-primary)] text-sm font-bold text-white shadow-md">
                        {avatarText}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate font-bold text-[var(--foreground)]">
                          {displayName}
                        </p>

                        <div className="mt-1">

                          <span className="mf-status mf-status-info">
                            {profile?.role === "doctor"
                              ? "Doctor"
                              : profile?.role === "patient"
                              ? "Patient"
                              : "Guest"}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* Guest menu */}
                  {!profile && !loading && (
                    <div className="p-2">

                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)] transition-transform duration-200 group-hover:scale-105">
                          🔐
                        </span>

                        <span>
                          Login
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>

                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)] transition-transform duration-200 group-hover:scale-105">
                          ➕
                        </span>

                        <span>
                          Create Account
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>

                      </Link>

                    </div>
                  )}


                  {/* Patient menu */}
                  {profile?.role === "patient" && (
                    <div className="p-2">

                      <Link
                        href="/patient"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)] group-hover:scale-105">
                          🏠
                        </span>

                        <span>
                          Patient Dashboard
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </Link>


                      <Link
                        href="/patient/appointments"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                          📅
                        </span>

                        <span>
                          My Appointments
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </Link>


                      <Link
                        href="/patient/history"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                          📋
                        </span>

                        <span>
                          Medical History
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </Link>


                      <Link
                        href="/book-opd"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                          🏥
                        </span>

                        <span>
                          Book OPD
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </Link>

                    </div>
                  )}


                  {/* Doctor menu */}
                  {profile?.role === "doctor" && (
                    <div className="p-2">

                      <Link
                        href="/doctor"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                          🏠
                        </span>

                        <span>
                          Doctor Dashboard
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </Link>


                      <Link
                        href="/doctor"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                          👥
                        </span>

                        <span>
                          Today's Queue
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </Link>


                      <Link
                        href="/doctor"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                          📋
                        </span>

                        <span>
                          Medical Records
                        </span>

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </Link>

                    </div>
                  )}


                  {/* Appearance */}
                  <div className="border-t border-[var(--border)] p-2">

                    <button
                      type="button"
                      onClick={() => setThemeOpen((value) => !value)}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] transition-all duration-200 hover:bg-[var(--surface-soft)]"
                    >

                      <span className="flex items-center gap-3">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                          🎨
                        </span>

                        Appearance

                      </span>

                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                        {theme}
                      </span>

                    </button>


                    {themeOpen && (
                      <div className="mt-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-2">

                        <button
                          type="button"
                          onClick={() => changeTheme("system")}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                            theme === "system"
                              ? "bg-[var(--surface)] font-bold text-[var(--primary)] shadow-sm"
                              : "text-[var(--foreground-secondary)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          <span>🖥️</span>
                          System

                          {theme === "system" && (
                            <span className="ml-auto text-[var(--primary)]">
                              ✓
                            </span>
                          )}
                        </button>


                        <button
                          type="button"
                          onClick={() => changeTheme("light")}
                          className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                            theme === "light"
                              ? "bg-[var(--surface)] font-bold text-[var(--primary)] shadow-sm"
                              : "text-[var(--foreground-secondary)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          <span>☀️</span>
                          Light

                          {theme === "light" && (
                            <span className="ml-auto text-[var(--primary)]">
                              ✓
                            </span>
                          )}
                        </button>


                        <button
                          type="button"
                          onClick={() => changeTheme("dark")}
                          className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                            theme === "dark"
                              ? "bg-[var(--surface)] font-bold text-[var(--primary)] shadow-sm"
                              : "text-[var(--foreground-secondary)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          <span>🌙</span>
                          Dark

                          {theme === "dark" && (
                            <span className="ml-auto text-[var(--primary)]">
                              ✓
                            </span>
                          )}
                        </button>

                      </div>
                    )}

                  </div>


                  {/* Logout */}
                  {profile && (
                    <div className="border-t border-[var(--border)] p-2">

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--danger)] transition-all duration-200 hover:bg-[var(--danger-soft)]"
                      >

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--danger-soft)]">
                          🚪
                        </span>

                        Logout

                        <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>

                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </header>
  );
}