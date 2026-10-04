"use client";

import { useEffect, useRef, useState } from "react";
import HealthcareOrb from "@/components/HealthcareOrb";


function Reveal({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0px) scale(1)"
          : "translateY(70px) scale(0.96)",
        filter: visible
          ? "blur(0px)"
          : "blur(6px)",
        transition:
          "opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), filter 0.9s ease",
        willChange: "opacity, transform, filter",
...style,
      }}
    >
      {children}
    </div>
  );
}
const problems = [
  {
    icon: "📝",
    title: "Repeated history taking",
    text: "Patients often repeat the same information during different stages of care.",
  },
  {
    icon: "📄",
    title: "Fragmented documents",
    text: "Prescriptions, reports and previous records can be difficult to organize.",
  },
  {
    icon: "🌐",
    title: "Communication barriers",
    text: "Patients may struggle to explain symptoms clearly or in the language they prefer.",
  },
  {
    icon: "⏱️",
    title: "Limited consultation time",
    text: "Doctors need useful patient information before the consultation begins.",
  },
];

const workflow = [
  {
    number: "01",
    icon: "🎙️",
    title: "Patient speaks",
    text: "The patient explains what they are experiencing using natural language.",
  },
  {
    number: "02",
    icon: "🧠",
    title: "MediFlow asks",
    text: "Guided questions collect the important parts of the patient's story.",
  },
  {
    number: "03",
    icon: "📋",
    title: "Case is structured",
    text: "Information is organized into a clear clinical history format.",
  },
  {
    number: "04",
    icon: "👨‍⚕️",
    title: "Doctor reviews",
    text: "The doctor checks, edits and verifies the prepared case.",
  },
];

