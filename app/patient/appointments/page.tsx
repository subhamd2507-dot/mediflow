"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  qualification: string | null;
  experience_years: number | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  token_number: number | null;
  status: string;
  doctor_id: string;
};

type AppointmentWithDoctor = Appointment & {
  doctor: Doctor | null;
};

export default function AppointmentsPage() {
  const supabase = createClient();

  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>(
    []
  );
  const [queueInfo, setQueueInfo] = useState<
  Record<string, { currentlyConsulting: number | null; patientsAhead: number }>
>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  loadAppointments();

  const interval = setInterval(() => {
    loadAppointments(false);
  }, 10000);

  return () => {
    clearInterval(interval);
  };
}, []);

  async function loadAppointments(showLoading = true) {
     try {
    if (showLoading) {
  setLoading(true);
}
      setError("");

      // 1. Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        window.location.href = "/login";

        
    return;
  }

      // 2. Find patient's profile
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (patientError) {
        throw new Error(patientError.message);
      }

      if (!patient) {
        throw new Error("Patient profile not found.");
      }

      // 3. Get patient's appointments
      const { data: appointmentData, error: appointmentError } =
        await supabase
          .from("appointments")
          .select(
            "id, appointment_date, appointment_time, token_number, status, doctor_id"
          )
          .eq("patient_id", patient.id)
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false });

      if (appointmentError) {
        throw new Error(appointmentError.message);
      }

      if (!appointmentData || appointmentData.length === 0) {
        setAppointments([]);
        return;
      }

      // 4. Get doctor IDs
      const doctorIds = [
        ...new Set(appointmentData.map((item) => item.doctor_id)),
      ];

      // 5. Get doctors
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select(
          "id, name, specialization, qualification, experience_years"
        )
        .in("id", doctorIds);

      if (doctorError) {
        throw new Error(doctorError.message);
      }

      // 6. Combine appointment + doctor
      const finalData = appointmentData.map((appointment) => ({
        ...appointment,
        doctor:
          doctorData?.find((doctor) => doctor.id === appointment.doctor_id) ??
          null,
      }));

      setAppointments(finalData);
      setAppointments(finalData);

