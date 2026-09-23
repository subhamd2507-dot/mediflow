"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  qualification: string | null;
  experience_years: number | null;
  hospital_id: string;
  department_id: string | null;
};

type QueueItem = {
  id: string;
  patient_id: string;
  token_number: number;
  status: string;
  appointment_date: string;
  appointment_time: string;
};

type PatientDetails = {
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
};

type PatientHistory = {
  id: string;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
  tests_recommended: string | null;
  advice: string | null;
  follow_up_date: string | null;
  created_at: string;
};

export default function DoctorDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  /* =========================================================
     MAIN DATA
  ========================================================= */

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [patientDetails, setPatientDetails] =
    useState<PatientDetails | null>(null);
  const [patientHistory, setPatientHistory] =
    useState<PatientHistory[]>([]);

  /* =========================================================
     UI STATE
  ========================================================= */

  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [savingConsultation, setSavingConsultation] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =========================================================
     CONSULTATION FORM
  ========================================================= */

  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [testsRecommended, setTestsRecommended] =
    useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const today = new Date().toISOString().split("T")[0];

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  async function loadDashboard() {
    try {
      setLoading(true);
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
        router.push("/login");
        return;
      }

      /* -----------------------------------------------------
         2. FIND DOCTOR PROFILE
      ----------------------------------------------------- */

      const { data: doctorData, error: doctorError } =
        await supabase
          .from("doctors")
          .select(
            "id, name, specialization, qualification, experience_years, hospital_id, department_id"
          )
          .eq("auth_user_id", user.id)
          .maybeSingle();

      if (doctorError) {
        throw new Error(doctorError.message);
      }

      if (!doctorData) {
        throw new Error(
          "This account is not connected to a doctor profile."
        );
      }

      setDoctor(doctorData);

      /* -----------------------------------------------------
         3. LOAD TODAY'S QUEUE
      ----------------------------------------------------- */

      const { data: queueData, error: queueError } =
        await supabase
          .from("appointments")
          .select(
            "id, patient_id, token_number, status, appointment_date, appointment_time"
          )
          .eq("doctor_id", doctorData.id)
          .eq("appointment_date", today)
          .order("token_number", {
            ascending: true,
          });

      if (queueError) {
        throw new Error(queueError.message);
      }

      const nextQueue = queueData || [];

      setQueue(nextQueue);

      /* -----------------------------------------------------
         4. FIND CURRENT PATIENT
      ----------------------------------------------------- */

      const currentAppointment = nextQueue.find(
        (item) => item.status === "in_consultation"
      );

      if (!currentAppointment) {
        setPatientDetails(null);
        setPatientHistory([]);
        return;
      }

      /* -----------------------------------------------------
         5. LOAD CURRENT PATIENT DETAILS
      ----------------------------------------------------- */

      const {
        data: patientData,
        error: patientError,
      } = await supabase
        .from("patients")
        .select("full_name, phone, date_of_birth, gender")
        .eq("id", currentAppointment.patient_id)
        .maybeSingle();

      if (patientError) {
        throw new Error(patientError.message);
      }

      setPatientDetails(patientData);

      /* -----------------------------------------------------
         6. LOAD CURRENT PATIENT HISTORY
      ----------------------------------------------------- */

      const {
        data: historyData,
        error: historyError,
      } = await supabase
        .from("consultations")
        .select(
          "id, symptoms, diagnosis, notes, tests_recommended, advice, follow_up_date, created_at"
        )
        .eq("patient_id", currentAppointment.patient_id)
        .order("created_at", {
          ascending: false,
        });

      if (historyError) {
        throw new Error(historyError.message);
      }

      setPatientHistory(historyData || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load doctor dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================================
     CURRENT PATIENT
  ========================================================= */

  const currentPatient = queue.find(
    (item) => item.status === "in_consultation"
  );

  const waitingPatients = queue.filter((item) =>
    ["booked", "checked_in", "waiting"].includes(
      item.status
    )
  );

  const completedPatients = queue.filter(
    (item) => item.status === "completed"
  );

  /* =========================================================
     CALL NEXT PATIENT
  ========================================================= */

  async function callNextPatient() {
    if (!doctor) {
      return;
    }

    setCalling(true);
    setError("");
    setMessage("");

    const { data, error: rpcError } =
      await supabase.rpc("call_next_patient", {
        p_doctor_id: doctor.id,
        p_appointment_date: today,
      });

    if (rpcError) {
      setError(rpcError.message);
      setCalling(false);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("There are no waiting patients.");
      setCalling(false);
      return;
    }

    setMessage(
      `Token #${data[0].token_number} has been called.`
    );

    await loadDashboard();

    setCalling(false);
  }

  /* =========================================================
     COMPLETE CONSULTATION
  ========================================================= */

  async function completeConsultation() {
    if (!currentPatient) {
      return;
    }

    const confirmed = window.confirm(
      "Complete this consultation and move to the next patient?"
    );

    if (!confirmed) {
      return;
    }

    setCompleting(true);
    setError("");
    setMessage("");

    const { data, error: completeError } =
      await supabase.rpc("complete_consultation", {
        p_appointment_id: currentPatient.id,
      });

    if (completeError) {
      setError(completeError.message);
      setCompleting(false);
      return;
    }

    if (!data || data.length === 0) {
      setError(
        "The consultation could not be completed."
      );
      setCompleting(false);
      return;
    }

    setMessage(
      `Consultation for Token #${data[0].token_number} completed successfully.`
    );

    /* Clear the old form */
    clearConsultationForm();

    await loadDashboard();

    setCompleting(false);
  }

  /* =========================================================
     CLEAR FORM
  ========================================================= */

  function clearConsultationForm() {
    setSymptoms("");
    setDiagnosis("");
    setNotes("");
    setTestsRecommended("");
    setAdvice("");
    setFollowUpDate("");

    setMedicineName("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setInstructions("");
  }

  /* =========================================================
     SAVE CONSULTATION
  ========================================================= */

  async function saveConsultation() {
    if (!currentPatient || !doctor) {
      setError(
        "No patient is currently in consultation."
      );
      return;
    }

    if (!symptoms.trim() && !diagnosis.trim()) {
      setError(
        "Please enter at least symptoms or diagnosis."
      );
      return;
    }

    if (!medicineName.trim()) {
      setError("Please enter a medicine name.");
      return;
    }

    setSavingConsultation(true);
    setError("");
    setMessage("");

    try {
      /* -----------------------------------------------------
         1. GET APPOINTMENT
      ----------------------------------------------------- */

      const {
        data: appointment,
        error: appointmentError,
      } = await supabase
        .from("appointments")
        .select("id, patient_id, doctor_id")
        .eq("id", currentPatient.id)
        .single();

      if (appointmentError) {
        throw new Error(appointmentError.message);
      }

      if (!appointment) {
        throw new Error("Appointment not found.");
      }

      /* -----------------------------------------------------
         2. FIND OR CREATE CONSULTATION
      ----------------------------------------------------- */

      const {
        data: existingConsultation,
        error: existingConsultationError,
      } = await supabase
        .from("consultations")
        .select("id")
        .eq("appointment_id", appointment.id)
        .maybeSingle();

      if (existingConsultationError) {
        throw new Error(
          existingConsultationError.message
        );
      }

      let consultationId: string;

      if (existingConsultation) {
        consultationId = existingConsultation.id;

        const {
          error: updateConsultationError,
        } = await supabase
          .from("consultations")
          .update({
            symptoms: symptoms.trim() || null,
            diagnosis: diagnosis.trim() || null,
            notes: notes.trim() || null,
            tests_recommended:
              testsRecommended.trim() || null,
            advice: advice.trim() || null,
            follow_up_date:
              followUpDate || null,
          })
          .eq("id", consultationId);

        if (updateConsultationError) {
          throw new Error(
            updateConsultationError.message
          );
        }
      } else {
        const {
          data: newConsultation,
          error: consultationError,
        } = await supabase
          .from("consultations")
          .insert({
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            symptoms: symptoms.trim() || null,
            diagnosis: diagnosis.trim() || null,
            notes: notes.trim() || null,
            tests_recommended:
              testsRecommended.trim() || null,
            advice: advice.trim() || null,
            follow_up_date:
              followUpDate || null,
          })
          .select("id")
          .single();

        if (consultationError) {
          throw new Error(
            consultationError.message
          );
        }

        if (!newConsultation) {
          throw new Error(
            "Consultation could not be created."
          );
        }

        consultationId = newConsultation.id;
      }

      /* -----------------------------------------------------
         3. FIND OR CREATE PRESCRIPTION
      ----------------------------------------------------- */

      const {
        data: existingPrescription,
        error: existingPrescriptionError,
      } = await supabase
        .from("prescriptions")
        .select("id")
        .eq("consultation_id", consultationId)
        .maybeSingle();

      if (existingPrescriptionError) {
        throw new Error(
          existingPrescriptionError.message
        );
      }

      if (existingPrescription) {
        const {
          error: updatePrescriptionError,
        } = await supabase
          .from("prescriptions")
          .update({
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            medicine_name: medicineName.trim(),
            dosage: dosage.trim() || null,
            frequency: frequency.trim() || null,
            duration: duration.trim() || null,
            instructions:
              instructions.trim() || null,
          })
          .eq("id", existingPrescription.id);

        if (updatePrescriptionError) {
          throw new Error(
            updatePrescriptionError.message
          );
        }
      } else {
        const {
          error: prescriptionError,
        } = await supabase
          .from("prescriptions")
          .insert({
            consultation_id: consultationId,
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            medicine_name: medicineName.trim(),
            dosage: dosage.trim() || null,
            frequency: frequency.trim() || null,
            duration: duration.trim() || null,
            instructions:
              instructions.trim() || null,
          });

        if (prescriptionError) {
          throw new Error(
            prescriptionError.message
          );
        }
      }

      setMessage(
        `Consultation for Token #${currentPatient.token_number} saved successfully.`
      );

      clearConsultationForm();

      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save consultation."
      );
    } finally {
      setSavingConsultation(false);
    }
  }

  /* =========================================================
     FORM INPUT STYLES
  ========================================================= */

  const inputClass =
    "mt-2 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]";

  const textareaClass =
    "mt-2 w-full resize-none rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]";

  /* =========================================================
     STATUS HELPERS
  ========================================================= */

  function getStatusClass(status: string) {
    if (status === "completed") {
      return "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]";
    }

    if (
      status === "waiting" ||
      status === "checked_in"
    ) {
      return "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--warning)]";
    }

    if (status === "in_consultation") {
      return "border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)]";
    }

    if (status === "cancelled") {
      return "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--danger)]";
    }

    return "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground-secondary)]";
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
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

  function initials(name: string) {
    return name
      .split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">

          <div className="animate-pulse">

            <div className="h-4 w-32 rounded bg-[var(--surface-soft)]" />

            <div className="mt-4 h-10 w-72 rounded bg-[var(--surface-soft)]" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-[var(--surface-soft)]" />

            <div className="mt-8 grid gap-5 md:grid-cols-3">

              <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />
              <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />
              <div className="h-28 rounded-3xl bg-[var(--surface-soft)]" />

            </div>

            <div className="mt-8 h-96 rounded-3xl bg-[var(--surface-soft)]" />

          </div>

        </div>

      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !doctor) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">

          <section className="rounded-3xl border border-[var(--danger)]/20 bg-[var(--surface)] p-8 shadow-sm">

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--danger)]">
              Doctor workspace
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Unable to open dashboard
            </h1>

            <p className="mt-4 leading-7 text-[var(--foreground-secondary)]">
              {error}
            </p>

          </section>

        </div>

      </main>
    );
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Doctor Workspace
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Good day,{" "}
                {doctor?.name
                  ? doctor.name
                      .replace(/^Dr\.\s*/i, "")
                      .split(" ")[0]
                  : "Doctor"}{" "}
                👋
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
                Manage today's OPD queue, review patient information
                and record consultations from one workspace.
              </p>

            </div>


            {doctor && (
              <div className="flex items-center gap-4 rounded-2xl bg-[var(--surface-soft)] p-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                  {initials(doctor.name)}
                </div>

                <div>

                  <p className="font-bold">
                    {doctor.name}
                  </p>

                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {doctor.specialization}
                  </p>

                </div>

              </div>
            )}

          </div>

        </section>


        {/* ===================================================
            MESSAGES
        =================================================== */}

        {message && (
          <div className="mt-6 rounded-2xl border border-[var(--success)]/20 bg-[var(--success-soft)] p-4 text-sm text-[var(--success)]">

            <div className="flex items-center gap-3">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--success)] text-white">
                ✓
              </span>

              <p className="font-semibold">
                {message}
              </p>

            </div>

          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]">

            <div className="flex items-center gap-3">

              <span>
                ⚠️
              </span>

              <p className="font-semibold">
                {error}
              </p>

            </div>

          </div>
        )}


        {/* ===================================================
            STATS
        =================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Today's appointments
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {queue.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
                📅
              </div>

            </div>

          </div>


          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Waiting
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {waitingPatients.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--warning-soft)] text-lg">
                ⏳
              </div>

            </div>

          </div>


          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {completedPatients.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--success-soft)] text-lg">
                ✓
              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            MAIN WORKSPACE
        =================================================== */}

        <div className="mt-8 grid gap-8 xl:grid-cols-[360px_1fr]">


          {/* =================================================
              LEFT — QUEUE
          ================================================= */}

          <aside className="space-y-6">

            {/* Doctor profile */}
            {doctor && (
              <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">

                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                  Doctor profile
                </p>

                <div className="mt-5 flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                    {initials(doctor.name)}
                  </div>

                  <div>

                    <h2 className="font-bold">
                      {doctor.name}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                      {doctor.specialization}
                    </p>

                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  {doctor.qualification && (
                    <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                        Qualification
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {doctor.qualification}
                      </p>

                    </div>
                  )}

                  {doctor.experience_years !== null && (
                    <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                        Experience
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {doctor.experience_years} years
                      </p>

                    </div>
                  )}

                </div>

              </section>
            )}


            {/* Queue control */}
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                    Today's queue
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    Patient queue
                  </h2>

                </div>

                <div className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold">
                  {queue.length}
                </div>

              </div>


              {!currentPatient && (
                <button
                  type="button"
                  onClick={callNextPatient}
                  disabled={
                    calling ||
                    waitingPatients.length === 0
                  }
                  className="mt-6 w-full rounded-2xl bg-[var(--foreground)] px-5 py-3.5 text-sm font-bold text-[var(--background)] hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {calling
                    ? "Calling patient..."
                    : waitingPatients.length === 0
                    ? "No waiting patients"
                    : "📢 Call Next Patient"}
                </button>
              )}


              {currentPatient && (
                <div className="mt-6 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                    Currently consulting
                  </p>

                  <p className="mt-2 text-4xl font-bold text-[var(--primary)]">
                    #{currentPatient.token_number}
                  </p>

                  <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                    Consultation in progress
                  </p>

                </div>
              )}


              {/* Queue list */}
              <div className="mt-6">

                <div className="space-y-3">

                  {queue.length === 0 ? (
                    <div className="rounded-2xl bg-[var(--surface-soft)] p-5 text-center">

                      <p className="text-sm text-[var(--foreground-muted)]">
                        No appointments scheduled for today.
                      </p>

                    </div>
                  ) : (
                    queue.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 ${
                          item.status ===
                          "in_consultation"
                            ? "border-[var(--primary)]/30 bg-[var(--primary-soft)]"
                            : "border-[var(--border)] bg-[var(--surface-soft)]"
                        }`}
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div>

                            <p className="font-bold">
                              Token #{item.token_number}
                            </p>

                            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                              {formatTime(
                                item.appointment_time
                              )}
                            </p>

                          </div>

                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(
                              item.status
                            )}
                          </span>

                        </div>

                      </div>
                    ))
                  )}

                </div>

              </div>

            </section>

          </aside>


          {/* =================================================
              RIGHT — CURRENT PATIENT
          ================================================= */}

          <section className="space-y-6">

            {!currentPatient ? (

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm sm:p-10">

                <div className="mx-auto max-w-xl text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-2xl">
                    🩺
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Ready for consultation
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    No patient is currently in consultation
                  </h2>

                  <p className="mt-3 leading-7 text-[var(--foreground-secondary)]">
                    Call the next patient from today's queue to
                    begin reviewing their information and recording
                    the consultation.
                  </p>

                  <button
                    type="button"
                    onClick={callNextPatient}
                    disabled={
                      calling ||
                      waitingPatients.length === 0
                    }
                    className="mt-7 rounded-xl bg-[var(--foreground)] px-6 py-3.5 text-sm font-bold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {calling
                      ? "Calling patient..."
                      : waitingPatients.length === 0
                      ? "No Waiting Patients"
                      : "Call Next Patient →"}
                  </button>

                </div>

              </div>

            ) : (

              <>

                {/* Current patient header */}
                <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
                        {patientDetails
                          ? initials(
                              patientDetails.full_name
                            )
                          : "PT"}
                      </div>

                      <div>

                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                          Current patient
                        </p>

                        <h2 className="mt-2 text-2xl font-bold">
                          {patientDetails?.full_name ||
                            "Patient"}
                        </h2>

                        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                          Token #{currentPatient.token_number}
                          {" • "}
                          {formatTime(
                            currentPatient.appointment_time
                          )}
                        </p>

                      </div>

                    </div>


                    <div className="rounded-2xl bg-[var(--primary-soft)] px-5 py-4">

                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                        Consultation status
                      </p>

                      <p className="mt-1 font-bold text-[var(--primary)]">
                        In progress
                      </p>

                    </div>

                  </div>

                </section>


                {/* Patient details */}
                {patientDetails && (
                  <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                        Patient information
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        Patient details
                      </h3>

                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                          Name
                        </p>

                        <p className="mt-2 font-semibold">
                          {patientDetails.full_name}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                          Phone
                        </p>

                        <p className="mt-2 font-semibold">
                          {patientDetails.phone ||
                            "Not provided"}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                          Gender
                        </p>

                        <p className="mt-2 font-semibold capitalize">
                          {patientDetails.gender ||
                            "Not provided"}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                          Date of Birth
                        </p>

                        <p className="mt-2 font-semibold">
                          {patientDetails.date_of_birth ||
                            "Not provided"}
                        </p>

                      </div>

                    </div>

                  </section>
                )}


                {/* Previous history */}
                <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

                  <div className="flex items-end justify-between gap-4">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                        Previous care
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        Medical history
                      </h3>

                    </div>

                    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-bold text-[var(--foreground-muted)]">
                      {patientHistory.length} visit
                      {patientHistory.length === 1
                        ? ""
                        : "s"}
                    </span>

                  </div>


                  {patientHistory.length === 0 ? (

                    <div className="mt-6 rounded-2xl bg-[var(--surface-soft)] p-6 text-center">

                      <p className="text-sm text-[var(--foreground-muted)]">
                        No previous consultation history found.
                      </p>

                    </div>

                  ) : (

                    <div className="mt-6 space-y-4">

                      {patientHistory.map((history) => (

                        <div
                          key={history.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
                        >

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm font-bold">
                              Previous consultation
                            </p>

                            <p className="text-xs text-[var(--foreground-muted)]">
                              {new Date(
                                history.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )}
                            </p>

                          </div>


                          <div className="mt-5 grid gap-4 md:grid-cols-2">

                            {history.symptoms && (
                              <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                  Symptoms
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                                  {history.symptoms}
                                </p>

                              </div>
                            )}

                            {history.diagnosis && (
                              <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                  Diagnosis
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                                  {history.diagnosis}
                                </p>

                              </div>
                            )}

                            {history.notes && (
                              <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                  Notes
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                                  {history.notes}
                                </p>

                              </div>
                            )}

                            {history.tests_recommended && (
                              <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                  Tests
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                                  {history.tests_recommended}
                                </p>

                              </div>
                            )}

                          </div>


                          {history.advice && (
                            <div className="mt-4 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-4">

                              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                                Advice
                              </p>

                              <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                                {history.advice}
                              </p>

                            </div>
                          )}

                        </div>

                      ))}

                    </div>

                  )}

                </section>


                {/* =================================================
                    CONSULTATION FORM
                ================================================== */}

                <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                      Consultation
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      Record today's visit
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-secondary)]">
                      Add the consultation findings, recommended tests,
                      advice and prescription for this patient.
                    </p>

                  </div>


                  <div className="mt-8 space-y-7">

                    {/* Symptoms */}
                    <div>

                      <label className="block text-sm font-bold">
                        Symptoms
                      </label>

                      <textarea
                        value={symptoms}
                        onChange={(event) =>
                          setSymptoms(event.target.value)
                        }
                        className={textareaClass}
                        rows={4}
                        placeholder="Describe the patient's symptoms..."
                      />

                    </div>


                    {/* Diagnosis */}
                    <div>

                      <label className="block text-sm font-bold">
                        Diagnosis
                      </label>

                      <textarea
                        value={diagnosis}
                        onChange={(event) =>
                          setDiagnosis(event.target.value)
                        }
                        className={textareaClass}
                        rows={4}
                        placeholder="Enter the diagnosis or clinical assessment..."
                      />

                    </div>


                    {/* Notes */}
                    <div>

                      <label className="block text-sm font-bold">
                        Consultation Notes
                      </label>

                      <textarea
                        value={notes}
                        onChange={(event) =>
                          setNotes(event.target.value)
                        }
                        className={textareaClass}
                        rows={4}
                        placeholder="Add important consultation notes..."
                      />

                    </div>


                    {/* Tests */}
                    <div>

                      <label className="block text-sm font-bold">
                        Tests Recommended
                      </label>

                      <textarea
                        value={testsRecommended}
                        onChange={(event) =>
                          setTestsRecommended(
                            event.target.value
                          )
                        }
                        className={textareaClass}
                        rows={3}
                        placeholder="Example: CBC, X-ray, MRI..."
                      />

                    </div>


                    {/* Advice */}
                    <div>

                      <label className="block text-sm font-bold">
                        Advice
                      </label>

                      <textarea
                        value={advice}
                        onChange={(event) =>
                          setAdvice(event.target.value)
                        }
                        className={textareaClass}
                        rows={3}
                        placeholder="Enter advice for the patient..."
                      />

                    </div>


                    {/* Follow-up */}
                    <div>

                      <label className="block text-sm font-bold">
                        Follow-up Date
                      </label>

                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(event) =>
                          setFollowUpDate(event.target.value)
                        }
                        className={inputClass}
                      />

                    </div>


                    {/* Prescription */}
                    <div className="border-t border-[var(--border)] pt-7">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                            Prescription
                          </p>

                          <h4 className="mt-2 text-xl font-bold">
                            Medicine details
                          </h4>

                        </div>

                        <span className="text-xs text-[var(--foreground-muted)]">
                          Medicine name is required
                        </span>

                      </div>


                      <div className="mt-6 grid gap-5 md:grid-cols-2">

                        {/* Medicine */}
                        <div className="md:col-span-2">

                          <label className="block text-sm font-bold">
                            Medicine Name
                          </label>

                          <input
                            type="text"
                            value={medicineName}
                            onChange={(event) =>
                              setMedicineName(
                                event.target.value
                              )
                            }
                            className={inputClass}
                            placeholder="Example: Paracetamol 500mg"
                          />

                        </div>


                        {/* Dosage */}
                        <div>

                          <label className="block text-sm font-bold">
                            Dosage
                          </label>

                          <input
                            type="text"
                            value={dosage}
                            onChange={(event) =>
                              setDosage(event.target.value)
                            }
                            className={inputClass}
                            placeholder="Example: 1 tablet"
                          />

                        </div>


                        {/* Frequency */}
                        <div>

                          <label className="block text-sm font-bold">
                            Frequency
                          </label>

                          <input
                            type="text"
                            value={frequency}
                            onChange={(event) =>
                              setFrequency(
                                event.target.value
                              )
                            }
                            className={inputClass}
                            placeholder="Example: Twice daily"
                          />

                        </div>


                        {/* Duration */}
                        <div>

                          <label className="block text-sm font-bold">
                            Duration
                          </label>

                          <input
                            type="text"
                            value={duration}
                            onChange={(event) =>
                              setDuration(
                                event.target.value
                              )
                            }
                            className={inputClass}
                            placeholder="Example: 5 days"
                          />

                        </div>


                        {/* Instructions */}
                        <div>

                          <label className="block text-sm font-bold">
                            Instructions
                          </label>

                          <input
                            type="text"
                            value={instructions}
                            onChange={(event) =>
                              setInstructions(
                                event.target.value
                              )
                            }
                            className={inputClass}
                            placeholder="Example: Take after food"
                          />

                        </div>

                      </div>

                    </div>


                    {/* Save */}
                    <button
                      type="button"
                      onClick={saveConsultation}
                      disabled={savingConsultation}
                      className="w-full rounded-2xl bg-[var(--foreground)] px-6 py-4 text-sm font-bold text-[var(--background)] hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingConsultation
                        ? "Saving consultation..."
                        : "💾 Save Consultation"}
                    </button>


                    {/* Complete */}
                    <button
                      type="button"
                      onClick={completeConsultation}
                      disabled={completing}
                      className="w-full rounded-2xl bg-[var(--success)] px-6 py-4 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {completing
                        ? "Completing consultation..."
                        : "✅ Complete Consultation"}
                    </button>

                  </div>

                </section>

              </>

            )}

          </section>

        </div>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center">

          <p className="text-xs text-[var(--foreground-muted)]">
            MediFlow • Doctor Workspace
          </p>

        </div>

      </div>

    </main>
  );
}