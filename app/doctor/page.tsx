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

export default function DoctorDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);

 const [patientDetails, setPatientDetails] = useState<{
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
} | null>(null);

const [patientHistory, setPatientHistory] = useState<
  {
    id: string;
    symptoms: string | null;
    diagnosis: string | null;
    notes: string | null;
    tests_recommended: string | null;
    advice: string | null;
    follow_up_date: string | null;
    created_at: string;
  }[]
>([]);

  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [symptoms, setSymptoms] = useState("");
const [diagnosis, setDiagnosis] = useState("");
const [notes, setNotes] = useState("");
const [testsRecommended, setTestsRecommended] = useState("");
const [advice, setAdvice] = useState("");
const [followUpDate, setFollowUpDate] = useState("");

const [medicineName, setMedicineName] = useState("");
const [dosage, setDosage] = useState("");
const [frequency, setFrequency] = useState("");
const [duration, setDuration] = useState("");
const [instructions, setInstructions] = useState("");

const [savingConsultation, setSavingConsultation] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------
      // 1. Get logged-in user
      // -----------------------------------------

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

      // -----------------------------------------
      // 2. Find connected doctor
      // -----------------------------------------

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

      // -----------------------------------------
      // 3. Load today's appointments
      // -----------------------------------------

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

      const currentAppointment = (queueData || []).find(
  (item) => item.status === "in_consultation"
);

