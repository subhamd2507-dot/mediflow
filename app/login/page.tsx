
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function MedicalMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
      >
        <path d="M12 3v18M3 12h18" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function FeatureIcon({ type }: { type: "calendar" | "records" | "care" }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600">
      {type === "calendar" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
        </svg>
      )}
      {type === "records" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" strokeLinecap="round" />
        </svg>
      )}
      {type === "care" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M20.8 8.6c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" />
          <path d="M8 12h2l1-2 2 4 1-2h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
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
      setError("Login failed. User account was not returned.");
      setLoading(false);
      return;
    }

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
    <main className="min-h-screen bg-[#F6F8FB] text-[#142B4A]">
      {/* Navbar clearance */}
      <div className="px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-2">

            {/* LEFT: Welcome section */}
            <section className="flex flex-col justify-center border-b border-slate-200 bg-[#F0F7FF] px-7 py-10 sm:px-12 sm:py-14 lg:border-b-0 lg:border-r lg:px-14">

              <div className="flex items-center gap-3">
                <MedicalMark />
                <div>
                  <p className="text-lg font-bold tracking-tight text-[#142B4A]">
                    MediFlow
                  </p>
                  <p className="text-xs text-slate-500">
                    Digital Healthcare Platform
                  </p>
                </div>
              </div>

              <div className="mt-10 max-w-md">
                <p className="text-sm font-semibold text-blue-700">
                  YOUR HEALTHCARE, CONNECTED
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[#142B4A] sm:text-5xl">
                  Better care
                  <br />
                  starts here.
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                  Access your appointments, medical records and
                  healthcare journey — all in one place.
                </p>
              </div>

              {/* Features */}
              <div className="mt-9 space-y-5">
                <div className="flex items-center gap-4">
                  <FeatureIcon type="calendar" />
                  <div>
                    <p className="text-sm font-semibold text-[#142B4A]">
                      Manage appointments
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Book and track your visits.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <FeatureIcon type="records" />
                  <div>
                    <p className="text-sm font-semibold text-[#142B4A]">
                      Access medical records
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Keep your health information organized.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <FeatureIcon type="care" />
                  <div>
                    <p className="text-sm font-semibold text-[#142B4A]">
                      Stay connected with care
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Follow your healthcare journey.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-blue-100 pt-5">
                <p className="text-xs text-slate-500">
                  A simpler, more connected healthcare experience.
                </p>
              </div>
            </section>

            {/* RIGHT: Login form */}
            <section className="flex items-center justify-center px-6 py-10 sm:px-12 sm:py-14">
              <div className="w-full max-w-md">

                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
                    MEDIFLOW
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#142B4A]">
                    Welcome back
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Sign in to continue to your MediFlow workspace.
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div
                    role="alert"
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <p className="font-semibold">Login unsuccessful</p>
                    <p className="mt-1">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-slate-500 hover:text-blue-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Registration link */}
                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-500">
                    New to MediFlow?
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  Create an account
                </Link>

                <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                  By continuing, you are accessing the MediFlow
                  healthcare workspace.
                </p>
              </div>
            </section>
          </div>

          {/* Bottom branding */}
          <div className="mt-6 flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
            <p>© {new Date().getFullYear()} MediFlow</p>
            <p>Digital healthcare platform</p>
          </div>
        </div>
      </div>
    </main>
  );
}