export default function Home() {

    const [caseStep, setCaseStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCaseStep((previousStep) => (previousStep + 1) % 3);
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const historyProgress = String(3 + caseStep).padStart(2, "0");
  const progressWidth = `${((3 + caseStep) / 8) * 100}%`;
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.10]">
  <HealthcareOrb />
</div>
      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="mediflow-reveal relative isolate min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0 mediflow-grid-bg opacity-40" />

        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="pointer-events-none absolute right-[-180px] top-10 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="pointer-events-none absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[150px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-10 sm:px-6 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="relative z-20">
            <div className="mediflow-fade-up inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]" />
              Smart Patient Case-Taking
            </div>

            <h1 className="mediflow-hero-title mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
  <span className="mediflow-hero-line">
    The consultation
  </span>

  <span className="mediflow-hero-line mediflow-gradient-text">
    starts before
  </span>

  <span className="mediflow-hero-line">
    the doctor.
  </span>
</h1>

            <p className="mediflow-fade-up mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              MediFlow turns a patient&apos;s conversation into a structured,
              doctor-ready clinical history using guided questions, voice,
              touch and medical documents.
            </p>

            <div className="mediflow-fade-up mt-9 flex flex-col gap-3 sm:flex-row">
              <a
  href="/register"
  className="group rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-7 py-3.5 text-center text-sm font-bold shadow-[0_0_35px_rgba(59,130,246,0.30)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(139,92,246,0.38)]"
>
  Start Your Case
  <span className="ml-2 transition-all duration-300 group-hover:ml-3">
    →
  </span>
</a>

              <div className="mediflow-opd-button">
  <a
    href="/book-opd"
    className="block rounded-full bg-[#081321]/90 px-7 py-3.5 text-center text-sm font-semibold text-white/90 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-[#0b1428]"
  >
    Book OPD
  </a>
</div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              {[
                "Voice + Touch",
                "Structured History",
                "Doctor Verification",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/50 backdrop-blur"
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}

          <div className="relative flex min-h-[520px] items-center justify-center lg:min-h-[500px]">

            {/* Premium Hero atmosphere */}
<div className="pointer-events-none absolute inset-0">

  {/* Large ambient light */}
  <div className="mediflow-premium-aura mediflow-aura-cyan absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2" />

  {/* Orbit 01 */}
  <div className="mediflow-orbit-ring absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 sm:h-[400px] sm:w-[400px]" />

  {/* Orbit 02 */}
  <div className="mediflow-orbit-ring absolute left-1/2 top-1/2 h-[455px] w-[455px] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-[540px] sm:w-[540px]" />

  {/* Floating particles */}
  <span className="mediflow-particle absolute left-[14%] top-[28%]" />
  <span className="mediflow-particle absolute right-[12%] top-[22%]" />
  <span className="mediflow-particle absolute bottom-[22%] left-[18%]" />
  <span className="mediflow-particle absolute bottom-[18%] right-[18%]" />

</div>
            <div className="pointer-events-none absolute -right-12 top-1/2 z-30 hidden -translate-y-1/2 rounded-2xl border border-violet-300/15 bg-[#0b1020]/80 px-4 py-3 shadow-[0_15px_45px_rgba(139,92,246,0.14)] backdrop-blur-xl sm:block">
  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300/80">
    Case engine
  </p>

  <div className="mt-2 flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.75)]" />
    <span className="text-xs font-semibold text-white/75">
      Adapting
    </span>
  </div>
</div>

           <div className="mediflow-case-card mediflow-premium-glass mediflow-luminous-border mediflow-floating-ui mediflow-border-shimmer relative z-20 w-[min(92%,470px)] rounded-[30px] border border-white/[0.10] bg-[#080d1c]/80 p-4 shadow-[0_30px_90px_rgba(34,211,238,0.10)] backdrop-blur-2xl">
  {/* top highlight */}
  <div className="pointer-events-none absolute inset-x-10 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-cyan-300/70 to-violet-400/70" />

  {/* soft inner glow */}
  <div className="pointer-events-none absolute right-[-50px] top-[-50px] h-[150px] w-[150px] rounded-full bg-violet-500/[0.06] blur-[60px]" />

  <div className="relative">

    {/* PATIENT CASE HEADER */}
    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">

      <div>
        <div className="flex items-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />

          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Patient Case
          </p>

        </div>

        <p className="mt-1 text-sm font-bold text-white">
          Preparing your story...
        </p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
        🎙️
      </div>

    </div>


    {/* VOICE INTAKE */}
    <div className="relative mt-3 overflow-hidden rounded-[20px] border border-cyan-300/[0.10] bg-gradient-to-br from-cyan-400/[0.07] via-blue-500/[0.04] to-violet-500/[0.07] p-3.5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-500 shadow-[0_0_22px_rgba(34,211,238,0.24)]">
          <span className="text-base text-white">
            ✦
          </span>
        </div>

        <div>

          <p className="text-[11px] text-white/40">
            MediFlow is listening
          </p>

          <p className="mt-0.5 text-sm font-semibold text-white">
            Tell us what brings you here.
          </p>

        </div>

      </div>


      {/* WAVEFORM */}
      <div className="mt-3 flex h-9 items-end gap-1">

        {[16, 25, 10, 31, 19, 36, 22, 29, 15, 27, 20, 34].map(
          (height, index) => (
            <div
              key={index}
              className="flex-1 rounded-full bg-gradient-to-t from-cyan-400 via-blue-500 to-violet-400"
              style={{
                height: `${height}px`,
                animation: `mediflow-wave 1.2s ease-in-out ${index * 0.08}s infinite alternate`,
              }}
            />
          )
        )}

      </div>


      <div className="mt-2 flex items-center justify-between">

        <span className="text-[8px] font-semibold uppercase tracking-[0.15em] text-cyan-300/65">
          Voice intake
        </span>

        <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-white/35">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          Live
        </span>

      </div>

    </div>


    {/* STRUCTURED INFORMATION */}
    <div className="mt-3 grid grid-cols-2 gap-2.5">

      {/* CHIEF COMPLAINT */}
      <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] px-3.5 py-3">

        <div className="flex items-center justify-between">

          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/30">
            Chief complaint
          </p>

          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />

        </div>

        <p className="mt-1.5 text-sm font-semibold text-cyan-200">
          Noted
        </p>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">

          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />

        </div>

      </div>


      {/* HISTORY */}
      <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] px-3.5 py-3">

        <div className="flex items-center justify-between">

          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/30">
            History
          </p>

          <span className="h-1.5 w-1.5 rounded-full bg-violet-300/80" />

        </div>

        <p className="mt-1.5 text-sm font-semibold text-violet-200">
          Building...
        </p>

        <div className="mt-2 flex gap-1">

          <span className="h-1 flex-1 rounded-full bg-violet-400/70" />

          <span className="h-1 flex-1 rounded-full bg-violet-400/40" />

          <span className="h-1 flex-1 rounded-full bg-white/[0.06]" />

        </div>

      </div>

    </div>


    {/* ADAPTIVE CASE ENGINE */}
    <div className="mt-3 flex items-center gap-3 rounded-[18px] border border-violet-300/[0.08] bg-gradient-to-r from-cyan-400/[0.06] via-blue-500/[0.04] to-violet-500/[0.08] px-3.5 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-300/15 bg-violet-400/[0.08]">
        🧠
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-300/70">
          Adaptive case engine
        </p>

        <p className="mt-0.5 text-[10px] leading-4 text-white/50">
          Questions change based on the patient&apos;s answers.
        </p>

      </div>

      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.75)]" />

    </div>

  </div>