const queueResults = await Promise.all(
  finalData.map(async (appointment) => {
    const { data, error } = await supabase.rpc(
      "get_patient_queue_info",
      {
        p_appointment_id: appointment.id,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: appointment.id,
      currentlyConsulting:
        data?.[0]?.currently_consulting ?? null,
      patientsAhead:
        data?.[0]?.patients_ahead ?? 0,
    };
  })
);

const newQueueInfo: Record<
  string,
  { currentlyConsulting: number | null; patientsAhead: number }
> = {};

queueResults.forEach((item) => {
  newQueueInfo[item.id] = {
    currentlyConsulting: item.currentlyConsulting,
    patientsAhead: item.patientsAhead,
  };
});

setQueueInfo(newQueueInfo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }

  function getQueueInfo(appointment: Appointment) {
  if (appointment.token_number === null) {
    return {
      currentlyConsulting: null,
      patientsAhead: 0,
    };
  }

  const sameDoctorAppointments = appointments.filter(
    (item) =>
      item.doctor_id === appointment.doctor_id &&
      item.appointment_date === appointment.appointment_date &&
      item.status !== "cancelled" &&
      item.token_number !== null
  );

  const currentlyConsulting =
    sameDoctorAppointments.find(
      (item) => item.status === "in_consultation"
    )?.token_number ?? null;

  const patientsAhead = sameDoctorAppointments.filter(
    (item) =>
      item.token_number! < appointment.token_number! &&
      ["booked", "checked_in", "waiting", "in_consultation"].includes(
        item.status
      )
  ).length;

  return {
    currentlyConsulting,
    patientsAhead,
  };
}

    async function checkInAppointment(appointmentId: string) {
  const confirmed = window.confirm(
    "Are you ready to check in for this appointment?"
  );

  if (!confirmed) {
    return;
  }

  const { data: updatedAppointment, error } = await supabase
    .from("appointments")
    .update({ status: "waiting" })
    .eq("id", appointmentId)
    .eq("status", "booked")
    .select("id, status")
    .maybeSingle();

  if (error) {
    setError(error.message);
    return;
  }

  if (!updatedAppointment) {
    setError(
      "Check-in failed: this appointment may already be checked in or unavailable."
    );
    return;
  }

  setError("");
  alert("You have been checked in successfully.");

  await loadAppointments();
}

    async function cancelAppointment(appointmentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    const { data: updatedAppointment, error } = await supabase
  .from("appointments")
  .update({ status: "cancelled" })
  .eq("id", appointmentId)
  .select("id, status")
  .maybeSingle();

if (error) {
  setError(error.message);
  return;
}

if (!updatedAppointment) {
  setError(
    "Cancellation failed: the appointment could not be updated."
  );
  return;
}

    setError("");
    alert("Appointment cancelled successfully.");

    await loadAppointments();
  }

  function getStatusClass(status: string) {
    const normalized = status.toLowerCase().replaceAll("_", " ");

    if (normalized === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (normalized === "waiting") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (normalized === "in consultation") {
      return "bg-blue-100 text-blue-700";
    }

    if (normalized === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status: string) {
    return status.replaceAll("_", " ");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/patient"
          className="text-blue-600 font-semibold hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-blue-600 font-semibold">MEDIFLOW</p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            My Appointments
          </h1>

          <p className="mt-2 text-slate-600">
            View your upcoming and previous appointments.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!error && appointments.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              No Appointments
            </h2>

            <p className="mt-2 text-slate-600">
              You don't have any appointments yet.
            </p>

            <Link
              href="/book-opd"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Book an Appointment
            </Link>
          </div>
        )}

        {!error && appointments.length > 0 && (
          <div className="mt-8 space-y-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Appointment
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      {formatDate(appointment.appointment_date)}
                    </h2>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {formatStatus(appointment.status)}
                  </div>
                </div>

                {appointment.token_number !== null && (
  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
    <div className="rounded-xl bg-blue-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Your Token
      </p>
      <p className="mt-1 text-2xl font-bold text-blue-900">
        #{appointment.token_number}
      </p>
    </div>

    <div className="rounded-xl bg-amber-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
        Currently Consulting
      </p>
      <p className="mt-1 text-2xl font-bold text-amber-900">
        {queueInfo[appointment.id]?.currentlyConsulting !== null &&
        queueInfo[appointment.id]?.currentlyConsulting !== undefined
          ? `#${queueInfo[appointment.id].currentlyConsulting}`
          : "None"}
      </p>
    </div>

    <div className="rounded-xl bg-emerald-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
        Patients Ahead
      </p>
      <p className="mt-1 text-2xl font-bold text-emerald-900">
        {queueInfo[appointment.id]?.patientsAhead ?? 0}
      </p>
    </div>
  </div>
)}

                {appointment.status === "booked" && (
  <div className="mt-4 flex flex-wrap gap-3">
    <button
      type="button"
      onClick={() => checkInAppointment(appointment.id)}
      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
    >
      Check In
    </button>

    <button
      type="button"
      onClick={() => cancelAppointment(appointment.id)}
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
    >
      Cancel Appointment
    </button>
  </div>
)}

{appointment.status === "waiting" && (
  <button
    type="button"
    onClick={() => cancelAppointment(appointment.id)}
    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
  >
    Cancel Appointment
  </button>
)}

                <div className="mt-6 rounded-xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-blue-600">
                    Doctor
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {appointment.doctor?.name || "Doctor"}
                  </h3>

                  {appointment.doctor?.specialization && (
                    <p className="mt-1 text-slate-600">
                      {appointment.doctor.specialization}
                    </p>
                  )}

                  {appointment.doctor?.qualification && (
                    <p className="mt-1 text-slate-600">
                      {appointment.doctor.qualification}
                    </p>
                  )}

                  {appointment.doctor?.experience_years !== null &&
                    appointment.doctor?.experience_years !== undefined && (
                      <p className="mt-1 text-slate-600">
                        {appointment.doctor.experience_years} years of
                        experience
                      </p>
                    )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Appointment Date</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {formatDate(appointment.appointment_date)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Appointment Time</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {appointment.appointment_time}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Token Number</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {appointment.token_number
                        ? `#${appointment.token_number}`
                        : "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}