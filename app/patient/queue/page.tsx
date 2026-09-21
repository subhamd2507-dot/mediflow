"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type QueueStatus = {
  appointment_id: string;
  own_token: number;
  current_token: number | null;
  patients_ahead: number;
  estimated_wait_minutes: number;
  appointment_status: string;
  doctor_name: string;
  doctor_specialization: string;
  hospital_name: string;
  department_name: string;
  appointment_date: string;
  appointment_time: string;
};

export default function PatientQueuePage() {
  const supabase = createClient();
  const router = useRouter();

  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadQueue() {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------
      // 1. Check logged-in user
      // ------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // ------------------------------------------
      // 2. Find this patient's active appointment
      // ------------------------------------------

      const { data: appointment, error: appointmentError } =
        await supabase
          .from("appointments")
          .select("id")
          .eq("patient_id", user.id)
          .in("status", [
            "booked",
            "checked_in",
            "waiting",
            "in_consultation",
          ])
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (appointmentError) {
        throw new Error(appointmentError.message);
      }

      // ------------------------------------------
      // 3. Make sure appointment ID exists
      // ------------------------------------------

      if (!appointment || !appointment.id) {
        setQueueStatus(null);
        return;
      }

      const appointmentId = appointment.id;

      // ------------------------------------------
      // 4. Call secure database queue function
      // ------------------------------------------

      const { data, error: queueError } = await supabase.rpc(
        "get_my_queue_status",
        {
          p_appointment_id: appointmentId,
        }
      );

      if (queueError) {
        throw new Error(queueError.message);
      }

      // ------------------------------------------
      // 5. Check returned queue data
      // ------------------------------------------

      if (!data || data.length === 0) {
        setQueueStatus(null);
        return;
      }

      setQueueStatus(data[0]);
    } catch (err) {
      console.error("Queue error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load your queue.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();

    const interval = setInterval(() => {
      loadQueue();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------
  // Loading
  // ------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-slate-600">
            Loading your queue...
          </p>
        </div>
      </main>
    );
  }

  // ------------------------------------------
  // Error
  // ------------------------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">

          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            OPD Queue
          </h1>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

            <h2 className="text-xl font-bold text-red-700">
              Queue Error
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>

          </div>

        </div>
      </main>
    );
  }

  // ------------------------------------------
  // No appointment
  // ------------------------------------------

  if (!queueStatus) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">

          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            OPD Queue
          </h1>

          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">

            <div className="text-5xl">
              📅
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No active appointment
            </h2>

            <p className="mt-2 text-slate-600">
              You don't currently have an active OPD appointment.
            </p>

            <a
              href="/book-opd"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Book OPD
            </a>

          </div>

        </div>
      </main>
    );
  }

  // ------------------------------------------
  // Status label
  // ------------------------------------------

  const statusLabel = queueStatus.appointment_status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  // ------------------------------------------
  // Main queue page
  // ------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div>
          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Your OPD Queue
          </h1>

          <p className="mt-3 text-slate-600">
            Track your position without standing in a physical queue.
          </p>
        </div>


        {/* Doctor information */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm font-semibold text-blue-600">
            {queueStatus.department_name}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {queueStatus.doctor_name}
          </h2>

          <p className="mt-1 text-slate-600">
            {queueStatus.doctor_specialization}
          </p>

          <p className="mt-4 font-semibold text-slate-800">
            {queueStatus.hospital_name}
          </p>

        </div>


        {/* Queue cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">

          {/* Your token */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <p className="text-sm text-slate-500">
              Your Token
            </p>

            <p className="mt-2 text-5xl font-bold text-blue-600">
              #{queueStatus.own_token}
            </p>

          </div>


          {/* Current token */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <p className="text-sm text-slate-500">
              Current Token
            </p>

            <p className="mt-2 text-5xl font-bold text-slate-900">
              #{queueStatus.current_token ?? "-"}
            </p>

          </div>


          {/* Patients ahead */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <p className="text-sm text-slate-500">
              Patients Ahead
            </p>

            <p className="mt-2 text-5xl font-bold text-slate-900">
              {queueStatus.patients_ahead}
            </p>

          </div>

        </div>


        {/* Estimated wait */}
        <div className="mt-6 rounded-3xl bg-blue-600 p-8 text-center text-white">

          <p className="text-sm font-medium text-blue-100">
            ESTIMATED WAITING TIME
          </p>

          <p className="mt-2 text-5xl font-bold">
            {queueStatus.estimated_wait_minutes} min
          </p>

          <p className="mt-4 text-blue-100">
            This estimate updates as the queue moves.
          </p>

        </div>


        {/* Appointment status */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Appointment Status
          </h2>

          <div className="mt-5 flex items-center justify-between">

            <span className="text-slate-500">
              Current status
            </span>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {statusLabel}
            </span>

          </div>

          <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-500">
                Appointment Date
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {queueStatus.appointment_date}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Appointment Time
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {queueStatus.appointment_time}
              </p>
            </div>

          </div>

        </div>


        {/* MediFlow explanation */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <h2 className="font-bold text-blue-900">
            💡 Why MediFlow?
          </h2>

          <p className="mt-2 leading-7 text-blue-800">
            Instead of spending hours standing in a hospital queue,
            you can monitor your position and plan when to reach
            the hospital.
          </p>

        </div>

      </div>

    </main>
  );
}