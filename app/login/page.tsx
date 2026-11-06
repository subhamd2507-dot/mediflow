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
      await supabase.auth.signInWithPassword({ email, password });

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

    // Check whether this account belongs to a doctor.
    const { data: doctorProfile, error: doctorError } = await supabase
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
    <main className="min-h-[calc(100vh-76px)] bg-[#F5F8FC] text-[#142B4A]">
      <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-start px-5 pb-10 pt-24 sm:px-6 lg:px-8">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-120px] top-[-100px] h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
          <div className="absolute bottom-[-140px] right-[-100px] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        {/* Main layout */}
        <div className="relative grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* LEFT SIDE */}
          <section className="hidden lg:block">
            <div className="max-w-xl">
              {/* Small badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700">
                <span className="h-2 w-2 rounded-full bg-teal-600" />
                Secure healthcare access
              </div>

              {/* Heading */}
              <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight text-[#142B4A] xl:text-6xl">
                Your healthcare,
                <span className="block text-teal-500">connected.</span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                Sign in to manage appointments, follow your OPD journey, review
                medical information and stay connected with your healthcare team.
              </p>

              {/* Feature list */}
              <div className="mt-9 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Your healthcare in one place
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Appointments, queue and medical records.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                    ◉
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Designed for patients and doctors
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      The right workspace for every role.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    +
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Built for a simpler care journey
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Less confusion before and after your visit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Small trust section */}
              <div className="mt-10 border-t border-slate-200 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  MediFlow
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Smart digital healthcare workflow.
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE — LOGIN CARD */}
          <section className="w-full">
            <div className="mx-auto max-w-md rounded-3xl border border-[#DFE8F1] bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
              {/* Card header */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                      MediFlow
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#142B4A]">
                      Welcome back
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-xl">
                    🩺
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Sign in to continue to your MediFlow workspace.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex gap-3">
                    <span className="mt-0.5">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        Login unsuccessful
                      </p>
                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="mt-7 space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Email address
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      @
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      
className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"

                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      •••
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-20 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F9F92] px-6 py-4 text-sm font-semibold text-white shadow-md shadow-teal-900/10 transition-all duration-200 hover:bg-[#0D887E] hover:shadow-lg hover:shadow-teal-900/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span className="text-base">→</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-500">
                  New to MediFlow?
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Register */}
              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-2xl border border-teal-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800"
              >
                Create an account
              </Link>

              {/* Footer text */}
              <p className="mt-6 text-center text-xs leading-5 text-slate-500">
                By continuing, you are accessing the MediFlow healthcare
                workspace.
              </p>
            </div>

            {/* Mobile supporting text */}
            <div className="mx-auto mt-6 max-w-md text-center lg:hidden">
              <p className="text-sm leading-6 text-slate-600">
                Appointments, queue information and medical records — connected
                in one place.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
