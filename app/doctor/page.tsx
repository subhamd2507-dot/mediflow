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

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const [patientDetails, setPatientDetails] =
    useState<PatientDetails | null>(null);

  const [patientHistory, setPatientHistory] =
    useState<PatientHistory[]>([]);

  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [savingConsultation, setSavingConsultation] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =========================================================
     CONSULTATION FORM
  ========================================================= */

  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [testsRecommended, setTestsRecommended] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  /* =========================================================
     PRESCRIPTION FORM
  ========================================================= */

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
         2. FIND CONNECTED DOCTOR
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

      setQueue(queueData || []);

      /* -----------------------------------------------------
         4. FIND CURRENT PATIENT
      ----------------------------------------------------- */

      const currentAppointment = (queueData || []).find(
        (item) => item.status === "in_consultation"
      );

      if (currentAppointment) {
        /* -----------------------------------------------
           Patient details
        ------------------------------------------------ */

        const {
          data: patientData,
          error: patientError,
        } = await supabase
          .from("patients")
          .select(
            "full_name, phone, date_of_birth, gender"
          )
          .eq("id", currentAppointment.patient_id)
          .maybeSingle();

        if (patientError) {
          throw new Error(patientError.message);
        }

        setPatientDetails(patientData);

        /* -----------------------------------------------
           Patient history
        ------------------------------------------------ */

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
      } else {
        setPatientDetails(null);
        setPatientHistory([]);
      }
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load doctor dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }

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
      "Are you sure you want to complete this consultation?"
    );

    if (!confirmed) {
      return;
    }

    setCompleting(true);
    setError("");
    setMessage("");

    const {
      data,
      error: completeError,
    } = await supabase.rpc("complete_consultation", {
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

    await loadDashboard();

    setCompleting(false);
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
        throw new Error(
          appointmentError.message
        );
      }

      if (!appointment) {
        throw new Error("Appointment not found.");
      }

      /* -----------------------------------------------------
         2. FIND EXISTING CONSULTATION
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

      /* -----------------------------------------------------
         UPDATE EXISTING CONSULTATION
      ----------------------------------------------------- */

      if (existingConsultation) {
        consultationId =
          existingConsultation.id;

        const {
          error: updateConsultationError,
        } = await supabase
          .from("consultations")
          .update({
            symptoms:
              symptoms.trim() || null,
            diagnosis:
              diagnosis.trim() || null,
            notes:
              notes.trim() || null,
            tests_recommended:
              testsRecommended.trim() ||
              null,
            advice:
              advice.trim() || null,
            follow_up_date:
              followUpDate || null,
          })
          .eq(
            "id",
            consultationId
          );

        if (updateConsultationError) {
          throw new Error(
            updateConsultationError.message
          );
        }
      } else {
        /* ---------------------------------------------------
           CREATE NEW CONSULTATION
        --------------------------------------------------- */

        const {
          data: newConsultation,
          error: consultationError,
        } = await supabase
          .from("consultations")
          .insert({
            appointment_id:
              appointment.id,
            patient_id:
              appointment.patient_id,
            doctor_id:
              appointment.doctor_id,
            symptoms:
              symptoms.trim() || null,
            diagnosis:
              diagnosis.trim() || null,
            notes:
              notes.trim() || null,
            tests_recommended:
              testsRecommended.trim() ||
              null,
            advice:
              advice.trim() || null,
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

        consultationId =
          newConsultation.id;
      }

      /* -----------------------------------------------------
         3. FIND EXISTING PRESCRIPTION
      ----------------------------------------------------- */

      const {
        data: existingPrescription,
        error: existingPrescriptionError,
      } = await supabase
        .from("prescriptions")
        .select("id")
        .eq(
          "consultation_id",
          consultationId
        )
        .maybeSingle();

      if (existingPrescriptionError) {
        throw new Error(
          existingPrescriptionError.message
        );
      }

      /* -----------------------------------------------------
         UPDATE EXISTING PRESCRIPTION
      ----------------------------------------------------- */

      if (existingPrescription) {
        const {
          error: updatePrescriptionError,
        } = await supabase
          .from("prescriptions")
          .update({
            patient_id:
              appointment.patient_id,
            doctor_id:
              appointment.doctor_id,
            medicine_name:
              medicineName.trim(),
            dosage:
              dosage.trim() || null,
            frequency:
              frequency.trim() || null,
            duration:
              duration.trim() || null,
            instructions:
              instructions.trim() ||
              null,
          })
          .eq(
            "id",
            existingPrescription.id
          );

        if (updatePrescriptionError) {
          throw new Error(
            updatePrescriptionError.message
          );
        }
      } else {
        /* ---------------------------------------------------
           CREATE NEW PRESCRIPTION
        --------------------------------------------------- */

        const {
          error: prescriptionError,
        } = await supabase
          .from("prescriptions")
          .insert({
            consultation_id:
              consultationId,
            patient_id:
              appointment.patient_id,
            doctor_id:
              appointment.doctor_id,
            medicine_name:
              medicineName.trim(),
            dosage:
              dosage.trim() || null,
            frequency:
              frequency.trim() || null,
            duration:
              duration.trim() || null,
            instructions:
              instructions.trim() ||
              null,
          });

        if (prescriptionError) {
          throw new Error(
            prescriptionError.message
          );
        }
      }

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      setMessage(
        `Consultation for Token #${currentPatient.token_number} saved successfully.`
      );

      /* Clear form */
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
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save consultation.";

      setError(errorMessage);
    } finally {
      setSavingConsultation(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">

          <div className="animate-pulse">

            <div className="h-4 w-32 rounded bg-[var(--surface-soft)]" />

            <div className="mt-4 h-10 w-80 rounded bg-[var(--surface-soft)]" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-[var(--surface-soft)]" />

            <div className="mt-8 grid gap-5 md:grid-cols-4">

              <div className="h-32 rounded-3xl bg-[var(--surface-soft)]" />
              <div className="h-32 rounded-3xl bg-[var(--surface-soft)]" />
              <div className="h-32 rounded-3xl bg-[var(--surface-soft)]" />
              <div className="h-32 rounded-3xl bg-[var(--surface-soft)]" />

            </div>

            <div className="mt-8 h-80 rounded-3xl bg-[var(--surface-soft)]" />

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

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            MediFlow
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Doctor Dashboard
          </h1>

          <div className="mt-8 rounded-3xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-6">

            <div className="flex gap-3">

              <span className="text-xl">
                ⚠️
              </span>

              <div>

                <h2 className="font-bold text-[var(--danger)]">
                  Dashboard Error
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--danger)]">
                  {error}
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>
    );
  }

  /* =========================================================
     CURRENT PATIENT
  ========================================================= */

  const currentPatient = queue.find(
    (item) =>
      item.status === "in_consultation"
  );

  const waitingPatients = queue.filter(
    (item) =>
      item.status === "booked" ||
      item.status === "checked_in" ||
      item.status === "waiting"
  );

  const completedPatients = queue.filter(
    (item) =>
      item.status === "completed"
  );

  const cancelledPatients = queue.filter(
    (item) =>
      item.status === "cancelled"
  );

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

  function formatTime(time: string) {
    const [hoursString, minutes] =
      time.slice(0, 5).split(":");

    const hours = Number(hoursString);

    const period =
      hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 === 0
        ? 12
        : hours % 12;

    return `${displayHour}:${minutes} ${period}`;
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  const doctorInitials =
    doctor?.name
      ? doctor.name
          .split(" ")
          .map(
            (part: string) =>
              part.charAt(0)
          )
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "DR";

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">

        {/* =================================================
            HEADER
        ================================================== */}

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Doctor workspace
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Good day, {doctor?.name || "Doctor"}
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
                Manage today's OPD queue, review patient information and
                record consultations from one workspace.
              </p>

            </div>


            {/* Doctor identity */}
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                {doctorInitials}
              </div>

              <div>

                <p className="font-bold">
                  {doctor?.name}
                </p>

                <p className="text-sm text-[var(--foreground-muted)]">
                  {doctor?.specialization}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ALERTS
        ================================================== */}

        {message && (
          <div className="mt-6 rounded-2xl border border-[var(--success)]/20 bg-[var(--success-soft)] p-4">

            <div className="flex items-start gap-3">

              <span className="text-lg">
                ✓
              </span>

              <p className="text-sm font-semibold text-[var(--success)]">
                {message}
              </p>

            </div>

          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-4">

            <div className="flex items-start gap-3">

              <span className="text-lg">
                ⚠️
              </span>

              <p className="text-sm font-semibold text-[var(--danger)]">
                {error}
              </p>

            </div>

          </div>
        )}


        {/* =================================================
            STATS
        ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Total today
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {queue.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
                📅
              </div>

            </div>

            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Scheduled OPD appointments
            </p>

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

            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Patients ready to be called
            </p>

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

            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Consultations completed
            </p>

          </div>


          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Cancelled
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {cancelledPatients.length}
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
            CURRENT CONSULTATION
        ================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">

          {/* -------------------------------------------------
              LEFT: QUEUE
          -------------------------------------------------- */}

          <div className="space-y-6">

            {/* Current patient */}
            <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

              <div className="border-b border-[var(--border)] p-6 sm:p-7">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                      Current consultation
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {currentPatient
                        ? `Token #${currentPatient.token_number}`
                        : "No patient selected"}
                    </h2>

                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      currentPatient
                        ? "bg-[var(--primary-soft)]"
                        : "bg-[var(--surface-soft)]"
                    }`}
                  >
                    🩺
                  </div>

                </div>

              </div>


              <div className="p-6 sm:p-7">

                {!currentPatient ? (

                  <div>

                    <div className="rounded-2xl bg-[var(--surface-soft)] p-5">

                      <p className="font-bold">
                        Ready for the next patient?
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                        Call the next patient from today's waiting queue
                        to begin the consultation.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={callNextPatient}
                      disabled={
                        calling ||
                        waitingPatients.length === 0
                      }
                      className="mt-5 w-full rounded-2xl bg-[var(--foreground)] px-5 py-4 font-bold text-[var(--background)] hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {calling
                        ? "Calling Patient..."
                        : waitingPatients.length === 0
                        ? "No Waiting Patients"
                        : "📢 Call Next Patient"}
                    </button>

                  </div>

                ) : (

                  <div>

                    {/* Token */}
                    <div className="rounded-2xl bg-[var(--primary-soft)] p-6 text-center">

                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                        Currently consulting
                      </p>

                      <p className="mt-2 text-5xl font-bold text-[var(--primary)]">
                        #{currentPatient.token_number}
                      </p>

                      <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                        Appointment at{" "}
                        {formatTime(
                          currentPatient.appointment_time
                        )}
                      </p>

                    </div>


                    {/* Patient details */}
                    {patientDetails && (
                      <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">

                        <div className="flex items-center gap-4">

                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)] text-lg">
                            👤
                          </div>

                          <div>

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                              Patient
                            </p>

                            <h3 className="mt-1 text-xl font-bold">
                              {patientDetails.full_name}
                            </h3>

                          </div>

                        </div>


                        <div className="mt-5 grid gap-3 sm:grid-cols-2">

                          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                              Phone
                            </p>

                            <p className="mt-2 text-sm font-semibold">
                              {patientDetails.phone ||
                                "Not provided"}
                            </p>

                          </div>

                          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                              Gender
                            </p>

                            <p className="mt-2 text-sm font-semibold capitalize">
                              {patientDetails.gender ||
                                "Not provided"}
                            </p>

                          </div>

                          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                              Date of Birth
                            </p>

                            <p className="mt-2 text-sm font-semibold">
                              {patientDetails.date_of_birth ||
                                "Not provided"}
                            </p>

                          </div>

                          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                              Token
                            </p>

                            <p className="mt-2 text-sm font-semibold">
                              #{currentPatient.token_number}
                            </p>

                          </div>

                        </div>

                      </div>
                    )}


                    {/* Previous history */}
                    {patientHistory.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">

                        <div>

                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                            Patient history
                          </p>

                          <h3 className="mt-2 text-xl font-bold">
                            Previous consultations
                          </h3>

                        </div>


                        <div className="mt-5 space-y-3">

                          {patientHistory.map(
                            (history) => (
                              <div
                                key={history.id}
                                className="rounded-2xl bg-[var(--surface-soft)] p-4"
                              >

                                <div className="flex items-center justify-between gap-3">

                                  <p className="text-xs font-bold text-[var(--foreground-muted)]">
                                    {new Date(
                                      history.created_at
                                    ).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </p>

                                </div>


                                {history.symptoms && (
                                  <div className="mt-3">

                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                      Symptoms
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-[var(--foreground-secondary)]">
                                      {history.symptoms}
                                    </p>

                                  </div>
                                )}


                                {history.diagnosis && (
                                  <div className="mt-3">

                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                      Diagnosis
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-[var(--foreground-secondary)]">
                                      {history.diagnosis}
                                    </p>

                                  </div>
                                )}


                                {history.advice && (
                                  <div className="mt-3">

                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                      Advice
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-[var(--foreground-secondary)]">
                                      {history.advice}
                                    </p>

                                  </div>
                                )}

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}


                    {/* Complete consultation */}
                    <button
                      type="button"
                      onClick={completeConsultation}
                      disabled={completing}
                      className="mt-5 w-full rounded-2xl bg-[var(--success)] px-5 py-4 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {completing
                        ? "Completing Consultation..."
                        : "✅ Complete Consultation"}
                    </button>

                  </div>

                )}

              </div>

            </div>


            {/* Today's queue */}
            <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

              <div className="border-b border-[var(--border)] p-6">

                <div className="flex items-end justify-between gap-4">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                      Today's OPD
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Patient queue
                    </h2>

                  </div>

                  <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-bold">
                    {queue.length} total
                  </span>

                </div>

              </div>


              <div className="p-5">

                {queue.length === 0 ? (

                  <div className="rounded-2xl bg-[var(--surface-soft)] p-6 text-center">

                    <div className="text-2xl">
                      📭
                    </div>

                    <p className="mt-3 font-bold">
                      No appointments today
                    </p>

                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      Today's OPD queue is currently empty.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {queue.map((item) => {
                      const statusStyles =
                        getStatusStyles(
                          item.status
                        );

                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-4 ${
                            item.status ===
                            "in_consultation"
                              ? "border-[var(--primary)]/40 bg-[var(--primary-soft)]"
                              : "border-[var(--border)] bg-[var(--surface-soft)]"
                          }`}
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div>

                              <p className="text-lg font-bold">
                                Token #
                                {item.token_number}
                              </p>

                              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                                {formatTime(
                                  item.appointment_time
                                )}
                              </p>

                            </div>


                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles.badge}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${statusStyles.dot}`}
                              />

                              {formatStatus(
                                item.status
                              )}
                            </span>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                )}

              </div>

            </div>

          </div>


          {/* -------------------------------------------------
              RIGHT: CONSULTATION FORM
          -------------------------------------------------- */}

          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

            <div className="border-b border-[var(--border)] p-6 sm:p-7">

              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                Medical record
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Consultation & prescription
              </h2>

              <p className="mt-2 leading-6 text-[var(--foreground-secondary)]">
                Record today's consultation details and prescription for
                the current patient.
              </p>

            </div>


            <div className="p-6 sm:p-7">

              {!currentPatient ? (

                <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] p-7 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                    🩺
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    No active consultation
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--foreground-secondary)]">
                    Call the next patient from the queue before entering
                    consultation information.
                  </p>

                </div>

              ) : (

                <div className="space-y-6">

                  {/* Current patient banner */}
                  <div className="rounded-2xl bg-[var(--primary-soft)] p-4">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                          Current patient
                        </p>

                        <p className="mt-1 font-bold">
                          {patientDetails?.full_name ||
                            `Token #${currentPatient.token_number}`}
                        </p>

                      </div>

                      <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                        #{currentPatient.token_number}
                      </span>

                    </div>

                  </div>


                  {/* =========================================
                      CLINICAL INFORMATION
                  ========================================== */}

                  <div>

                    <div className="mb-5">

                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                        Clinical information
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        Patient assessment
                      </h3>

                    </div>


                    {/* Symptoms */}
                    <div>

                      <label className="text-sm font-bold">
                        Symptoms
                      </label>

                      <textarea
                        value={symptoms}
                        onChange={(event) =>
                          setSymptoms(
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Describe the patient's symptoms..."
                        className="mt-2 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[var(--primary)]"
                      />

                    </div>


                    {/* Diagnosis */}
                    <div className="mt-5">

                      <label className="text-sm font-bold">
                        Diagnosis
                      </label>

                      <textarea
                        value={diagnosis}
                        onChange={(event) =>
                          setDiagnosis(
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Enter the diagnosis..."
                        className="mt-2 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[var(--primary)]"
                      />

                    </div>


                    {/* Notes */}
                    <div className="mt-5">

                      <label className="text-sm font-bold">
                        Consultation Notes
                      </label>

                      <textarea
                        value={notes}
                        onChange={(event) =>
                          setNotes(
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Record important consultation notes..."
                        className="mt-2 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[var(--primary)]"
                      />

                    </div>


                    {/* Tests */}
                    <div className="mt-5">

                      <label className="text-sm font-bold">
                        Tests Recommended
                      </label>

                      <textarea
                        value={
                          testsRecommended
                        }
                        onChange={(event) =>
                          setTestsRecommended(
                            event.target.value
                          )
                        }
                        rows={3}
                        placeholder="Example: CBC, X-ray, MRI..."
                        className="mt-2 w-full rounded-