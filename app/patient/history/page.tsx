"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Consultation = {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
  tests_recommended: string | null;
  advice: string | null;
  follow_up_date: string | null;
  created_at: string;
};

type Prescription = {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  created_at: string;
};

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  token_number: number;
  status: string;
};

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  qualification: string | null;
  experience_years: number | null;
};

type ConsultationView = Consultation & {
  appointment?: Appointment;
  doctor?: Doctor;
};

export default function MedicalHistoryPage() {
  const supabase = createClient();

  const [consultations, setConsultations] = useState<
    ConsultationView[]
  >([]);

  const [prescriptions, setPrescriptions] = useState<
    Prescription[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD MEDICAL HISTORY
  ========================================================= */

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        /* -----------------------------------------------------
           1. GET LOGGED-IN PATIENT
        ----------------------------------------------------- */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setError("Please log in to view your medical history.");
          return;
        }

        /* -----------------------------------------------------
           2. FIND PATIENT PROFILE
        ----------------------------------------------------- */

        const { data: patient, error: patientError } =
          await supabase
            .from("patients")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (patientError) {
          throw patientError;
        }

        if (!patient) {
          setError("Patient profile not found.");
          return;
        }

        /* -----------------------------------------------------
           3. LOAD CONSULTATIONS
        ----------------------------------------------------- */

        const {
          data: consultationData,
          error: consultationError,
        } = await supabase
          .from("consultations")
          .select(
            "id, appointment_id, patient_id, doctor_id, symptoms, diagnosis, notes, tests_recommended, advice, follow_up_date, created_at"
          )
          .eq("patient_id", patient.id)
          .order("created_at", { ascending: false });

        if (consultationError) {
          throw consultationError;
        }

        /* -----------------------------------------------------
           4. LOAD PRESCRIPTIONS
        ----------------------------------------------------- */

        const {
          data: prescriptionData,
          error: prescriptionError,
        } = await supabase
          .from("prescriptions")
          .select(
            "id, consultation_id, patient_id, doctor_id, medicine_name, dosage, frequency, duration, instructions, created_at"
          )
          .eq("patient_id", patient.id)
          .order("created_at", { ascending: false });

        if (prescriptionError) {
          throw prescriptionError;
        }

        /* -----------------------------------------------------
           5. GET APPOINTMENT INFORMATION
        ----------------------------------------------------- */

        const appointmentIds =
          (consultationData || []).map(
            (consultation) => consultation.appointment_id
          );

        let appointmentMap: Record<string, Appointment> = {};

        if (appointmentIds.length > 0) {
          const {
            data: appointmentData,
            error: appointmentError,
          } = await supabase
            .from("appointments")
            .select(
              "id, appointment_date, appointment_time, token_number, status"
            )
            .in("id", appointmentIds);

          if (appointmentError) {
            throw appointmentError;
          }

          appointmentMap = Object.fromEntries(
            (appointmentData || []).map((appointment) => [
              appointment.id,
              appointment,
            ])
          );
        }

        /* -----------------------------------------------------
           6. GET DOCTOR INFORMATION
        ----------------------------------------------------- */

        const doctorIds = [
          ...new Set(
            (consultationData || []).map(
              (consultation) => consultation.doctor_id
            )
          ),
        ];

        let doctorMap: Record<string, Doctor> = {};

        if (doctorIds.length > 0) {
          const {
            data: doctorData,
            error: doctorError,
          } = await supabase
            .from("doctors")
            .select(
              "id, name, specialization, qualification, experience_years"
            )
            .in("id", doctorIds);

          if (doctorError) {
            throw doctorError;
          }

          doctorMap = Object.fromEntries(
            (doctorData || []).map((doctor) => [
              doctor.id,
              doctor,
            ])
          );
        }

        /* -----------------------------------------------------
           7. COMBINE EVERYTHING
        ----------------------------------------------------- */

        const enhancedConsultations: ConsultationView[] = (
          consultationData || []
        ).map((consultation) => ({
          ...consultation,
          appointment:
            appointmentMap[consultation.appointment_id],
          doctor: doctorMap[consultation.doctor_id],
        }));

        setConsultations(enhancedConsultations);
        setPrescriptions(prescriptionData || []);
      } catch (err) {
        console.error("Medical history error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load medical history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  /* =========================================================
     GET PRESCRIPTIONS FOR CONSULTATION
  ========================================================= */

  function getPrescriptionForConsultation(
    consultationId: string
  ) {
    return prescriptions.filter(
      (prescription) =>
        prescription.consultation_id === consultationId
    );
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* =========================================================
     FORMAT TIME
  ========================================================= */

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">

          <div className="animate-pulse">

            <div className="h-4 w-32 rounded bg-[var(--surface-soft)]" />

            <div className="mt-5 h-10 w-72 rounded bg-[var(--surface-soft)]" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-[var(--surface-soft)]" />

            <div className="mt-10 h-56 rounded-3xl bg-[var(--surface-soft)]" />

            <div className="mt-6 h-72 rounded-3xl bg-[var(--surface-soft)]" />

          </div>

        </div>

      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">

        {/* =================================================
            HEADER
        ================================================== */}

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          <Link
            href="/patient"
            className="inline-flex items-center text-sm font-semibold text-[var(--primary)] hover:opacity-80"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Your health record
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Medical History
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
                Review your previous consultations, medical information
                and prescriptions in one organized timeline.
              </p>

            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
              📋
            </div>

          </div>

        </section>


        {/* =================================================
            QUICK SUMMARY
        ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Consultations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {consultations.length}
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Recorded medical visits
            </p>

          </div>


          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Prescriptions
            </p>

            <p className="mt-2 text-3xl font-bold">
              {prescriptions.length}
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Medicines recorded
            </p>

          </div>


          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Latest Visit
            </p>

            <p className="mt-2 text-lg font-bold">
              {consultations.length > 0
                ? formatDateTime(
                    consultations[0].created_at
                  )
                : "None"}
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Most recent consultation
            </p>

          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <section className="mt-6 rounded-3xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-5">

            <div className="flex gap-3">

              <span className="text-lg">
                ⚠️
              </span>

              <div>

                <p className="font-bold text-[var(--danger)]">
                  Unable to load history
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--danger)]">
                  {error}
                </p>

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {!loading &&
          !error &&
          consultations.length === 0 && (
            <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                📋
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                No medical history yet
              </h2>

              <p className="mx-auto mt-3 max-w-md leading-7 text-[var(--foreground-secondary)]">
                Completed consultations and prescriptions will appear
                here automatically.
              </p>

              <Link
                href="/book-opd"
                className="mt-7 inline-flex items-center rounded-xl bg-[var(--foreground)] px-6 py-3.5 text-sm font-bold text-[var(--background)] hover:opacity-90"
              >
                Book an OPD →
              </Link>

            </section>
          )}


        {/* =================================================
            MEDICAL TIMELINE
        ================================================== */}

        {!error && consultations.length > 0 && (
          <section className="mt-10">

            <div className="mb-6">

              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                Care timeline
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Your previous visits
              </h2>

            </div>


            <div className="relative">

              {/* Timeline line */}
              <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-[var(--border)] sm:block" />


              <div className="space-y-8">

                {consultations.map((consultation) => {
                  const consultationPrescriptions =
                    getPrescriptionForConsultation(
                      consultation.id
                    );

                  return (
                    <article
                      key={consultation.id}
                      className="relative sm:pl-14"
                    >

                      {/* Timeline dot */}
                      <div className="absolute left-0 top-8 hidden h-10 w-10 items-center justify-center rounded-full border-4 border-[var(--background)] bg-[var(--primary)] text-sm font-bold text-white shadow-sm sm:flex">
                        ✓
                      </div>


                      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

                        {/* ---------------------------------------
                            VISIT HEADER
                        ---------------------------------------- */}

                        <div className="border-b border-[var(--border)] p-6 sm:p-7">

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                            <div>

                              <div className="flex flex-wrap items-center gap-3">

                                <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                                  Consultation
                                </span>

                                {consultation.appointment?.status && (
                                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold capitalize text-[var(--foreground-secondary)]">
                                    {consultation.appointment.status.replace(
                                      /_/g,
                                      " "
                                    )}
                                  </span>
                                )}

                              </div>

                              <h3 className="mt-4 text-2xl font-bold">
                                {formatDate(
                                  consultation.created_at
                                )}
                              </h3>

                              {consultation.appointment && (
                                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                                  {formatTime(
                                    consultation.appointment
                                      .appointment_time
                                  )}
                                  {consultation.appointment
                                    .token_number
                                    ? ` • Token #${consultation.appointment.token_number}`
                                    : ""}
                                </p>
                              )}

                            </div>


                            {consultation.follow_up_date && (
                              <div className="rounded-2xl bg-[var(--warning-soft)] p-4 lg:min-w-[180px]">

                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--warning)]">
                                  Follow-up
                                </p>

                                <p className="mt-2 font-bold">
                                  {formatDate(
                                    consultation.follow_up_date
                                  )}
                                </p>

                              </div>
                            )}

                          </div>


                          {/* -------------------------------------
                              DOCTOR
                          -------------------------------------- */}

                          {consultation.doctor && (
                            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-[var(--surface-soft)] p-5 sm:flex-row sm:items-center">

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                                {consultation.doctor.name
                                  .split(" ")
                                  .map(
                                    (part: string) =>
                                      part.charAt(0)
                                  )
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                  Doctor
                                </p>

                                <h4 className="mt-1 text-xl font-bold">
                                {consultation.doctor.name}
                                </h4>

                                <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                                  {consultation.doctor.specialization}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">

                                  {consultation.doctor
                                    .qualification && (
                                    <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                                      {
                                        consultation.doctor
                                          .qualification
                                      }
                                    </span>
                                  )}

                                  {consultation.doctor
                                    .experience_years !==
                                    null &&
                                    consultation.doctor
                                      .experience_years !==
                                      undefined && (
                                      <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                                        {
                                          consultation.doctor
                                            .experience_years
                                        }{" "}
                                        years experience
                                      </span>
                                    )}

                                </div>

                              </div>

                            </div>
                          )}

                        </div>


                        {/* -----------------------------------------
                            CONSULTATION DETAILS
                        ------------------------------------------ */}

                        <div className="p-6 sm:p-7">

                          <div className="grid gap-5 lg:grid-cols-2">

                            {/* Symptoms */}
                            {consultation.symptoms && (
                              <div className="rounded-2xl border border-[var(--border)] p-5">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                                    🩺
                                  </div>

                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                      Symptoms
                                    </p>

                                    <p className="mt-1 font-bold">
                                      What you reported
                                    </p>
                                  </div>

                                </div>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--foreground-secondary)]">
                                  {consultation.symptoms}
                                </p>

                              </div>
                            )}


                            {/* Diagnosis */}
                            {consultation.diagnosis && (
                              <div className="rounded-2xl border border-[var(--border)] p-5">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success-soft)]">
                                    ✓
                                  </div>

                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                      Diagnosis
                                    </p>

                                    <p className="mt-1 font-bold">
                                      Doctor's assessment
                                    </p>
                                  </div>

                                </div>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--foreground-secondary)]">
                                  {consultation.diagnosis}
                                </p>

                              </div>
                            )}


                            {/* Consultation Notes */}
                            {consultation.notes && (
                              <div className="rounded-2xl border border-[var(--border)] p-5">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                                    📝
                                  </div>

                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                      Consultation Notes
                                    </p>

                                    <p className="mt-1 font-bold">
                                      Visit notes
                                    </p>
                                  </div>

                                </div>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--foreground-secondary)]">
                                  {consultation.notes}
                                </p>

                              </div>
                            )}


                            {/* Tests */}
                            {consultation.tests_recommended && (
                              <div className="rounded-2xl border border-[var(--border)] p-5">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning-soft)]">
                                    🔬
                                  </div>

                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                      Tests
                                    </p>

                                    <p className="mt-1 font-bold">
                                      Recommended investigations
                                    </p>
                                  </div>

                                </div>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--foreground-secondary)]">
                                  {consultation.tests_recommended}
                                </p>

                              </div>
                            )}

                          </div>


                          {/* Advice */}
                          {consultation.advice && (
                            <div className="mt-5 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-5">

                              <div className="flex gap-3">

                                <span className="text-lg">
                                  💡
                                </span>

                                <div>

                                  <p className="font-bold">
                                    Doctor's advice
                                  </p>

                                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--foreground-secondary)]">
                                    {consultation.advice}
                                  </p>

                                </div>

                              </div>

                            </div>
                          )}


                          {/* -----------------------------------------
                              PRESCRIPTION
                          ------------------------------------------ */}

                          {consultationPrescriptions.length > 0 && (
                            <div className="mt-7 border-t border-[var(--border)] pt-7">

                              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                                <div>

                                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                                    Prescription
                                  </p>

                                  <h4 className="mt-2 text-xl font-bold">
                                    Medicines from this visit
                                  </h4>

                                </div>

                                <span className="text-sm text-[var(--foreground-muted)]">
                                  {consultationPrescriptions.length} medicine
                                  {consultationPrescriptions.length === 1
                                    ? ""
                                    : "s"}
                                </span>

                              </div>


                              <div className="mt-5 space-y-3">

                                {consultationPrescriptions.map(
                                  (prescription) => (
                                    <div
                                      key={prescription.id}
                                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
                                    >

                                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                        <div>

                                          <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success-soft)]">
                                              💊
                                            </div>

                                            <div>

                                              <p className="text-lg font-bold">
                                                {
                                                  prescription.medicine_name
                                                }
                                              </p>

                                              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                                                Prescribed medication
                                              </p>

                                            </div>

                                          </div>

                                        </div>


                                        <div className="flex flex-wrap gap-2">

                                          {prescription.dosage && (
                                            <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                                              {prescription.dosage}
                                            </span>
                                          )}

                                          {prescription.frequency && (
                                            <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                                              {prescription.frequency}
                                            </span>
                                          )}

                                          {prescription.duration && (
                                            <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                                              {prescription.duration}
                                            </span>
                                          )}

                                        </div>

                                      </div>


                                      {prescription.instructions && (
                                        <div className="mt-4 rounded-xl bg-[var(--surface)] p-4">

                                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                            Instructions
                                          </p>

                                          <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                                            {
                                              prescription.instructions
                                            }
                                          </p>

                                        </div>
                                      )}

                                    </div>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center">

          <p className="text-xs text-[var(--foreground-muted)]">
            MediFlow • Your medical information, organized.
          </p>

        </div>

      </div>

    </main>
  );
}