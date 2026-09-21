"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Hospital = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
};

type Department = {
  id: string;
  hospital_id: string;
  name: string;
  description: string | null;
};

type Doctor = {
  id: string;
  hospital_id: string;
  department_id: string | null;
  name: string;
  specialization: string;
  qualification: string | null;
  experience_years: number | null;
  consultation_fee: number | null;
};

export default function BookOPDPage() {
  const supabase = createClient();
  const router = useRouter();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD HOSPITALS
  // ==========================================

  useEffect(() => {
    async function loadHospitals() {
      setLoadingHospitals(true);
      setError("");

      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setHospitals(data || []);
      }

      setLoadingHospitals(false);
    }

    loadHospitals();
  }, []);

  // ==========================================
  // LOAD DEPARTMENTS
  // ==========================================

  useEffect(() => {
    async function loadDepartments() {
      if (!selectedHospital) {
        setDepartments([]);
        return;
      }

      setLoadingDepartments(true);
      setError("");

      setSelectedDepartment("");
      setSelectedDoctor("");
      setDoctors([]);

      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("hospital_id", selectedHospital)
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setDepartments(data || []);
      }

      setLoadingDepartments(false);
    }

    loadDepartments();
  }, [selectedHospital]);

  // ==========================================
  // LOAD DOCTORS
  // ==========================================

  useEffect(() => {
    async function loadDoctors() {
      if (!selectedDepartment) {
        setDoctors([]);
        return;
      }

      setLoadingDoctors(true);
      setError("");

      setSelectedDoctor("");

      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("department_id", selectedDepartment)
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setDoctors(data || []);
      }

      setLoadingDoctors(false);
    }

    loadDoctors();
  }, [selectedDepartment]);

    // ==========================================
  // LOAD BOOKED TIME SLOTS
  // ==========================================

  useEffect(() => {
    async function loadBookedTimes() {
      if (!selectedDoctor || !appointmentDate) {
        setBookedTimes([]);
        return;
      }

      const { data, error } = await supabase.rpc(
  "get_booked_times",
  {
    p_doctor_id: selectedDoctor,
    p_appointment_date: appointmentDate,
  }
);

      if (error) {
        setError(error.message);
        setBookedTimes([]);
        return;
      }

      setBookedTimes(
        (data || [])
         .map(
  (appointment: { appointment_time: string | null }) =>
    appointment.appointment_time
)
          .filter(Boolean)
      );
    }

    loadBookedTimes();
  }, [selectedDoctor, appointmentDate]);

  // ==========================================
  // BOOK APPOINTMENT
  // ==========================================

  async function handleBooking() {
    setError("");
    setSuccess("");

    if (
      !selectedHospital ||
      !selectedDepartment ||
      !selectedDoctor ||
      !appointmentDate ||
      !appointmentTime
    ) {
      setError("Please complete all appointment fields.");
      return;
    }

    setBooking(true);

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to book an OPD appointment.");
      setBooking(false);
      return;
    }

    // Check patient profile
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", user.id)
      .single();

    if (patientError || !patient) {
      setError("Patient profile not found.");
      setBooking(false);
      return;
    }

      // Check whether this doctor already has an appointment
    // at the selected date and time.
    const { data: conflictingAppointment, error: conflictError } =
      await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_id", selectedDoctor)
        .eq("appointment_date", appointmentDate)
        .eq("appointment_time", appointmentTime)
        .in("status", ["booked", "waiting", "in_consultation"])
        .maybeSingle();

    if (conflictError) {
      setError(conflictError.message);
      setBooking(false);
      return;
    }

    if (conflictingAppointment) {
      setError(
        "This doctor already has an appointment at the selected time. Please choose another time."
      );
      setBooking(false);
      return;
    }

    // Find existing appointments for this doctor
    const { data: nextToken, error: queueError } = await supabase.rpc(
  "get_next_token",
  {
    p_doctor_id: selectedDoctor,
    p_appointment_date: appointmentDate,
  }
);

if (queueError) {
  setError(queueError.message);
  setBooking(false);
  return;
}

// Create appointment
const { data: appointment, error: appointmentError } =
  await supabase
    .from("appointments")
    .insert({
      patient_id: patient.id,
      doctor_id: selectedDoctor,
      hospital_id: selectedHospital,
      department_id: selectedDepartment,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      token_number: nextToken,
      status: "booked",
    })
    .select()
    .single();

if (appointmentError) {
  setError(appointmentError.message);
  setBooking(false);
  return;
}

setSuccess(
  `Appointment booked successfully. Your token number is #${appointment.token_number}.`
);

setBooking(false);

