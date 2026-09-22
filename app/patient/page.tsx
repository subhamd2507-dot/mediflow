import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PatientDashboard() {
  const supabase = await createClient();

  /* =========================================================
     GET LOGGED-IN USER
  ========================================================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* =========================================================
     GET PATIENT PROFILE
  ========================================================= */

  const { data: patient } = await supabase
    .from("patients")
    .select("full_name, phone, date_of_birth, gender")
    .eq("id", user.id)
    .maybeSingle();

  const patientName = patient?.full_name || "Patient";

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">

        {/* =================================================
            WELCOME HEADER
        ================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--primary-soft)] opacity-60 blur-3xl" />

          <div className="relative">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Patient Dashboard
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Hello, {patientName.split(" ")[0]} 👋
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
                  Manage your appointments, queue information and medical
                  records from one place.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
                  {patientName
                    .split(" ")
                    .map((part: string) => part.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="font-bold">
                    {patientName}
                  </p>

                  <p className="text-sm text-[var(--foreground-muted)]">
                    Patient
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            PRIMARY ACTION
        ================================================== */}

        <section className="mt-6">

          <div className="overflow-hidden rounded-3xl bg-[var(--foreground)] p-7 text-[var(--background)] shadow-md sm:p-8">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em]">
                  <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                  Quick action
                </div>

                <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                  Need to see a doctor?
                </h2>

                <p className="mt-3 leading-7 opacity-75">
                  Book an OPD appointment and keep your healthcare journey
                  organized from the beginning.
                </p>

              </div>

              <Link
                href="/book-opd"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--background)] px-6 py-3.5 text-sm font-bold text-[var(--foreground)] hover:-translate-y-0.5 hover:opacity-90"
              >
                Book an OPD
                <span className="ml-2">
                  →
                </span>
              </Link>

            </div>

          </div>

        </section>


        {/* =================================================
            CARE OVERVIEW
        ================================================== */}

        <section className="mt-8">

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                Your care
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Everything in one place
              </h2>

            </div>

            <p className="hidden text-sm text-[var(--foreground-muted)] sm:block">
              Quick access to your MediFlow tools
            </p>

          </div>


          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* Book OPD */}
            <Link
              href="/book-opd"
              className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-lg"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                  🏥
                </div>

                <span className="text-xl text-[var(--foreground-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]">
                  →
                </span>

              </div>

              <h3 className="mt-6 text-lg font-bold">
                Book OPD
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                Find a doctor and book an available appointment.
              </p>

            </Link>


            {/* Appointments */}
            <Link
              href="/patient/appointments"
              className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-lg"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-xl">
                  📅
                </div>

                <span className="text-xl text-[var(--foreground-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]">
                  →
                </span>

              </div>

              <h3 className="mt-6 text-lg font-bold">
                Appointments
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                View upcoming and previous appointments.
              </p>

            </Link>


            {/* Queue */}
            <Link
              href="/patient/queue"
              className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-lg"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--warning-soft)] text-xl">
                  🎫
                </div>

                <span className="text-xl text-[var(--foreground-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]">
                  →
                </span>

              </div>

              <h3 className="mt-6 text-lg font-bold">
                My Queue
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                Follow your token and queue information.
              </p>

            </Link>


            {/* Medical History */}
            <Link
              href="/patient/history"
              className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-lg"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-xl">
                  📋
                </div>

                <span className="text-xl text-[var(--foreground-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]">
                  →
                </span>

              </div>

              <h3 className="mt-6 text-lg font-bold">
                Medical History
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                Review previous consultations and prescriptions.
              </p>

            </Link>

          </div>

        </section>


        {/* =================================================
            PROFILE
        ================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Patient information */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-7">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                  Profile
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Your information
                </h2>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                👤
              </div>

            </div>


            <div className="mt-7 grid gap-5 sm:grid-cols-2">

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Full Name
                </p>

                <p className="mt-2 font-semibold">
                  {patient?.full_name || "Not available"}
                </p>
              </div>


              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Email
                </p>

                <p className="mt-2 break-all font-semibold">
                  {user.email || "Not available"}
                </p>
              </div>


              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Phone
                </p>

                <p className="mt-2 font-semibold">
                  {patient?.phone || "Not provided"}
                </p>
              </div>


              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Gender
                </p>

                <p className="mt-2 font-semibold capitalize">
                  {patient?.gender || "Not provided"}
                </p>
              </div>

            </div>

          </div>


          {/* Helpful panel */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-7">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
              💡
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Keep your visit organized
            </h2>

            <p className="mt-3 leading-7 text-[var(--foreground-secondary)]">
              Check your appointment details before visiting the hospital,
              keep your medical information available and follow your queue
              when required.
            </p>

            <div className="mt-6 space-y-3">

              <Link
                href="/patient/appointments"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]"
              >
                <span>
                  View appointments
                </span>

                <span>
                  →
                </span>
              </Link>

              <Link
                href="/patient/history"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]"
              >
                <span>
                  View medical history
                </span>

                <span>
                  →
                </span>
              </Link>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER NOTE
        ================================================== */}

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center">

          <p className="text-xs text-[var(--foreground-muted)]">
            MediFlow • Digital Healthcare Platform
          </p>

        </div>

      </div>

    </main>
  );
}