</div>
            


          </div>
        </div>
      </section>

      {/* =====================================================
          PROBLEM
      ====================================================== */}

      {/* =====================================================
    PROBLEM
====================================================== */}

{/* =====================================================
    PROBLEM
====================================================== */}

<section
  id="problem"
  className="relative overflow-hidden border-y border-white/10 bg-[#080d1c] py-28"
>
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[-180px] top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />
    <div className="absolute right-[-180px] bottom-0 h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[150px]" />
  </div>

  <div className="relative">

    {/* Section heading */}
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal>
        <div className="max-w-3xl">

          <span className="inline-flex rounded-full border border-pink-400/20 bg-pink-400/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pink-300">
            The problem
          </span>

          <h2 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Healthcare information
            <br />
            <span className="mediflow-gradient-text">
              should not be scattered.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
            A patient&apos;s story can contain important details, but those
            details are often collected manually, repeated or stored across
            disconnected documents.
          </p>

        </div>
      </Reveal>
    </div>

    {/* Moving problem cards */}
    <div className="mediflow-problem-marquee mt-14">

      <div className="mediflow-problem-track">

        {[...problems, ...problems].map((problem, index) => (
          <div
            key={`${problem.title}-${index}`}
            className="mediflow-problem-card group"
          >
            <div className="flex h-full min-h-[190px] flex-col rounded-[22px] border border-white/[0.08] bg-[#0a1120]/75 p-5 backdrop-blur-xl transition duration-500 group-hover:-translate-y-1 group-hover:bg-[#0b1424]/90 group-hover:border-white/15 group-hover:shadow-[0_16px_40px_rgba(59,130,246,0.08)] sm:p-6">

              <div className="flex items-center justify-between">

                <div className="mediflow-problem-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition duration-300 group-hover:scale-105 group-hover:rotate-3">
  {index % problems.length === 0 && (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )}

  {index % problems.length === 1 && (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4M9 11h6M9 15h6M9 19h4" />
    </svg>
  )}

  {index % problems.length === 2 && (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v6A3.5 3.5 0 0 1 15.5 16H12l-4 4v-4.5A3.5 3.5 0 0 1 5 12.5z" />
      <path d="M9 9h6M9 12h4" />
    </svg>
  )}

  {index % problems.length === 3 && (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </svg>
  )}
</div>

                <span className="text-xs font-black tracking-[0.2em] text-white/20">
                  {String((index % problems.length) + 1).padStart(2, "0")}
                </span>

              </div>

              <div className="mt-auto">

                <h3 className="text-lg font-bold text-white sm:text-xl">
                  {problem.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-white/45">
                  {problem.text}
                </p>

                <div className="mt-5 h-px w-full bg-gradient-to-r from-cyan-400/20 via-blue-500/10 to-transparent" />

              </div>

            </div>
          </div>
        ))}

      </div>

    </div>

  </div>
</section>

      {/* =====================================================
          WORKFLOW
      ====================================================== */}

      {/* =====================================================
    WORKFLOW
====================================================== */}

<section
  id="workflow"
  className="relative overflow-hidden bg-[#050816] py-24 sm:py-28"
>
  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.07] blur-[150px]" />

  <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

    {/* Heading */}
    <Reveal className="text-center">
      <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
        One simple journey
      </span>

      <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
        From patient conversation
        <br />
        <span className="mediflow-gradient-text">
          to clinical clarity.
        </span>
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
        MediFlow prepares the patient&apos;s story before the consultation
        while keeping the doctor in control.
      </p>
    </Reveal>

    {/* Connected journey */}
    <div className="relative mt-16 lg:mt-20">

      {/* Journey line */}
      <div className="pointer-events-none absolute left-[9%] right-[9%] top-[42px] hidden h-px lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/35 to-violet-400/10" />

        <div className="mediflow-workflow-pulse absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

        {workflow.map((item, index) => (
          <Reveal
            key={item.number}
            className="mediflow-workflow-stage"
          >
            <div className="group relative h-full">

              {/* Stage marker */}
              <div
                className={[
                  "relative z-20 flex h-[84px] w-full items-center",
                  "rounded-full border border-white/[0.08]",
                  "bg-[#08111f]/90 px-4 backdrop-blur-xl",
                  "transition duration-500",
                  "group-hover:-translate-y-1",
                  "group-hover:border-cyan-300/20",
                  "group-hover:shadow-[0_18px_45px_rgba(59,130,246,0.08)]",
                ].join(" ")}
              >

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">

                  {index === 0 && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5 text-cyan-300"
                    >
                      <rect x="9" y="3" width="6" height="12" rx="3" />
                      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
                    </svg>
                  )}

                  {index === 1 && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5 text-blue-300"
                    >
                      <circle cx="12" cy="12" r="7" />
                      <path d="M9 12h6M12 9v6" />
                      <path d="M5 5l-1-1M19 5l1-1M5 19l-1 1M19 19l1 1" />
                    </svg>
                  )}

                  {index === 2 && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5 text-violet-300"
                    >
                      <rect x="5" y="4" width="14" height="17" rx="2" />
                      <path d="M9 4V3h6v1M8 9h8M8 13h8M8 17h5" />
                    </svg>
                  )}

                  {index === 3 && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5 text-teal-300"
                    >
                      <circle cx="12" cy="8" r="3" />
                      <path d="M5 21a7 7 0 0 1 14 0" />
                      <path d="M17 4v5M14.5 6.5h5" />
                    </svg>
                  )}

                </div>

                <div className="ml-4 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                    Stage {item.number}
                  </p>

                  <h3 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
                    {item.title}
                  </h3>
                </div>

                <span className="ml-auto text-xs font-black tracking-[0.2em] text-white/15">
                  {item.number}
                </span>
              </div>

              {/* Description */}
              <div className="mt-4 px-2">
                <p className="text-sm leading-7 text-white/45">
                  {item.text}
                </p>
              </div>

            </div>
          </Reveal>
        ))}

      </div>
    </div>

  </div>
