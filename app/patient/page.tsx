import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PatientDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div>
          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Patient Dashboard
          </h1>

          <p className="mt-3 text-slate-600">
            Welcome back, {patient?.full_name || "Patient"}.
          </p>
        </div>

        {/* Dashboard cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <a
            href="/book-opd"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="text-3xl">
              🏥
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Book OPD
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Book an appointment with a doctor.
            </p>
          </a>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl">
              📋
            </div>
          
          <Link
  href="/patient/history"
  className="block rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer"
></Link>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Medical History
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              View your previous consultations and prescriptions.
            </p>
          </div>

          

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl">
              📅
            </div>
            <Link
  href="/patient/appointments"
  className="block rounded-2xl bg-white p-6 shadow-sm"
></Link>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Appointments
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              See your upcoming and previous appointments.
            </p>
          </div>

        </div>

        {/* Account information */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            My Profile
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="mt-1 font-semibold">
                {patient?.full_name || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="mt-1 font-semibold">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Phone
              </p>

              <p className="mt-1 font-semibold">
                {patient?.phone || "Not provided"}
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}