if (currentAppointment) {
  const { data: patientData, error: patientError } = await supabase
    .from("patients")
    .select("full_name, phone, date_of_birth, gender")
    .eq("id", currentAppointment.patient_id)
    .maybeSingle();

  if (patientError) {
    throw new Error(patientError.message);
  }

  setPatientDetails(patientData);
  const { data: historyData, error: historyError } = await supabase
  .from("consultations")
  .select(
    "id, symptoms, diagnosis, notes, tests_recommended, advice, follow_up_date, created_at"
  )
  .eq("patient_id", currentAppointment.patient_id)
  .order("created_at", { ascending: false });

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

  // ---------------------------------------------
  // CALL NEXT PATIENT
  // ---------------------------------------------

  async function callNextPatient() {
  if (!doctor) {
    return;
  }

  setCalling(true);
  setError("");
  setMessage("");

  const { data, error: rpcError } = await supabase.rpc(
    "call_next_patient",
    {
      p_doctor_id: doctor.id,
      p_appointment_date: today,
    }
  );

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

async function completeConsultation() {
  if (!currentPatient) {
    return;
  }

  setCompleting(true);
  setError("");
  setMessage("");

  const { data, error: completeError } = await supabase.rpc(
    "complete_consultation",
    {
      p_appointment_id: currentPatient.id,
    }
  );

  if (completeError) {
    setError(completeError.message);
    setCompleting(false);
    return;
  }

  if (!data || data.length === 0) {
    setError("The consultation could not be completed.");
    setCompleting(false);
    return;
  }

  setMessage(
    `Consultation for Token #${data[0].token_number} completed successfully.`
  );

  await loadDashboard();

  setCompleting(false);
}

async function saveConsultation() {
  if (!currentPatient || !doctor) {
    setError("No patient is currently in consultation.");
    return;
  } 

  if (!symptoms.trim() && !diagnosis.trim()) {
    setError("Please enter at least symptoms or diagnosis.");
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
    // ------------------------------------------------------------
    // 1. Get the appointment details
    // ------------------------------------------------------------

    const { data: appointment, error: appointmentError } =
      await supabase
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

    // ------------------------------------------------------------
    // 2. Create consultation record
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // 2. Find existing consultation or create a new one
    // ------------------------------------------------------------

    const {
      data: existingConsultation,
      error: existingConsultationError,
    } = await supabase
      .from("consultations")
      .select("id")
      .eq("appointment_id", appointment.id)
      .maybeSingle();

    if (existingConsultationError) {
      throw new Error(existingConsultationError.message);
    }

    let consultationId: string;

    if (existingConsultation) {
      // Consultation already exists — reuse it
      consultationId = existingConsultation.id;

      const { error: updateConsultationError } = await supabase
        .from("consultations")
        .update({
          symptoms: symptoms.trim() || null,
          diagnosis: diagnosis.trim() || null,
          notes: notes.trim() || null,
          tests_recommended: testsRecommended.trim() || null,
          advice: advice.trim() || null,
          follow_up_date: followUpDate || null,
        })
        .eq("id", consultationId);

      if (updateConsultationError) {
        throw new Error(updateConsultationError.message);
      }
    } else {
      // No consultation exists — create one
      const { data: newConsultation, error: consultationError } =
        await supabase
          .from("consultations")
          .insert({
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            symptoms: symptoms.trim() || null,
            diagnosis: diagnosis.trim() || null,
            notes: notes.trim() || null,
            tests_recommended: testsRecommended.trim() || null,
            advice: advice.trim() || null,
            follow_up_date: followUpDate || null,
          })
          .select("id")
          .single();

      if (consultationError) {
        throw new Error(consultationError.message);
      }

      if (!newConsultation) {
        throw new Error("Consultation could not be created.");
      }

      consultationId = newConsultation.id;
    }

    // ------------------------------------------------------------
    // 3. Create prescription record
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // 3. Find existing prescription or create a new one
    // ------------------------------------------------------------

    const {
      data: existingPrescription,
      error: existingPrescriptionError,
    } = await supabase
      .from("prescriptions")
      .select("id")
      .eq("consultation_id", consultationId)
      .maybeSingle();

    if (existingPrescriptionError) {
      throw new Error(existingPrescriptionError.message);
    }

    if (existingPrescription) {
      // Prescription already exists — update it
      const { error: updatePrescriptionError } = await supabase
        .from("prescriptions")
        .update({
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          medicine_name: medicineName.trim(),
          dosage: dosage.trim() || null,
          frequency: frequency.trim() || null,
          duration: duration.trim() || null,
          instructions: instructions.trim() || null,
        })
        .eq("id", existingPrescription.id);

      if (updatePrescriptionError) {
        throw new Error(updatePrescriptionError.message);
      }
    } else {
      // No prescription exists — create one
      const { error: prescriptionError } = await supabase
        .from("prescriptions")
        .insert({
          consultation_id: consultationId,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          medicine_name: medicineName.trim(),
          dosage: dosage.trim() || null,
          frequency: frequency.trim() || null,
          duration: duration.trim() || null,
          instructions: instructions.trim() || null,
        });

      if (prescriptionError) {
        throw new Error(prescriptionError.message);
      }
    }

    

    // ------------------------------------------------------------
    // 4. Success
    // ------------------------------------------------------------

    setMessage(
      `Consultation for Token #${currentPatient.token_number} saved successfully.`
    );

    // Clear the form
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

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">

        <div className="mx-auto max-w-5xl text-center">

          <p className="text-slate-600">
            Loading doctor dashboard...
          </p>

        </div>

      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">

        <div className="mx-auto max-w-5xl">

          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Doctor Dashboard
          </h1>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

            <h2 className="text-xl font-bold text-red-700">
              Dashboard Error
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>

          </div>

        </div>

      </main>
    );
  }

  const currentPatient = queue.find(
    (item) => item.status === "in_consultation"
  );

  const waitingPatients = queue.filter(
    (item) =>
      item.status === "booked" ||
      item.status === "checked_in" ||
      item.status === "waiting"
  );

  const completedPatients = queue.filter(
    (item) => item.status === "completed"
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-5xl">

        {/* ----------------------------------- */}
        {/* HEADER */}
        {/* ----------------------------------- */}

        <div>

          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Doctor Dashboard
          </h1>

          <p className="mt-3 text-slate-600">
            Manage today's OPD queue.
          </p>

        </div>


        {/* ----------------------------------- */}
        {/* DOCTOR PROFILE */}
        {/* ----------------------------------- */}

        {doctor && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold text-blue-600">
              Doctor Profile
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {doctor.name}
            </h2>

            <p className="mt-2 text-lg text-slate-600">
              {doctor.specialization}
            </p>

            {doctor.qualification && (
              <p className="mt-2 text-slate-500">
                {doctor.qualification}
              </p>
            )}

            {doctor.experience_years !== null && (
              <p className="mt-2 text-slate-500">
                {doctor.experience_years} years of experience
              </p>
            )}

          </div>
        )}


        {/* ----------------------------------- */}
        {/* MESSAGES */}
        {/* ----------------------------------- */}

        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}


        {/* ----------------------------------- */}
        {/* CURRENT PATIENT */}
        {/* ----------------------------------- */}

        <div className="mt-6 rounded-3xl bg-blue-600 p-8 text-center text-white">

          <p className="text-sm font-medium text-blue-100">
            CURRENTLY IN CONSULTATION
          </p>

          <p className="mt-2 text-6xl font-bold">
            #{currentPatient?.token_number ?? "-"}
          </p>

          <p className="mt-4 text-blue-100">
            {currentPatient
              ? "Consultation in progress"
              : "No patient currently in consultation"}
          </p>

        </div>


        {/* ----------------------------------- */}
        {/* STATISTICS */}
        {/* ----------------------------------- */}

        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <p className="text-sm text-slate-500">
              Total Appointments
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {queue.length}
            </p>

          </div>


          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <p className="text-sm text-slate-500">
              Waiting Patients
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {waitingPatients.length}
            </p>

          </div>


          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {completedPatients.length}
            </p>

          </div>

        </div>


        {/* ----------------------------------- */}
        {/* QUEUE CONTROL */}
        {/* ----------------------------------- */}

        <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">

  <h2 className="text-2xl font-bold text-slate-900">
    Queue Control
  </h2>

  <p className="mt-2 text-slate-600">
    Manage the current OPD patient.
  </p>

  {!currentPatient && (
    <button
      type="button"
      onClick={callNextPatient}
      disabled={
        calling || waitingPatients.length === 0
      }
      className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {calling
        ? "Calling Patient..."
        : waitingPatients.length === 0
        ? "No Waiting Patients"
        : "📢 Call Next Patient"}
    </button>
  )}

  {currentPatient && (
    <div className="mt-6">

      <div className="rounded-xl bg-blue-50 p-5 text-center">

        <p className="text-sm font-medium text-blue-700">
          Currently Consulting
        </p>

        <p className="mt-2 text-4xl font-bold text-blue-700">
          #{currentPatient.token_number}
        </p>

      </div>

      {patientDetails && (
  <div className="mt-4 rounded-xl bg-slate-50 p-5">
    <h3 className="text-lg font-bold text-slate-900">
      Patient Details
    </h3>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <p className="text-sm text-slate-500">Name</p>
        <p className="font-semibold text-slate-900">
          {patientDetails.full_name}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Phone</p>
        <p className="font-semibold text-slate-900">
          {patientDetails.phone || "Not provided"}
        </p>
      </div>

      

      <div>
        <p className="text-sm text-slate-500">Gender</p>
        <p className="font-semibold text-slate-900">
          {patientDetails.gender || "Not provided"}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Date of Birth</p>
        <p className="font-semibold text-slate-900">
          {patientDetails.date_of_birth || "Not provided"}
        </p>
      </div>
    </div>
  </div>
)}

{patientHistory.length > 0 && (
  <div className="mt-4 rounded-xl bg-white border border-slate-200 p-5">
    <h3 className="text-lg font-bold text-slate-900">
      Previous Medical History
    </h3>

    <div className="mt-4 space-y-4">
      {patientHistory.map((history) => (
        <div
          key={history.id}
          className="rounded-xl bg-slate-50 p-4"
        >
          <p className="text-sm text-slate-500">
            {new Date(history.created_at).toLocaleDateString()}
          </p>

          {history.symptoms && (
            <div className="mt-3">
              <p className="font-semibold text-slate-900">
                Symptoms
              </p>
              <p className="mt-1 text-slate-600">
                {history.symptoms}
              </p>
            </div>
          )}

          {history.diagnosis && (
            <div className="mt-3">
              <p className="font-semibold text-slate-900">
                Diagnosis
              </p>
              <p className="mt-1 text-slate-600">
                {history.diagnosis}
              </p>
            </div>
          )}

          {history.notes && (
            <div className="mt-3">
              <p className="font-semibold text-slate-900">
                Consultation Notes
              </p>
              <p className="mt-1 text-slate-600">
                {history.notes}
              </p>
            </div>
          )}

          {history.tests_recommended && (
            <div className="mt-3">
              <p className="font-semibold text-slate-900">
                Tests Recommended
              </p>
              <p className="mt-1 text-slate-600">
                {history.tests_recommended}
              </p>
            </div>
          )}

          {history.advice && (
            <div className="mt-3">
              <p className="font-semibold text-slate-900">
                Advice
              </p>
              <p className="mt-1 text-slate-600">
                {history.advice}
              </p>
            </div>
          )}

          {history.follow_up_date && (
            <div className="mt-3">
              <p className="font-semibold text-slate-900">
                Follow-up Date
              </p>
              <p className="mt-1 text-slate-600">
                {history.follow_up_date}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
      <button
        type="button"
        onClick={completeConsultation}
        
        disabled={completing}
        className="mt-4 w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {completing
          ? "Completing Consultation..."
          : "✅ Complete Consultation"}
      </button>

    </div>
  )}

</div>


        {/* ----------------------------------- */}
        {/* TODAY'S QUEUE */}
        {/* ----------------------------------- */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Today's Queue
          </h2>

          {queue.length === 0 ? (

            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">

              <p className="text-slate-500">
                No appointments scheduled for today.
              </p>

            </div>

          ) : (

            <div className="mt-5 space-y-3">

              {queue.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >

                  <div>

                    <p className="text-lg font-bold text-slate-900">
                      Token #{item.token_number}
                    </p>

                    <p className="text-sm text-slate-500">
                      Appointment: {item.appointment_time}
                    </p>

                  </div>


                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold capitalize text-slate-700">
                    {item.status.replaceAll("_", " ")}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* ============================================================
    CONSULTATION & MEDICAL RECORD
============================================================ */}

<div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">

  <h2 className="text-2xl font-bold text-slate-900">
    Consultation & Medical Record
  </h2>

  <p className="mt-2 text-slate-600">
    Enter the patient's consultation details and prescription.
  </p>

  <div className="mt-6 grid gap-6">

    {/* Symptoms */}
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        Symptoms
      </label>

      <textarea
  value={symptoms}
  onChange={(e) => setSymptoms(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  rows={4}
  placeholder="Enter patient's symptoms..."
/>
    </div>

    {/* Diagnosis */}
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        Diagnosis
      </label>

      <textarea
  value={diagnosis}
  onChange={(e) => setDiagnosis(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  rows={4}
  placeholder="Enter diagnosis..."
/>
    </div>

    {/* Notes */}
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        Consultation Notes
      </label>

      <textarea
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  rows={4}
  placeholder="Enter consultation notes..."
/>
    </div>

    {/* Tests */}
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        Tests Recommended
      </label>

      <textarea
  value={testsRecommended}
  onChange={(e) => setTestsRecommended(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  rows={3}
  placeholder="Example: CBC, X-ray, MRI..."
/>
    </div>

    {/* Advice */}
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        Advice
      </label>

      <textarea
  value={advice}
  onChange={(e) => setAdvice(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  rows={3}
  placeholder="Enter advice for the patient..."
/>
    </div>

    {/* Follow-up */}
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        Follow-up Date
      </label>

      <input
  type="date"
  value={followUpDate}
  onChange={(e) => setFollowUpDate(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
/>
    </div>

    {/* Prescription */}
    <div className="border-t border-slate-200 pt-6">

      <h3 className="text-xl font-bold text-slate-900">
        Prescription
      </h3>

      <div className="mt-4 grid gap-4">

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Medicine Name
          </label>

          <input
  type="text"
  value={medicineName}
  onChange={(e) => setMedicineName(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  placeholder="Example: Paracetamol 500mg"
/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Dosage
          </label>

          <input
  type="text"
  value={dosage}
  onChange={(e) => setDosage(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  placeholder="Example: 1 tablet"
/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Frequency
          </label>

          <input
  type="text"
  value={frequency}
  onChange={(e) => setFrequency(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  placeholder="Example: Twice daily"
/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Duration
          </label>

          <input
            type="text"
            className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
            placeholder="Example: 5 days"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Instructions
          </label>

          <textarea
  value={instructions}
  onChange={(e) => setInstructions(e.target.value)}
  className="mt-2 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
  rows={3}
  placeholder="Example: Take after food..."
/>
        </div>

      </div>
    </div>

    <button
      type="button"
      onClick={saveConsultation}
      disabled={savingConsultation}
      className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
    >
      💾 Save Consultation
    </button>

  </div>
</div>

    </main>
  );
}