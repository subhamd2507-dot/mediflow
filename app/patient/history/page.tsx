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

  const [consultations, setConsultations] = useState<ConsultationView[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        // ---------------------------------------
        // 1. Get logged-in patient
        // ---------------------------------------
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

        // ---------------------------------------
        // 2. Find patient profile
        // ---------------------------------------
        const { data: patient, error: patientError } = await supabase
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

        // ---------------------------------------
        // 3. Load consultations
        // ---------------------------------------
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

        // ---------------------------------------
        // 4. Load prescriptions
        // ---------------------------------------
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

        // ---------------------------------------
        // 5. Get appointment IDs
        // ---------------------------------------
        const appointmentIds =
          (consultationData || []).map(
            (consultation) => consultation.appointment_id
          );

        let appointmentMap: Record<string, Appointment> = {};

        if (appointmentIds.length > 0) {
          const { data: appointmentData, error: appointmentError } =
            await supabase
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

        // ---------------------------------------
        // 6. Get doctor IDs
        // ---------------------------------------
        const doctorIds = [
          ...new Set(
            (consultationData || []).map(
              (consultation) => consultation.doctor_id
            )
          ),
        ];

        let doctorMap: Record<string, Doctor> = {};

        if (doctorIds.length > 0) {
          const { data: doctorData, error: doctorError } = await supabase
            .from("doctors")
            .select(
              "id, name, specialization, qualification, experience_years"
            )
            .in("id", doctorIds);

          if (doctorError) {
            throw doctorError;
          }

          doctorMap = Object.fromEntries(
            (doctorData || []).map((doctor) => [doctor.id, doctor])
          );
        }

        // ---------------------------------------
        // 7. Combine everything
        // ---------------------------------------
        const enhancedConsultations: ConsultationView[] = (
          consultationData || []
        ).map((consultation) => ({
          ...consultation,
          appointment: appointmentMap[consultation.appointment_id],
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
  }, [supabase]);

  const getPrescriptionForConsultation = (consultationId: string) => {
    return prescriptions.filter(
      (prescription) => prescription.consultation_id === consultationId
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href="/patient"
          className="text-blue-600 font-semibold hover:underline"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mt-6">
          <p className="text-blue-600 font-semibold">MEDIFLOW</p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Medical History
          </h1>

          <p className="mt-2 text-slate-600">
            View your previous consultations and prescriptions.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-600">
              Loading medical history...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-bold text-red-700">
              Unable to load history
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          consultations.length === 0 && (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                No Medical History
              </h2>

              <p className="mt-2 text-slate-600">
                You don't have any completed consultations yet.
              </p>
            </div>
          )}

        {/* History */}
        {!loading &&
          !error &&
          consultations.length > 0 && (
            <div className="mt-8 space-y-8">

              {consultations.map((consultation) => {
                const consultationPrescriptions =
                  getPrescriptionForConsultation(
                    consultation.id
                  );

                return (
                  <div
                    key={consultation.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >

                    {/* ================================= */}
                    {/* Consultation Header */}
                    {/* ================================= */}
                    <div className="border-b bg-slate-50 p-6">

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                            Medical Consultation
                          </p>

                          <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            {new Date(
                              consultation.created_at
                            ).toLocaleDateString()}
                          </h2>
                        </div>

                        {consultation.appointment && (
                          <div className="rounded-xl bg-blue-600 px-5 py-3 text-center text-white">
                            <p className="text-xs uppercase tracking-wide">
                              Token
                            </p>

                            <p className="text-2xl font-bold">
                              #{consultation.appointment.token_number}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Doctor */}
                      {consultation.doctor && (
                        <div className="mt-5 rounded-xl bg-white p-4 shadow-sm">

                          <p className="text-sm font-semibold text-blue-600">
                            Doctor
                          </p>

                          <p className="mt-1 text-xl font-bold text-slate-900">
                            Dr. {consultation.doctor.name}
                          </p>

                          <p className="mt-1 text-slate-600">
                            {consultation.doctor.specialization}
                          </p>

                          {consultation.doctor.qualification && (
                            <p className="text-sm text-slate-500">
                              {consultation.doctor.qualification}
                            </p>
                          )}

                          {consultation.doctor.experience_years !==
                            null && (
                            <p className="text-sm text-slate-500">
                              {consultation.doctor.experience_years} years
                              of experience
                            </p>
                          )}
                        </div>
                      )}

                      {/* Appointment */}
                      {consultation.appointment && (
                        <div className="mt-4 grid gap-3 md:grid-cols-3">

                          <div className="rounded-lg border bg-white p-3">
                            <p className="text-xs text-slate-500">
                              Appointment Date
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                              {new Date(
                                consultation.appointment.appointment_date
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="rounded-lg border bg-white p-3">
                            <p className="text-xs text-slate-500">
                              Appointment Time
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                              {consultation.appointment.appointment_time}
                            </p>
                          </div>

                          <div className="rounded-lg border bg-white p-3">
                            <p className="text-xs text-slate-500">
                              Status
                            </p>

                            <p className="mt-1 font-semibold capitalize text-slate-900">
                              {consultation.appointment.status.replace(
                                /_/g,
                                " "
                              )}
                            </p>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* ================================= */}
                    {/* Consultation Details */}
                    {/* ================================= */}
                    <div className="p-6">

                      <div className="space-y-6">

                        {consultation.symptoms && (
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Symptoms
                            </h3>

                            <p className="mt-1 whitespace-pre-line text-slate-600">
                              {consultation.symptoms}
                            </p>
                          </div>
                        )}

                        {consultation.diagnosis && (
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Diagnosis
                            </h3>

                            <p className="mt-1 whitespace-pre-line text-slate-600">
                              {consultation.diagnosis}
                            </p>
                          </div>
                        )}

                        {consultation.notes && (
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Consultation Notes
                            </h3>

                            <p className="mt-1 whitespace-pre-line text-slate-600">
                              {consultation.notes}
                            </p>
                          </div>
                        )}

                        {consultation.tests_recommended && (
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Tests Recommended
                            </h3>

                            <p className="mt-1 whitespace-pre-line text-slate-600">
                              {consultation.tests_recommended}
                            </p>
                          </div>
                        )}

                        {consultation.advice && (
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Advice
                            </h3>

                            <p className="mt-1 whitespace-pre-line text-slate-600">
                              {consultation.advice}
                            </p>
                          </div>
                        )}

                        {consultation.follow_up_date && (
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Follow-up Date
                            </h3>

                            <p className="mt-1 text-slate-600">
                              {new Date(
                                consultation.follow_up_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                      </div>

                      {/* ================================= */}
                      {/* Prescription */}
                      {/* ================================= */}
                      {consultationPrescriptions.length > 0 && (
                        <div className="mt-8 border-t pt-6">

                          <h3 className="text-xl font-bold text-slate-900">
                            Prescription
                          </h3>

                          <div className="mt-4 space-y-4">

                            {consultationPrescriptions.map(
                              (prescription) => (
                                <div
                                  key={prescription.id}
                                  className="rounded-xl border border-blue-100 bg-blue-50/50 p-5"
                                >

                                  <p className="text-lg font-bold text-slate-900">
                                    {prescription.medicine_name}
                                  </p>

                                  <div className="mt-3 grid gap-3 md:grid-cols-2">

                                    {prescription.dosage && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                          Dosage
                                        </p>
                                        <p className="mt-1 text-slate-700">
                                          {prescription.dosage}
                                        </p>
                                      </div>
                                    )}

                                    {prescription.frequency && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                          Frequency
                                        </p>
                                        <p className="mt-1 text-slate-700">
                                          {prescription.frequency}
                                        </p>
                                      </div>
                                    )}

                                    {prescription.duration && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                          Duration
                                        </p>
                                        <p className="mt-1 text-slate-700">
                                          {prescription.duration}
                                        </p>
                                      </div>
                                    )}

                                  </div>

                                  {prescription.instructions && (
                                    <div className="mt-4 rounded-lg bg-white p-3">
                                      <p className="text-xs font-semibold uppercase text-slate-500">
                                        Instructions
                                      </p>

                                      <p className="mt-1 text-slate-700">
                                        {prescription.instructions}
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
                );
              })}

            </div>
          )}

      </div>
    </main>
  );
}