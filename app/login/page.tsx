"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    // Check whether this authenticated account
    // is connected to a doctor profile.

    
    const { data: doctorProfile, error: doctorError } =
      await supabase
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
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="text-center">

          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-3 text-slate-600">
            Login to your MediFlow account.
          </p>

        </div>

        {/* Login Card */}
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-sm text-slate-500">

            Don't have an account?

            <a
              href="/register"
              className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
            >
              Create Account
            </a>

          </div>

        </div>

      </div>
    </main>
  );
}