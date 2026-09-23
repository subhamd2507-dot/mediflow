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

  /* =========================================================
     LOAD LOGGED-IN USER
  ========================================================= */

  /* =========================================================
   LOAD LOGGED-IN USER + LISTEN FOR AUTH CHANGES
========================================================= */

useEffect(() => {
  async function loadUser(userId: string) {
    setLoading(true);

    /* Check whether the authenticated account is a doctor */
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

    /* Otherwise check whether the account is a patient */
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

  /*
    Listen for login/logout/session changes.

    Supabase sends an event when:
    - the page first loads
    - a user logs in
    - a user logs out
    - the session changes
  */

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    /*
      Delay the database query slightly so we do not perform
      Supabase database operations directly inside the auth callback.
    */
    setTimeout(() => {
      void loadUser(session.user.id);
    }, 0);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  /* =========================================================
     LOAD SAVED THEME
  ========================================================= */

  useEffect(() => {
    const savedTheme = localStorage.getItem("mediflow-theme") as Theme | null;

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

      const pathname = usePathname();

const isPublicPage =
  pathname === "/" ||
  pathname === "/login" ||
  pathname === "/register";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6">

        {/* =====================================================
            LEFT SIDE — LOGO
        ====================================================== */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
            🩺
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-tight text-[var(--foreground)]">
              MediFlow
            </h1>

            <p className="text-[11px] text-[var(--foreground-muted)]">
              Digital Healthcare Platform
            </p>
          </div>

        </Link>


        {/* =====================================================
            CENTER — NAVIGATION
        ====================================================== */}

        <nav className="hidden items-center gap-7 md:flex">

          <a
            href="/#features"
            className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary)]"
          >
            Features
          </a>

          <a
            href="/#how-it-works"
            className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary)]"
          >
            How It Works
          </a>

          <a
            href="/#for-users"
            className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary)]"
          >
            Patients & Doctors
          </a>

        </nav>


        {/* =====================================================
            RIGHT SIDE — PROFILE BUTTON
        ====================================================== */}
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
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-1.5 pr-3 shadow-sm hover:border-[var(--primary)] hover:shadow-md"
          >

            {/* Circular Avatar */}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              {avatarText}
            </span>

            {/* Name */}
            <span className="max-w-[120px] truncate text-sm font-semibold text-[var(--foreground)] sm:max-w-[180px]">
              {displayName}
            </span>

            {/* Arrow */}
            <span className="text-xs text-[var(--foreground-muted)]">
              ▾
            </span>

          </button>


          {/* =================================================
              DROPDOWN MENU
          ================================================== */}

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">

              {/* Profile Header */}
              <div className="border-b border-[var(--border)] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                    {avatarText}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-bold text-[var(--foreground)]">
                      {displayName}
                    </p>

                    <p className="mt-0.5 text-xs capitalize text-[var(--foreground-muted)]">
                      {profile?.role || "Not signed in"}
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  GUEST MENU
              ================================================== */}

              {!profile && !loading && (
                <div className="p-2">

                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">🔐</span>
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">➕</span>
                    Create Account
                  </Link>

                </div>
              )}


              {/* =================================================
                  PATIENT MENU
              ================================================== */}

              {profile?.role === "patient" && (
                <div className="p-2">

                  <Link
                    href="/patient"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">🏠</span>
                    Patient Dashboard
                  </Link>

                  <Link
                    href="/patient/appointments"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">📅</span>
                    My Appointments
                  </Link>

                  <Link
                    href="/patient/history"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">📋</span>
                    Medical History
                  </Link>

                  <Link
                    href="/book-opd"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">🏥</span>
                    Book OPD
                  </Link>

                </div>
              )}


              {/* =================================================
                  DOCTOR MENU
              ================================================== */}

              {profile?.role === "doctor" && (
                <div className="p-2">

                  <Link
                    href="/doctor"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">🏠</span>
                    Doctor Dashboard
                  </Link>

                  <Link
                    href="/doctor"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">👥</span>
                    Today's Queue
                  </Link>

                  <Link
                    href="/doctor"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-lg">📋</span>
                    Medical Records
                  </Link>

                </div>
              )}


              {/* =================================================
                  APPEARANCE
              ================================================== */}

              <div className="border-t border-[var(--border)] p-2">

                <button
                  type="button"
                  onClick={() => setThemeOpen((value) => !value)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]"
                >

                  <span className="flex items-center gap-3">
                    <span className="text-lg">🎨</span>
                    Appearance
                  </span>

                  <span className="text-xs text-[var(--foreground-muted)]">
                    {theme === "system"
                      ? "System"
                      : theme === "light"
                      ? "Light"
                      : "Dark"}
                  </span>

                </button>


                {themeOpen && (
                  <div className="mt-1 rounded-xl bg-[var(--surface-soft)] p-2">

                    <button
                      type="button"
                      onClick={() => changeTheme("system")}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                        theme === "system"
                          ? "bg-[var(--surface)] font-bold text-[var(--primary)]"
                          : "text-[var(--foreground-secondary)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      <span>🖥️</span>
                      System
                    </button>

                    <button
                      type="button"
                      onClick={() => changeTheme("light")}
                      className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                        theme === "light"
                          ? "bg-[var(--surface)] font-bold text-[var(--primary)]"
                          : "text-[var(--foreground-secondary)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      <span>☀️</span>
                      Light
                    </button>

                    <button
                      type="button"
                      onClick={() => changeTheme("dark")}
                      className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                        theme === "dark"
                          ? "bg-[var(--surface)] font-bold text-[var(--primary)]"
                          : "text-[var(--foreground-secondary)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      <span>🌙</span>
                      Dark
                    </button>

                  </div>
                )}

              </div>


              {/* =================================================
                  LOGOUT
              ================================================== */}

              {profile && (
                <div className="border-t border-[var(--border)] p-2">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                  >
                    <span className="text-lg">🚪</span>
                    Logout
                  </button>

                </div>
              )}

            </div>
          )}

        </div>
         )}

         {isPublicPage && !profile && (
  <div className="flex items-center gap-2">

    <Link
      href="/login"
      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--foreground-secondary)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
    >
      Login
    </Link>

    <Link
      href="/register"
      className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
    >
      Get Started
    </Link>

  </div>
)}

      </div>

    </header>
  );
}