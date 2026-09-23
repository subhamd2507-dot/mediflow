"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError(
        "Login failed. User account was not returned."
      );
      setLoading(false);
      return;
    }

    /* Check whether this account belongs to a doctor */

    const {
      data: doctorProfile,
      error: doctorError,
    } = await supabase
      .from("doctors")
      .select("id")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    if (doctorError) {
      setError(doctorError.message);
      setLoading(false);
      return;
    }

    if (doctorProfile) {
      router.push("/doctor");
    } else {
      router.push("/patient");
    }

    router.refresh();
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[var(--background)] text-[var(--foreground)]">

      <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-5 py-10 sm:px-6 lg:px-8">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute left-[-120px] top-[-100px] h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />

          <div className="absolute bottom-[-140px] right-[-100px] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        </div>


        {/* Main layout */}
        <div className="relative grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">

          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <section className="hidden lg:block">

            <div className="max-w-xl">

              {/* Small badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">

                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />

                Secure healthcare access

              </div>


              {/* Heading */}
              <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">

                Your healthcare,
                <span className="block text-[var(--primary)]">
                  connected.
                </span>

              </h1>


              {/* Description */}
              <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--foreground-secondary)]">

                Sign in to manage appointments, follow your OPD
                journey, review medical information and stay
                connected with your healthcare team.

              </p>


              {/* Feature list */}
              <div className="mt-9 space-y-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold">
                      Your healthcare in one place
                    </p>

                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      Appointments, queue and medical records.
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                    ◉
                  </div>

                  <div>
                    <p className="font-semibold">
                      Designed for patients and doctors
                    </p>

                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      The right workspace for every role.
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning-soft)] text-[var(--warning)]">
                    +
                  </div>

                  <div>
                    <p className="font-semibold">
                      Built for a simpler care journey
                    </p>

                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      Less confusion before and after your visit.
                    </p>
                  </div>

                </div>

              </div>


              {/* Small trust section */}
              <div className="mt-10 border-t border-[var(--border)] pt-6">

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                  MediFlow
                </p>

                <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                  Smart digital healthcare workflow.
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              RIGHT SIDE — LOGIN CARD
          ================================================== */}

          <section className="w-full">

            <div className="mx-auto max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl shadow-black/10 sm:p-8">

              {/* Card header */}
              <div>

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                      MediFlow
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight">
                      Welcome back
                    </h2>

                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                    🩺
                  </div>

                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--foreground-secondary)]">
                  Sign in to continue to your MediFlow workspace.
                </p>

              </div>


              {/* Error */}
              {error && (
                <div className="mt-6 rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-4">

                  <div className="flex gap-3">

                    <span className="mt-0.5">
                      ⚠️
                    </span>

                    <div>

                      <p className="text-sm font-bold text-[var(--danger)]">
                        Login unsuccessful
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[var(--danger)]">
                        {error}
                      </p>

                    </div>

                  </div>

                </div>
              )}


              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="mt-7 space-y-5"
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold"
                  >
                    Email address
                  </label>

                  <div className="relative mt-2">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                      @
                    </span>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-soft)] py-3.5 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />

                  </div>

                </div>


                {/* Password */}
                <div>

                  <div className="flex items-center justify-between gap-4">

                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold"
                    >
                      Password
                    </label>

                  </div>

                  <div className="relative mt-2">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                      •••
                    </span>

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-soft)] py-3.5 pl-12 pr-20 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>


                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/15 transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span className="text-base">
                        →
                      </span>
                    </>
                  )}

                </button>

              </form>


              {/* Divider */}
              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-[var(--border)]" />

                <span className="text-xs font-medium text-[var(--foreground-muted)]">
                  New to MediFlow?
                </span>

                <div className="h-px flex-1 bg-[var(--border)]" />

              </div>


              {/* Register */}
              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-soft)] px-6 py-3.5 text-sm font-bold transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
              >
                Create an account
              </Link>


              {/* Footer text */}
              <p className="mt-6 text-center text-xs leading-5 text-[var(--foreground-muted)]">
                By continuing, you are accessing the MediFlow
                healthcare workspace.
              </p>

            </div>


            {/* Mobile supporting text */}
            <div className="mx-auto mt-6 max-w-md text-center lg:hidden">

              <p className="text-sm leading-6 text-[var(--foreground-secondary)]">
                Appointments, queue information and medical
                records — connected in one place.
              </p>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}