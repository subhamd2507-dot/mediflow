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

type QueueInfo = {
  currentlyConsulting: number | null;
  patientsAhead: number;
};

export default function AppointmentsPage() {
  const supabase = createClient();

  const [appointments, setAppointments] = useState<
    AppointmentWithDoctor[]
  >([]);

  const [queueInfo, setQueueInfo] = useState<
    Record<string, QueueInfo>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD APPOINTMENTS
  ========================================================= */

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

      /* -----------------------------------------------------
         1. GET LOGGED-IN USER
      ----------------------------------------------------- */

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

      /* -----------------------------------------------------
         2. GET PATIENT PROFILE
      ----------------------------------------------------- */

      const { data: patient, error: patientError } =
        await supabase
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

      /* -----------------------------------------------------
         3. GET PATIENT APPOINTMENTS
      ----------------------------------------------------- */

      const {
        data: appointmentData,
        error: appointmentError,
      } = await supabase
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
        setQueueInfo({});
        return;
      }

      /* -----------------------------------------------------
         4. GET UNIQUE DOCTOR IDS
      ----------------------------------------------------- */

      const doctorIds = [
        ...new Set(
          appointmentData.map(
            (appointment) => appointment.doctor_id
          )
        ),
      ];

      /* -----------------------------------------------------
         5. GET DOCTOR DETAILS
      ----------------------------------------------------- */

      const { data: doctorData, error: doctorError } =
        await supabase
          .from("doctors")
          .select(
            "id, name, specialization, qualification, experience_years"
          )
          .in("id", doctorIds);

      if (doctorError) {
        throw new Error(doctorError.message);
      }

      /* -----------------------------------------------------
         6. COMBINE APPOINTMENTS + DOCTORS
      ----------------------------------------------------- */

      const finalData: AppointmentWithDoctor[] =
        appointmentData.map((appointment) => ({
          ...appointment,
          doctor:
            doctorData?.find(
              (doctor) => doctor.id === appointment.doctor_id
            ) ?? null,
        }));

      setAppointments(finalData);

      /* -----------------------------------------------------
         7. GET QUEUE INFO
      ----------------------------------------------------- */

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

      const newQueueInfo: Record<string, QueueInfo> = {};

      queueResults.forEach((item) => {
        newQueueInfo[item.id] = {
          currentlyConsulting: item.currentlyConsulting,
          patientsAhead: item.patientsAhead,
        };
      });

      setQueueInfo(newQueueInfo);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CHECK IN
  ========================================================= */

  async function checkInAppointment(
    appointmentId: string
  ) {
    const confirmed = window.confirm(
      "Are you ready to check in for this appointment?"
    );

    if (!confirmed) {
      return;
    }

    const { data: updatedAppointment, error } =
      await supabase
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

  /* =========================================================
     CANCEL
  ========================================================= */

  async function cancelAppointment(
    appointmentId: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    const {
      data: updatedAppointment,
      error,
    } = await supabase
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

  /* =========================================================
     DATE / TIME HELPERS
  ========================================================= */

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(time: string) {
    const [hoursString, minutes] = time
      .slice(0, 5)
      .split(":");

    const hours = Number(hoursString);

    const period = hours >= 12 ? "PM" : "AM";
    const displayHour =
      hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHour}:${minutes} ${period}`;
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  /* =========================================================
     STATUS STYLING
  ========================================================= */

  function getStatusStyles(status: string) {
    const normalized = status
      .toLowerCase()
      .replaceAll("_", " ");

    if (normalized === "completed") {
      return {
        badge:
          "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]",
        dot: "bg-[var(--success)]",
      };
    }

    if (normalized === "waiting") {
      return {
        badge:
          "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--warning)]",
        dot: "bg-[var(--warning)]",
      };
    }

    if (normalized === "in consultation") {
      return {
        badge:
          "border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)]",
        dot: "bg-[var(--primary)]",
      };
    }

    if (normalized === "cancelled") {
      return {
        badge:
          "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--danger)]",
        dot: "bg-[var(--danger)]",
      };
    }

    return {
      badge:
        "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground-secondary)]",
      dot: "bg-[var(--foreground-muted)]",
    };
  }

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">

          <div className="animate-pulse">

            <div className="h-4 w-32 rounded bg-[var(--surface-soft)]" />

            <div className="mt-4 h-10 w-72 rounded bg-[var(--surface-soft)]" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-[var(--surface-soft)]" />

            <div className="mt-10 grid gap-5 md:grid-cols-3">

              <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />
              <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />
              <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />

            </div>

            <div className="mt-8 h-64 rounded-3xl bg-[var(--surface-soft)]" />

          </div>

        </div>

      </main>
    );
  }

  /* =========================================================
     OVERVIEW COUNTS
  ========================================================= */

  const activeAppointments = appointments.filter(
    (appointment) =>
      ["booked", "waiting", "in_consultation"].includes(
        appointment.status
      )
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  ).length;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">

        {/* =================================================
            TOP HEADER
        ================================================== */}

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <Link
                href="/patient"
                className="inline-flex items-center text-sm font-semibold text-[var(--primary)] hover:opacity-80"
              >
                ← Back to Dashboard
              </Link>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Patient appointments
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Your appointments
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
                Track your upcoming visits, token status and queue
                information from one place.
              </p>

            </div>

            <Link
              href="/book-opd"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--foreground)] px-5 py-3 text-sm font-bold text-[var(--background)] hover:-translate-y-0.5 hover:opacity-90"
            >
              Book another OPD →
            </Link>

          </div>

        </section>


        {/* =================================================
            OVERVIEW STATS
        ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Active
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {activeAppointments}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
                📅
              </div>

            </div>

            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Current appointment activity
            </p>

          </div>


          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {completedAppointments}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--success-soft)] text-lg">
                ✓
              </div>

            </div>

            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Completed consultations
            </p>

          </div>


          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Cancelled
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {cancelledAppointments}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--danger-soft)] text-lg">
                ×
              </div>

            </div>

            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Cancelled appointments
            </p>

          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-5 text-[var(--danger)]">

            <div className="flex gap-3">

              <span className="text-lg">
                ⚠️
              </span>

              <div>
                <p className="font-bold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm leading-6">
                  {error}
                </p>
              </div>

            </div>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {!error && appointments.length === 0 && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
              📅
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No appointments yet
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-[var(--foreground-secondary)]">
              Your booked OPD appointments will appear here. Start by
              choosing a hospital, department and doctor.
            </p>

            <Link
              href="/book-opd"
              className="mt-7 inline-flex items-center rounded-xl bg-[var(--foreground)] px-6 py-3.5 text-sm font-bold text-[var(--background)] hover:opacity-90"
            >
              Book an Appointment →
            </Link>

          </section>
        )}


        {/* =================================================
            APPOINTMENT LIST
        ================================================== */}

        {!error && appointments.length > 0 && (
          <section className="mt-8">

            <div className="mb-5 flex items-end justify-between gap-4">

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                  Your visits
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Appointment history
                </h2>
              </div>

              <p className="hidden text-sm text-[var(--foreground-muted)] sm:block">
                Queue information refreshes automatically
              </p>

            </div>


            <div className="space-y-6">

              {appointments.map((appointment) => {
                const queue = queueInfo[appointment.id];
                const statusStyles = getStatusStyles(
                  appointment.status
                );

                return (
                  <article
                    key={appointment.id}
                    className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                  >

                    {/* -----------------------------------------
                        APPOINTMENT TOP
                    ------------------------------------------ */}

                    <div className="border-b border-[var(--border)] p-6 sm:p-7">

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div>

                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                            Appointment
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3">

                            <h3 className="text-2xl font-bold">
                              {formatDate(
                                appointment.appointment_date
                              )}
                            </h3>

                            <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-sm font-semibold">
                              {formatTime(
                                appointment.appointment_time
                              )}
                            </span>

                          </div>

                        </div>


                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusStyles.badge}`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${statusStyles.dot}`}
                          />

                          {formatStatus(
                            appointment.status
                          )}
                        </span>

                      </div>


                      {/* ---------------------------------------
                          TOKEN / QUEUE
                      ---------------------------------------- */}

                      {appointment.token_number !== null && (
                        <div className="mt-6 grid gap-3 md:grid-cols-3">

                          <div className="rounded-2xl bg-[var(--primary-soft)] p-5">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                              Your token
                            </p>

                            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">
                              #{appointment.token_number}
                            </p>

                          </div>


                          <div className="rounded-2xl bg-[var(--warning-soft)] p-5">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--warning)]">
                              Currently consulting
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                              {queue?.currentlyConsulting !==
                                null &&
                              queue?.currentlyConsulting !==
                                undefined
                                ? `#${queue.currentlyConsulting}`
                                : "None"}
                            </p>

                          </div>


                          <div className="rounded-2xl bg-[var(--success-soft)] p-5">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--success)]">
                              Patients ahead
                            </p>

                            <p className="mt-2 text-3xl font-bold">
                              {queue?.patientsAhead ?? 0}
                            </p>

                          </div>

                        </div>
                      )}

                    </div>


                    {/* -----------------------------------------
                        DOCTOR
                    ------------------------------------------ */}

                    <div className="p-6 sm:p-7">

                      <div className="rounded-2xl bg-[var(--surface-soft)] p-5">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                            {appointment.doctor?.name
                              ? appointment.doctor.name
                                  .split(" ")
                                  .map(
                                    (part: string) =>
                                      part.charAt(0)
                                  )
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : "DR"}
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                              Doctor
                            </p>

                            <h4 className="mt-1 text-xl font-bold">
                              {appointment.doctor?.name ||
                                "Doctor"}
                            </h4>

                            {appointment.doctor
                              ?.specialization && (
                              <p className="mt-1 text-[var(--foreground-secondary)]">
                                {
                                  appointment.doctor
                                    .specialization
                                }
                              </p>
                            )}

                          </div>

                        </div>


                        <div className="mt-4 flex flex-wrap gap-2">

                          {appointment.doctor
                            ?.qualification && (
                            <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground-secondary)]">
                              {
                                appointment.doctor
                                  .qualification
                              }
                            </span>
                          )}

                          {appointment.doctor
                            ?.experience_years !== null &&
                            appointment.doctor
                              ?.experience_years !==
                              undefined && (
                              <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground-secondary)]">
                                {
                                  appointment.doctor
                                    .experience_years
                                }{" "}
                                years experience
                              </span>
                            )}

                        </div>

                      </div>


                      {/* ---------------------------------------
                          APPOINTMENT DETAILS
                      ---------------------------------------- */}

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">

                        <div className="rounded-2xl border border-[var(--border)] p-4">

                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                            Date
                          </p>

                          <p className="mt-2 font-bold">
                            {formatDate(
                              appointment.appointment_date
                            )}
                          </p>

                        </div>


                        <div className="rounded-2xl border border-[var(--border)] p-4">

                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                            Time
                          </p>

                          <p className="mt-2 font-bold">
                            {formatTime(
                              appointment.appointment_time
                            )}
                          </p>

                        </div>


                        <div className="rounded-2xl border border-[var(--border)] p-4">

                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                            Token
                          </p>

                          <p className="mt-2 font-bold">
                            {appointment.token_number !==
                            null
                              ? `#${appointment.token_number}`
                              : "Not assigned"}
                          </p>

                        </div>

                      </div>


                      {/* ---------------------------------------
                          ACTIONS
                      ---------------------------------------- */}

                      {appointment.status ===
                        "booked" && (
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                          <button
                            type="button"
                            onClick={() =>
                              checkInAppointment(
                                appointment.id
                              )
                            }
                            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--success)] px-5 py-3.5 text-sm font-bold text-white hover:opacity-90"
                          >
                            ✓ Check In
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              cancelAppointment(
                                appointment.id
                              )
                            }
                            className="inline-flex items-center justify-center rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-5 py-3.5 text-sm font-bold text-[var(--danger)] hover:opacity-80"
                          >
                            Cancel Appointment
                          </button>

                        </div>
                      )}


                      {appointment.status ===
                        "waiting" && (
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[var(--warning)]/20 bg-[var(--warning-soft)] p-4">

                          <div className="flex gap-3">

                            <span className="text-lg">
                              ⏳
                            </span>

                            <div>

                              <p className="font-bold">
                                You are in the queue
                              </p>

                              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                                Keep this page open to follow
                                your queue information.
                              </p>

                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              cancelAppointment(
                                appointment.id
                              )
                            }
                            className="rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-2.5 text-sm font-bold text-[var(--danger)]"
                          >
                            Cancel
                          </button>

                        </div>
                      )}


                      {appointment.status ===
                        "in_consultation" && (
                        <div className="mt-6 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-4">

                          <div className="flex gap-3">

                            <span className="text-lg">
                              🩺
                            </span>

                            <div>

                              <p className="font-bold text-[var(--primary)]">
                                Your consultation is in progress
                              </p>

                              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                                The doctor is currently consulting
                                your token.
                              </p>

                            </div>

                          </div>

                        </div>
                      )}


                      {appointment.status ===
                        "completed" && (
                        <div className="mt-6 rounded-2xl border border-[var(--success)]/20 bg-[var(--success-soft)] p-4">

                          <div className="flex gap-3">

                            <span className="text-lg">
                              ✓
                            </span>

                            <div>

                              <p className="font-bold text-[var(--success)]">
                                Consultation completed
                              </p>

                              <Link
                                href="/patient/history"
                                className="mt-1 inline-block text-sm font-semibold text-[var(--success)] hover:underline"
                              >
                                View medical history →
                              </Link>

                            </div>

                          </div>

                        </div>
                      )}


                      {appointment.status ===
                        "cancelled" && (
                        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">

                          <div className="flex gap-3">

                            <span className="text-lg">
                              ℹ️
                            </span>

                            <div>

                              <p className="font-bold">
                                Appointment cancelled
                              </p>

                              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                                This appointment is no longer active.
                              </p>

                            </div>

                          </div>

                        </div>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}


        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center">

          <p className="text-xs text-[var(--foreground-muted)]">
            MediFlow • Your appointments, organized.
          </p>

        </div>

      </div>

    </main>
  );
}