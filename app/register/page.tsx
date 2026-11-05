
"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!fullName || !email || !password) {
      setError("Please fill in your name, email and password.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            date_of_birth: dateOfBirth,
            phone: phone,
          },
        },
      });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Account could not be created.");
      setLoading(false);
      return;
    }

    setMessage(
      "Account created successfully. Check your email if confirmation is required, then log in."
    );

    setLoading(false);
  }

  return (
   <main className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 px-4 pb-10 pt-24 sm:px-6">
     <div className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-900/10 lg:grid-cols-2">

        {/* LEFT BRANDING PANEL */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#071b3d] via-[#103c78] to-[#087fba] p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">

          {/* Background decorations */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10">
            <a href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl">
                ✚
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  MediFlow
                </h2>
                <p className="text-xs text-blue-100">
                  Digital Healthcare Platform
                </p>
              </div>
            </a>
          </div>

         <div className="relative z-10 my-8 xl:my-12">
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold tracking-wider text-cyan-200">
              YOUR HEALTH, SIMPLIFIED
            </span>

            <h1 className="mt-7 max-w-lg text-5xl font-bold leading-[1.12] tracking-tight xl:text-6xl">
              Healthcare that starts
              <span className="block text-cyan-300">
                with you.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-blue-100/80">
              Create your patient account and take the first
              step towards a smarter, simpler healthcare
              experience.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Manage your patient information",
                "Prepare for doctor consultations",
                "Keep your medical journey organized",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/20 text-cyan-300">
                    ✓
                  </span>
                  <span className="text-sm text-blue-50/90">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-6 text-sm text-blue-100/60">
            Your health journey. One step at a time.
          </div>
        </section>

        {/* RIGHT REGISTRATION PANEL */}
        <section className="flex items-start justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">

          <div className="w-full max-w-md">

            {/* Mobile branding */}
            <a href="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                ✚
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  MediFlow
                </h2>
                <p className="text-xs text-slate-500">
                  Digital Healthcare Platform
                </p>
              </div>
            </a>

            <div className="mb-8">
              <span className="text-sm font-semibold text-blue-600">
                GET STARTED
              </span>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Join MediFlow and make your healthcare
                experience simpler.
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
                {message}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* DATE OF BIRTH */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Date of birth
                </label>

                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  autoComplete="bday"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 6 characters.
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating your account..." : "Create Account"}

                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

            </form>

            {/* LOGIN LINK */}
            <div className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold text-blue-600 transition hover:text-blue-800"
              >
                Sign in
              </a>
            </div>

            {/* FOOTER */}
            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By creating an account, you agree to use MediFlow
              responsibly and protect your personal information.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}