</section>
      {/* =====================================================
    AI CASE ENGINE
====================================================== */}

<section
  id="case-engine"
  className="relative overflow-hidden border-y border-white/10 bg-[#070b18] py-28"
>
  {/* Ambient color */}
  <div className="pointer-events-none absolute left-[-160px] top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.07] blur-[140px]" />

  <div className="pointer-events-none absolute right-[-180px] bottom-0 h-[520px] w-[520px] rounded-full bg-violet-500/[0.08] blur-[150px]" />

  <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

    <div className="grid items-center gap-14 lg:grid-cols-[0.82fr_1.18fr]">

      {/* LEFT */}
      <Reveal>
        <div className="max-w-xl">

          <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
            Adaptive case engine
          </span>

          <h2 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Not a static form.
            <br />
            <span className="mediflow-gradient-text">
              A conversation.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/50 sm:text-lg">
            MediFlow guides patients through complaint-specific questions
            instead of presenting a long medical form all at once.
          </p>

          {/* Conversation stages */}
          <div className="mt-10 space-y-3">

           <div className={`mediflow-case-step group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.04] ${
  caseStep === 0 ? "mediflow-case-step-active" : ""
}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-xs font-black text-cyan-300 ring-1 ring-cyan-300/10">
                01
              </div>

              <div>
                <p className="font-semibold text-white">
                  Chief complaint
                </p>

                <p className="mt-1 text-sm text-white/40">
                  What brings you to the hospital?
                </p>
              </div>
            </div>

            <div
  className={`mediflow-case-step group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition duration-300 hover:border-blue-300/20 hover:bg-white/[0.04] ${
    caseStep === 1 ? "mediflow-case-step-active" : ""
  }`}
>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/[0.08] text-xs font-black text-blue-300 ring-1 ring-blue-300/10">
                02
              </div>

              <div>
                <p className="font-semibold text-white">
                  History
                </p>

                <p className="mt-1 text-sm text-white/40">
                  When did it start? How has it changed?
                </p>
              </div>
            </div>

           <div
  className={`mediflow-case-step group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition duration-300 hover:border-violet-300/20 hover:bg-white/[0.04] ${
    caseStep === 2 ? "mediflow-case-step-active" : ""
  }`}
>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.08] text-xs font-black text-violet-300 ring-1 ring-violet-300/10">
                03
              </div>

              <div>
                <p className="font-semibold text-white">
                  Relevant details
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Questions adapt to previous answers.
                </p>
              </div>
            </div>

          </div>

          {/* Small product capabilities */}
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-300/10 bg-cyan-300/[0.04] px-3 py-1.5 text-xs font-semibold text-cyan-200/70">
              Voice-ready
            </span>

            <span className="rounded-full border border-blue-300/10 bg-blue-300/[0.04] px-3 py-1.5 text-xs font-semibold text-blue-200/70">
              Touch-friendly
            </span>

            <span className="rounded-full border border-violet-300/10 bg-violet-300/[0.04] px-3 py-1.5 text-xs font-semibold text-violet-200/70">
              Adaptive
            </span>
          </div>

        </div>
      </Reveal>


      {/* RIGHT — Live conversation */}
      <Reveal>
        <div className="relative">

          {/* Outer glow */}
          <div className="pointer-events-none absolute -inset-4 rounded-[34px] bg-gradient-to-r from-cyan-400/[0.06] via-blue-500/[0.04] to-violet-500/[0.07] blur-2xl" />

          <div className="mediflow-live-case relative rounded-[30px] border border-white/[0.10] bg-[#090f1e]/90 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#070c18]">

              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Live case
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="mediflow-case-status-dot h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
                    <p className="font-bold text-white">
                      Knee pain
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-emerald-300">
                  ACTIVE
                </span>

              </div>


              {/* Conversation */}
              <div className="space-y-5 p-5 sm:p-6">

                {/* Patient message */}
                <div className="flex justify-end">
                  <div className="max-w-[86%] rounded-[20px] rounded-br-md bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-4 text-sm leading-6 text-white shadow-[0_12px_30px_rgba(59,130,246,0.16)]">
                    My knee has been hurting for three days.
                  </div>
                </div>


                {/* MediFlow message */}
                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300 ring-1 ring-cyan-300/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-4 w-4"
                    >
                      <path d="M12 3v18M5 8h14M5 16h14" />
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  </div>

                  <div className="max-w-[86%] rounded-[20px] rounded-bl-md border border-white/[0.08] bg-white/[0.035] px-5 py-4 text-sm leading-6 text-white/75">
                    I understand. Did the pain start after an injury,
                    accident or unusual physical activity?
                  </div>

                </div>


                {/* Answers */}
                <div className="grid grid-cols-2 gap-3">

                  <button className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-3 text-sm font-semibold text-cyan-200 transition duration-300 hover:border-cyan-300/30 hover:bg-cyan-300/[0.08]">
                    Yes
                  </button>

                  <button className="rounded-2xl border border-blue-300/15 bg-blue-300/[0.04] px-4 py-3 text-sm font-semibold text-blue-200 transition duration-300 hover:border-blue-300/30 hover:bg-blue-300/[0.08]">
                    No
                  </button>

                </div>


                {/* Adaptive indicator */}
                <div className="flex items-center gap-3 rounded-2xl border border-violet-300/10 bg-violet-300/[0.035] p-4">

                  <span className="relative flex h-3 w-3">
                   <span className="mediflow-case-adaptive-dot absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-40" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-400" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-white/70">
                      Question adapted from previous answer
                    </p>

                    <p className="mt-1 text-[11px] text-white/35">
                      MediFlow keeps the conversation focused.
                    </p>
                  </div>

                </div>

              </div>


              {/* Bottom progress */}
              <div className="border-t border-white/[0.08] px-5 py-4 sm:px-6">

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">
                  <span>History progress</span>
                  <span className="mediflow-case-progress-count">
  {historyProgress} / 08
</span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
  className="mediflow-case-progress h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
  style={{ width: progressWidth }}
/>
                </div>

              </div>

            </div>

          </div>

        </div>
      </Reveal>

    </div>
  </div>
</section>

      

      {/* =====================================================
          DOCTOR VIEW
      ====================================================== */}

      {/* =====================================================
    DOCTOR VERIFICATION WORKSTATION
====================================================== */}

<section
  id="doctor"
  className="relative overflow-hidden bg-[#050816] py-28"
>
  {/* Ambient clinical glow */}
  <div className="pointer-events-none absolute left-[-180px] top-24 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.05] blur-[140px]" />

  <div className="pointer-events-none absolute right-[-180px] bottom-0 h-[520px] w-[520px] rounded-full bg-violet-500/[0.06] blur-[150px]" />

  <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

    {/* SECTION HEADING */}
    <Reveal className="text-center">

      <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
        Doctor verification
      </span>

      <h2 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        AI prepares the case.
        <br />
        <span className="mediflow-gradient-text">
          The doctor stays in control.
        </span>
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
        MediFlow organizes the patient&apos;s information into a structured
        draft that the doctor can review, edit and verify.
      </p>

    </Reveal>


    {/* WORKSTATION */}
    <Reveal className="mt-16">

      <div className="mediflow-doctor-workstation relative overflow-hidden rounded-[32px] border border-white/[0.10] bg-[#090f1f]/90 shadow-2xl backdrop-blur-xl">

        {/* Top gradient line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* TOP BAR */}
        <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              Clinical review workstation
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Patient case
            </h3>
          </div>

          <div className="flex items-center gap-3">

            <span className="mediflow-doctor-draft-status inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Draft for review
            </span>

          </div>

        </div>


        {/* CASE FLOW */}
        <div className="border-b border-white/[0.08] px-5 py-5 sm:px-7">

          <div className="relative grid gap-3 sm:grid-cols-4">
            <div
  aria-hidden="true"
  className="mediflow-doctor-flow-line pointer-events-none absolute left-[10%] right-[10%] top-1/2 hidden h-px -translate-y-1/2 sm:block"
/>
            <div className="mediflow-doctor-flow-step rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-sm font-black text-cyan-300">
                  01
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Patient information
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Collected
                  </p>
                </div>

              </div>

            </div>


            <div className="mediflow-doctor-flow-step rounded-2xl border border-blue-300/15 bg-blue-300/[0.035] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/[0.08] text-sm font-black text-blue-300">
                  02
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Structured history
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Prepared
                  </p>
                </div>

              </div>

            </div>


            <div className="mediflow-doctor-flow-step rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/[0.08] text-sm font-black text-violet-300">
                  03
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Doctor review
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Current step
                  </p>
                </div>

              </div>

            </div>


            <div className="mediflow-doctor-flow-step rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/[0.07] text-sm font-black text-violet-300">
  04
</div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Verification
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Pending approval
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* WORKSPACE */}
        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">

          {/* PATIENT SNAPSHOT */}
          <div className="border-b border-white/[0.08] p-5 sm:p-7 lg:border-b-0 lg:border-r">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  Patient
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  Patient Case
                </h3>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/[0.10] to-violet-400/[0.10] text-sm ring-1 ring-white/[0.08]">
                ✦
              </div>

            </div>


            <div className="mt-7 space-y-3">

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                  Chief complaint
                </p>

                <p className="mt-2 text-sm font-semibold text-white/85">
                  Knee pain
                </p>
              </div>


              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                    Duration
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white/75">
                    3 days
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                    Language
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white/75">
                    Hindi
                  </p>
                </div>

              </div>


              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                      Documents
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white/75">
                      2 uploaded
                    </p>
                  </div>

                  <span className="rounded-full border border-blue-300/15 bg-blue-300/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-200">
                    Document
                  </span>

                </div>

              </div>

            </div>


            <div className="mt-7 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-4">

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                Patient source
              </p>

              <p className="mt-2 text-xs leading-6 text-white/45">
                Information collected from the patient conversation and
                uploaded medical documents.
              </p>

            </div>

          </div>


          {/* STRUCTURED SUMMARY */}
          <div className="p-5 sm:p-7">

            <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Structured summary
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  Clinical history draft
                </h3>

              </div>


              <div className="flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.035] px-3 py-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />

                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-200">
                  Doctor review required
                </span>

              </div>

            </div>


            {/* CASE FIELDS */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/[0.08] bg-[#050a17] p-4">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                    Presenting complaint
                  </p>

                  <span className="text-[9px] font-semibold text-cyan-300/70">
                    Patient response
                  </span>

                </div>

                <p className="mt-3 text-sm leading-6 text-white/80">
                  Knee pain for 3 days
                </p>

              </div>


              <div className="rounded-2xl border border-white/[0.08] bg-[#050a17] p-4">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                    History
                  </p>

                  <span className="text-[9px] font-semibold text-blue-300/70">
                    Patient response
                  </span>

                </div>

                <p className="mt-3 text-sm leading-6 text-white/80">
                  Started after physical activity
                </p>

              </div>


              <div className="rounded-2xl border border-white/[0.08] bg-[#050a17] p-4">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                    Past history
                  </p>

                  <span className="text-[9px] font-semibold text-white/30">
                    Not provided
                  </span>

                </div>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  No information provided
                </p>

              </div>


              <div className="rounded-2xl border border-white/[0.08] bg-[#050a17] p-4">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                    Medication
                  </p>

                  <span className="text-[9px] font-semibold text-white/30">
                    Patient response
                  </span>

                </div>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  No current medication reported
                </p>

              </div>


              <div className="rounded-2xl border border-blue-300/10 bg-blue-300/[0.025] p-4">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                    Documents
                  </p>

                  <span className="text-[9px] font-semibold text-blue-300">
                    Document
                  </span>

                </div>

                <p className="mt-3 text-sm leading-6 text-white/75">
                  Previous prescription detected
                </p>

              </div>


              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-4">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200/80">
                    Missing information
                  </p>

                  <span className="text-[9px] font-semibold text-amber-200">
                    Attention
                  </span>

                </div>

                <p className="mt-3 text-sm leading-6 text-amber-100/80">
                  Allergy history
                </p>

              </div>

            </div>


            {/* REVIEW NOTE */}
            <div className="mt-5 rounded-2xl border border-violet-300/10 bg-violet-300/[0.025] p-4">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300 ring-1 ring-violet-300/10">
                  ✦
                </div>

                <div>

                  <p className="text-xs font-semibold text-white/75">
                    Ready for physician review
                  </p>

                  <p className="mt-1 text-xs leading-6 text-white/40">
                    MediFlow prepares the draft. The physician can review,
                    edit or reject information before verification.
                  </p>

                </div>

              </div>

            </div>


            {/* ACTIONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                className="rounded-full border border-white/[0.10] bg-white/[0.035] px-6 py-3 text-sm font-semibold text-white/70 transition duration-300 hover:border-blue-300/25 hover:bg-white/[0.06] hover:text-white"
              >
                Edit Information
              </button>

              <button
                type="button"
                className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.20)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(99,102,241,0.30)]"
              >
                ✓ Verify Case
              </button>

            </div>

          </div>

        </div>


        {/* FOOTER NOTE */}
        <div className="border-t border-white/[0.08] px-5 py-4 sm:px-7">

          <div className="flex flex-col gap-2 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">

            <span>
              AI-generated draft · Physician verification required
            </span>

            <span className="text-cyan-300/60">
              MediFlow keeps the doctor in control
            </span>

          </div>

        </div>

      </div>

    </Reveal>

  </div>
</section>

      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="relative overflow-hidden border-y border-white/10 bg-[#080d1c] py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <span className="rounded-full border border-purple-400/20 bg-purple-400/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
              Built for the real world
            </span>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
              Small interface.
              <br />
              <span className="mediflow-gradient-text">
                Big clinical workflow.
              </span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🎙️",
                title: "Voice-first intake",
                text: "Patients can explain their problem naturally instead of filling a long form.",
              },
              {
                icon: "👆",
                title: "Touch-friendly",
                text: "Simple choices help patients who prefer guided interaction.",
              },
              {
                icon: "🌐",
                title: "Multilingual ready",
                text: "The architecture can support Indian-language patient intake.",
              },
              {
                icon: "📄",
                title: "Document intelligence",
                text: "Previous prescriptions and reports can become part of the patient timeline.",
              },
              {
                icon: "⚠️",
                title: "Red-flag support",
                text: "Simple rule-based warnings can highlight information requiring attention.",
              },
              {
                icon: "🛡️",
                title: "Doctor verification",
                text: "Clinical information remains reviewable and editable by the doctor.",
              },
            ].map((feature) => (
              <Reveal key={feature.title}>
                <div className="mediflow-card-hover group h-full rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/10 to-purple-500/10 text-xl ring-1 ring-white/10 transition duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>

                  <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-white/45">
                    {feature.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#050816] py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.06] via-purple-500/[0.08] to-pink-500/[0.06]" />

        <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.015] px-7 py-14 shadow-2xl backdrop-blur-xl sm:px-12">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                The future of patient intake
              </span>

              <h2 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl">
                Start with the
                <br />
                <span className="mediflow-gradient-text">
                  patient&apos;s story.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/50">
                MediFlow prepares meaningful patient information before the
                consultation, helping create a more connected care journey.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 px-8 py-3.5 text-sm font-bold shadow-[0_0_35px_rgba(59,130,246,0.3)] transition hover:-translate-y-1"
                >
                  Create Patient Account →
                </a>

                <a
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white/70 transition hover:bg-white/10"
                >
                  Login
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-white/10 bg-[#03050c]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500">
              🩺
            </div>

            <div>
              <p className="text-sm font-bold">MediFlow</p>
              <p className="text-[10px] text-white/30">
                Intelligent Patient Case-Taking
              </p>
            </div>
          </div>

          <p className="text-xs text-white/30">
            Prototype for Smart India Hackathon
          </p>
        </div>
      </footer>
    </main>
  );
}