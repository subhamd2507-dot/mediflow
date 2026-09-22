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

const timeSlots = [
  { value: "09:00", label: "09:00 AM" },
  { value: "09:30", label: "09:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "10:30", label: "10:30 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "12:00", label: "12:00 PM" },
];

export default function BookOPDPage() {
  const supabase = createClient();
  const router = useRouter();

  /* =========================================================
     DATA
  ========================================================= */

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  /* =========================================================
     SELECTIONS
  ========================================================= */

  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  /* =========================================================
     LOADING
  ========================================================= */

  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [booking, setBooking] = useState(false);

  /* =========================================================
     MESSAGES
  ========================================================= */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD HOSPITALS
  ========================================================= */

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

  /* =========================================================
     LOAD DEPARTMENTS
  ========================================================= */

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
      setAppointmentTime("");

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

  /* =========================================================
     LOAD DOCTORS
  ========================================================= */

  useEffect(() => {
    async function loadDoctors() {
      if (!selectedDepartment) {
        setDoctors([]);
        return;
      }

      setLoadingDoctors(true);
      setError("");

      setSelectedDoctor("");
      setAppointmentTime("");

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

  /* =========================================================
     LOAD BOOKED TIMES
  ========================================================= */

  useEffect(() => {
    async function loadBookedTimes() {
      if (!selectedDoctor || !appointmentDate) {
        setBookedTimes([]);
        return;
      }

      const { data, error } = await supabase.rpc("get_booked_times", {
        p_doctor_id: selectedDoctor,
        p_appointment_date: appointmentDate,
      });

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

      setAppointmentTime("");
    }

    loadBookedTimes();
  }, [selectedDoctor, appointmentDate]);

  /* =========================================================
     BOOK APPOINTMENT
     ========================================================= */

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

    /* Get logged-in user */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to book an OPD appointment.");
      setBooking(false);
      return;
    }

    /* Check patient profile */
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

    /* Check for appointment conflict */
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

    /* Get next token */
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

    /* Create appointment */
    const { data: appointment, error: appointmentError } = await supabase
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

    setTimeout(() => {
      router.push("/patient/appointments");
      router.refresh();
    }, 1500);
  }

  /* =========================================================
     HELPER DATA FOR SUMMARY
  ========================================================= */

  const selectedHospitalDetails = hospitals.find(
    (hospital) => hospital.id === selectedHospital
  );

  const selectedDepartmentDetails = departments.find(
    (department) => department.id === selectedDepartment
  );

  const selectedDoctorDetails = doctors.find(
    (doctor) => doctor.id === selectedDoctor
  );

  const selectedTimeDetails = timeSlots.find(
    (slot) => slot.value === appointmentTime
  );

  const completedSteps = [
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    appointmentDate && appointmentTime,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Appointment booking
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Book your OPD visit
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
                Choose your hospital, department, doctor and preferred
                appointment time.
              </p>

            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">

              <div className="flex items-center justify-between gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                    Booking progress
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {completedSteps} / 4
                  </p>
                </div>

                <div className="h-10 w-10 rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* =================================================
              BOOKING FORM
          ================================================== */}

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

            {/* Error */}
            {error && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]">

                <span className="text-lg">
                  ⚠️
                </span>

                <p className="leading-6">
                  {error}
                </p>

              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-[var(--success)]/30 bg-[var(--success-soft)] p-4 text-sm text-[var(--success)]">

                <span className="text-lg">
                  ✓
                </span>

                <div>
                  <p className="font-bold">
                    Booking confirmed
                  </p>

                  <p className="mt-1">
                    {success}
                  </p>
                </div>

              </div>
            )}


            {/* =================================================
                STEP 1 — HOSPITAL
            ================================================== */}

            <div>

              <div className="flex items-start gap-4">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-bold text-[var(--background)]">
                  1
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                    Step 1
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Choose a hospital
                  </h2>

                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    Select where you want your OPD consultation.
                  </p>
                </div>

              </div>


              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold">
                  Hospital
                </label>

                <select
                  value={selectedHospital}
                  onChange={(event) =>
                    setSelectedHospital(event.target.value)
                  }
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm outline-none focus:border-[var(--primary)]"
                >

                  <option value="">
                    {loadingHospitals
                      ? "Loading hospitals..."
                      : "Select a hospital"}
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

            </div>


            <div className="my-8 border-t border-[var(--border)]" />


            {/* =================================================
                STEP 2 — DEPARTMENT
            ================================================== */}

            <div>

              <div className="flex items-start gap-4">

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    selectedHospital
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--surface-soft)] text-[var(--foreground-muted)]"
                  }`}
                >
                  2
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                    Step 2
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Choose a department
                  </h2>

                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    Select the department that matches your visit.
                  </p>
                </div>

              </div>


              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold">
                  Department
                </label>

                <select
                  value={selectedDepartment}
                  onChange={(event) =>
                    setSelectedDepartment(event.target.value)
                  }
                  disabled={!selectedHospital || loadingDepartments}
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm outline-none focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <option value="">
                    {loadingDepartments
                      ? "Loading departments..."
                      : !selectedHospital
                      ? "Select a hospital first"
                      : "Select a department"}
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

            </div>


            <div className="my-8 border-t border-[var(--border)]" />


            {/* =================================================
                STEP 3 — DOCTOR
            ================================================== */}

            <div>

              <div className="flex items-start gap-4">

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    selectedDepartment
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--surface-soft)] text-[var(--foreground-muted)]"
                  }`}
                >
                  3
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                    Step 3
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Choose your doctor
                  </h2>

                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    Select a doctor from the available specialists.
                  </p>
                </div>

              </div>


              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold">
                  Doctor
                </label>

                <select
                  value={selectedDoctor}
                  onChange={(event) =>
                    setSelectedDoctor(event.target.value)
                  }
                  disabled={!selectedDepartment || loadingDoctors}
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm outline-none focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <option value="">
                    {loadingDoctors
                      ? "Loading doctors..."
                      : !selectedDepartment
                      ? "Select a department first"
                      : "Select a doctor"}
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


              {/* Selected doctor information */}
              {selectedDoctorDetails && (
                <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-5">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
                      {selectedDoctorDetails.name
                        .split(" ")
                        .map((part) => part.charAt(0))
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">

                      <p className="font-bold">
                        {selectedDoctorDetails.name}
                      </p>

                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {selectedDoctorDetails.specialization}
                      </p>

                      {selectedDoctorDetails.qualification && (
                        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                          {selectedDoctorDetails.qualification}
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">

                    {selectedDoctorDetails.experience_years !== null && (
                      <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                        {selectedDoctorDetails.experience_years} years experience
                      </span>
                    )}

                    {selectedDoctorDetails.consultation_fee !== null && (
                      <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                        Consultation ₹
                        {selectedDoctorDetails.consultation_fee}
                      </span>
                    )}

                  </div>

                </div>
              )}

            </div>


            <div className="my-8 border-t border-[var(--border)]" />


            {/* =================================================
                STEP 4 — DATE & TIME
            ================================================== */}

            <div>

              <div className="flex items-start gap-4">

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    selectedDoctor
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--surface-soft)] text-[var(--foreground-muted)]"
                  }`}
                >
                  4
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                    Step 4
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Pick a date and time
                  </h2>

                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    Choose an available appointment slot.
                  </p>
                </div>

              </div>


              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                {/* Date */}
                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Appointment Date
                  </label>

                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(event) =>
                      setAppointmentDate(event.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    disabled={!selectedDoctor}
                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm outline-none focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>


                {/* Time */}
                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Appointment Time
                  </label>

                  <select
                    value={appointmentTime}
                    onChange={(event) =>
                      setAppointmentTime(event.target.value)
                    }
                    disabled={!selectedDoctor || !appointmentDate}
                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-sm outline-none focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <option value="">
                      {!selectedDoctor || !appointmentDate
                        ? "Select doctor and date first"
                        : "Select an available time"}
                    </option>

                    {timeSlots.map((slot) => {
                      const isBooked = bookedTimes.some(
                        (time) =>
                          time?.slice(0, 5) === slot.value
                      );

                      return (
                        <option
                          key={slot.value}
                          value={slot.value}
                          disabled={isBooked}
                        >
                          {slot.label}
                          {isBooked ? " — Booked" : ""}
                        </option>
                      );
                    })}

                  </select>

                </div>

              </div>


              {/* Availability information */}
              {selectedDoctor && appointmentDate && (
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                      Available
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
                      Booked
                    </div>

                    <p className="text-xs text-[var(--foreground-muted)]">
                      {bookedTimes.length} slot
                      {bookedTimes.length === 1 ? "" : "s"} already booked
                    </p>

                  </div>

                </div>
              )}

            </div>


            {/* =================================================
                CONFIRM
            ================================================== */}

            <div className="mt-8">

              <button
                type="button"
                onClick={handleBooking}
                disabled={
                  booking ||
                  !selectedHospital ||
                  !selectedDepartment ||
                  !selectedDoctor ||
                  !appointmentDate ||
                  !appointmentTime
                }
                className="w-full rounded-2xl bg-[var(--foreground)] px-6 py-4 font-bold text-[var(--background)] shadow-sm hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {booking
                  ? "Booking your appointment..."
                  : "Confirm OPD Booking →"}
              </button>

              <p className="mt-3 text-center text-xs text-[var(--foreground-muted)]">
                Please review your appointment details before confirming.
              </p>

            </div>

          </section>


          {/* =================================================
              BOOKING SUMMARY
          ================================================== */}

          <aside className="lg:sticky lg:top-24 lg:self-start">

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">

              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                Appointment summary
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Review your booking
              </h2>

              <div className="mt-6 space-y-4">

                {/* Hospital */}
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                    Hospital
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedHospitalDetails?.name || "Not selected"}
                  </p>

                  {selectedHospitalDetails?.city && (
                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {selectedHospitalDetails.city}
                      {selectedHospitalDetails.state
                        ? `, ${selectedHospitalDetails.state}`
                        : ""}
                    </p>
                  )}

                </div>


                {/* Department */}
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                    Department
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedDepartmentDetails?.name || "Not selected"}
                  </p>

                </div>


                {/* Doctor */}
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                    Doctor
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedDoctorDetails?.name || "Not selected"}
                  </p>

                  {selectedDoctorDetails?.specialization && (
                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {selectedDoctorDetails.specialization}
                    </p>
                  )}

                </div>


                {/* Date + time */}
                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                      Date
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {appointmentDate || "Not selected"}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-[var(--surface-soft)] p-4">

                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                      Time
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {selectedTimeDetails?.label || "Not selected"}
                    </p>

                  </div>

                </div>

              </div>


              {/* Helpful note */}
              <div className="mt-5 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-4">

                <div className="flex gap-3">

                  <span className="text-lg">
                    💡
                  </span>

                  <p className="text-sm leading-6 text-[var(--foreground-secondary)]">
                    Your token number will be generated automatically after
                    the appointment is confirmed.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>


        {/* Bottom note */}
        <div className="mt-8 text-center">

          <p className="text-xs text-[var(--foreground-muted)]">
            MediFlow • Your appointment journey, organized.
          </p>

        </div>

      </div>

    </main>
  );
}