// Send patient to appointments page after a short delay
setTimeout(() => {
  router.push("/patient/appointments");
  router.refresh();
}, 1500);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="text-center">

          <p className="font-semibold text-blue-600">
            MEDIFLOW
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Book Your OPD
          </h1>

          <p className="mt-4 text-slate-600">
            Choose your hospital, department, doctor and appointment time.
          </p>

        </div>


        {/* BOOKING CARD */}
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* SUCCESS */}
          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}


          {/* HOSPITAL */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Hospital
            </label>

            <select
              value={selectedHospital}
              onChange={(event) =>
                setSelectedHospital(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >

              <option value="">
                {loadingHospitals
                  ? "Loading hospitals..."
                  : "Select hospital"}
              </option>

              {hospitals.map((hospital) => (
                <option
                  key={hospital.id}
                  value={hospital.id}
                >
                  {hospital.name}
                </option>
              ))}

            </select>

          </div>


          {/* DEPARTMENT */}
          <div className="mt-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Department
            </label>

            <select
              value={selectedDepartment}
              onChange={(event) =>
                setSelectedDepartment(event.target.value)
              }
              disabled={!selectedHospital || loadingDepartments}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
            >

              <option value="">
                {loadingDepartments
                  ? "Loading departments..."
                  : "Select department"}
              </option>

              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}

            </select>

          </div>


          {/* DOCTOR */}
          <div className="mt-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Doctor
            </label>

            <select
              value={selectedDoctor}
              onChange={(event) =>
                setSelectedDoctor(event.target.value)
              }
              disabled={!selectedDepartment || loadingDoctors}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
            >

              <option value="">
                {loadingDoctors
                  ? "Loading doctors..."
                  : "Select doctor"}
              </option>

              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  {doctor.name} — {doctor.specialization}
                </option>
              ))}

            </select>

          </div>


          {/* DATE */}
          <div className="mt-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Appointment Date
            </label>

            <input
              type="date"
              value={appointmentDate}
              onChange={(event) =>
                setAppointmentDate(event.target.value)
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>


          {/* TIME */}
          <div className="mt-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Preferred Time
            </label>

            <select
  value={appointmentTime}
  onChange={(event) => setAppointmentTime(event.target.value)}
  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
  disabled={!selectedDoctor || !appointmentDate}
>
  <option value="">
    {!selectedDoctor || !appointmentDate
      ? "Select doctor and date first"
      : "Select time"}
  </option>

  <option
    value="09:00"
    disabled={bookedTimes.some(
      (time) => time?.slice(0, 5) === "09:00"
    )}
  >
    09:00 AM
    {bookedTimes.some(
      (time) => time?.slice(0, 5) === "09:00"
    )
      ? " — Booked"
      : ""}
  </option>

  <option
    value="09:30"
    disabled={bookedTimes.some(
      (time) => time?.slice(0, 5) === "09:30"
    )}
  >
    09:30 AM
    {bookedTimes.some(
      (time) => time?.slice(0, 5) === "09:30"
    )
      ? " — Booked"
      : ""}
  </option>

  <option
    value="10:00"
    disabled={bookedTimes.some(
      (time) => time?.slice(0, 5) === "10:00"
    )}
  >
    10:00 AM
    {bookedTimes.some(
      (time) => time?.slice(0, 5) === "10:00"
    )
      ? " — Booked"
      : ""}
  </option>

  <option
    value="10:30"
    disabled={bookedTimes.some(
      (time) => time?.slice(0, 5) === "10:30"
    )}
  >
    10:30 AM
    {bookedTimes.some(
      (time) => time?.slice(0, 5) === "10:30"
    )
      ? " — Booked"
      : ""}
  </option>

  <option
    value="11:00"
    disabled={bookedTimes.some(
      (time) => time?.slice(0, 5) === "11:00"
    )}
  >
    11:00 AM
    {bookedTimes.some(
      (time) => time?.slice(0, 5) === "11:00"
    )
      ? " — Booked"
      : ""}
  </option>

  <option
    value="11:30"
    disabled={bookedTimes.some(
      (time) => time?.slice(0, 5) === "11:30"
    )}
  >
    11:30 AM
    {bookedTimes.some(
      (time) => time?.slice(0, 5) === "11:30"
    )
      ? " — Booked"
      : ""}
  </option>

  <option
    value="12:00"
    disabled={bookedTimes.some(
      (time) => time?.slice(0, 5) === "12:00"
    )}
  >
    12:00 PM
    {bookedTimes.some(
      (time) => time?.slice(0, 5) === "12:00"
    )
      ? " — Booked"
      : ""}
  </option>
</select>

          </div>


          {/* CONFIRM BUTTON */}
          <button
            type="button"
            onClick={handleBooking}
            disabled={booking}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {booking ? "Booking Appointment..." : "Confirm OPD Booking"}
          </button>

        </div>

      </div>
    </main>
  );
}