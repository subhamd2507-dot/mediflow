export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden">

        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-[var(--accent-soft)] opacity-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">

          {/* Hero text */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
              Healthcare that starts before the consultation
            </div>

            <h2 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Prepare your care.
              <span className="mt-2 block text-[var(--primary)]">
                Simplify every visit.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--foreground-secondary)] sm:text-lg">
              MediFlow helps patients organize their case, book OPD
              appointments, follow their queue and keep their medical
              information connected in one place.
            </p>

            {/* Hero actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <a
                href="/book-opd"
                className="mf-btn mf-btn-primary"
              >
                Book an OPD
                <span>→</span>
              </a>

              <a
                href="/register"
                className="mf-btn mf-btn-secondary"
              >
                Start Your Journey
              </a>

            </div>

            {/* Trust-style points */}
            <div className="mt-8 grid max-w-xl gap-3 text-sm text-[var(--foreground-muted)] sm:grid-cols-3">

              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--success-soft)] text-sm">
                  ✓
                </span>
                Simple to use
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm">
                  ✓
                </span>
                Patient focused
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm">
                  ✓
                </span>
                Doctor friendly
              </div>

            </div>

          </div>


          {/* Hero visual */}
          <div className="relative">

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl sm:p-5">

              {/* Fake application header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                    Patient workspace
                  </p>

                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                    Your care at a glance
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)]">
                  👤
                </div>
              </div>

              {/* Case card */}
              <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-5">
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                      Case status
                    </p>

                    <h3 className="mt-2 text-lg font-bold">
                      Ready for consultation
                    </h3>

                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      Your information is organized for the next step.
                    </p>
                  </div>

                  <div className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)]">
                    Ready
                  </div>

                </div>

                {/* Progress */}
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-[var(--foreground-muted)]">
                      Journey progress
                    </span>

                    <span className="font-semibold text-[var(--foreground-secondary)]">
                      4 / 5
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                    <div className="h-full w-4/5 rounded-full bg-[var(--primary)]" />
                  </div>
                </div>
              </div>

              {/* Mini cards */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                      🎫
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Appointment
                      </p>

                      <p className="font-bold">
                        Token #08
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                      📋
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Medical history
                      </p>

                      <p className="font-bold">
                        Organized
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom message */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--warning-soft)]">
                  💡
                </div>

                <p className="text-sm leading-6 text-[var(--foreground-secondary)]">
                  Keep your information ready before you meet your doctor.
                </p>
              </div>

            </div>

            {/* Floating accent */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg sm:block">
              <p className="text-xs text-[var(--foreground-muted)]">
                Designed for
              </p>

              <p className="mt-1 font-bold text-[var(--primary)]">
                Patients + Doctors
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          FEATURE INTRO
      ====================================================== */}
      <section
        id="features"
        className="border-y border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">

          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Why MediFlow
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything feels connected.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
              Instead of making patients jump between disconnected steps,
              MediFlow brings the important parts of the OPD journey together.
            </p>
          </div>


          <div className="mt-10 grid gap-5 lg:grid-cols-3">

            {/* Feature 1 */}
            <div className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                🩺
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Prepare your case
              </h3>

              <p className="mt-3 leading-7 text-[var(--foreground-secondary)]">
                Give patients a clearer way to share what they are
                experiencing before the consultation begins.
              </p>

              <div className="mt-6 text-sm font-semibold text-[var(--primary)]">
                Patient-first intake →
              </div>

            </div>


            {/* Feature 2 */}
            <div className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-xl">
                📄
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Keep records together
              </h3>

              <p className="mt-3 leading-7 text-[var(--foreground-secondary)]">
                Prescriptions, consultations and previous medical information
                can stay organized around the patient's journey.
              </p>

              <div className="mt-6 text-sm font-semibold text-[var(--primary)]">
                One connected history →
              </div>

            </div>


            {/* Feature 3 */}
            <div className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-xl">
                👨‍⚕️
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Help doctors work faster
              </h3>

              <p className="mt-3 leading-7 text-[var(--foreground-secondary)]">
                Give doctors structured information they can review before
                moving into the consultation workflow.
              </p>

              <div className="mt-6 text-sm font-semibold text-[var(--primary)]">
                Doctor-ready information →
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20"
      >

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            How MediFlow works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A simpler healthcare journey.
          </h2>

          <p className="mt-4 leading-7 text-[var(--foreground-secondary)]">
            From starting a case to completing a consultation,
            each step has a clear purpose.
          </p>

        </div>


        <div className="mt-12 grid gap-6 md:grid-cols-5">

          {[
            {
              number: "01",
              title: "Start",
              text: "Create or access your patient journey.",
            },
            {
              number: "02",
              title: "Share",
              text: "Tell MediFlow what brings you in.",
            },
            {
              number: "03",
              title: "Organize",
              text: "Keep your important information connected.",
            },
            {
              number: "04",
              title: "Consult",
              text: "Move into the doctor consultation workflow.",
            },
            {
              number: "05",
              title: "Remember",
              text: "Keep the visit available for future reference.",
            },
          ].map((step) => (
            <div key={step.number} className="relative">

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-bold text-[var(--background)]">
                  {step.number}
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                  {step.text}
                </p>

              </div>

            </div>
          ))}

        </div>

      </section>


      {/* =====================================================
          FOR USERS
      ====================================================== */}
      <section
        id="for-users"
        className="border-y border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Patients */}
            <div className="rounded-3xl bg-[var(--primary-soft)] p-7 sm:p-9">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-xl shadow-sm">
                👤
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                For Patients
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Less confusion before your visit.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-[var(--foreground-secondary)]">
                Start your case, book an OPD appointment, follow your token,
                review your appointments and keep your medical history organized.
              </p>

              <a
                href="/register"
                className="mf-btn mf-btn-aurora mt-7"
              >
                Create Patient Account
                <span className="ml-2">→</span>
              </a>

            </div>


            {/* Doctors */}
            <div className="rounded-3xl bg-[var(--surface-soft)] p-7 sm:p-9">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-xl shadow-sm">
                👨‍⚕️
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                For Doctors
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Clear information before consultation.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-[var(--foreground-secondary)]">
                Manage today's queue, call patients, review previous
                information and record consultation details in one workflow.
              </p>

              <div className="mt-7 inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold">
                Doctor workspace
                <span className="ml-2 text-[var(--primary)]">→</span>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          HIGHLIGHT / CASE TAKING
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">

        <div className="overflow-hidden rounded-[2rem] bg-[var(--foreground)] px-7 py-10 text-[var(--background)] sm:px-10 lg:px-14 lg:py-14">

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">

            <div className="max-w-3xl">

              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]">
                The next step for MediFlow
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Start with the patient's story.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 opacity-75">
                MediFlow is designed to evolve from appointment management
                into a patient-first case-taking experience where information
                is prepared before consultation.
              </p>

            </div>

            <a
              href="/register"
              className="mf-btn mf-btn-aurora"
            >
              Get Started
              <span className="ml-2">→</span>
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 lg:py-20">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            Begin with MediFlow
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your healthcare journey, organized.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[var(--foreground-secondary)]">
            Start your account and explore a simpler way to manage
            appointments, information and consultations.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <a
              href="/register"
              className="mf-btn mf-btn-aurora"
            >
              Create Account
            </a>

            <a
              href="/book-opd"
              className="mf-btn mf-btn-secondary"
            >
              Book OPD
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface-soft)]">

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">

          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">

            {/* Brand */}
            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                  🩺
                </div>

                <div>
                  <h3 className="font-bold">
                    MediFlow
                  </h3>

                  <p className="text-xs text-[var(--foreground-muted)]">
                    Digital Healthcare Platform
                  </p>
                </div>

              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-[var(--foreground-secondary)]">
                A healthcare workflow designed to connect patient information,
                OPD appointments, queue management and consultation records.
              </p>

            </div>


            {/* Product */}
            <div>

              <p className="text-sm font-bold">
                Product
              </p>

              <div className="mt-4 space-y-3 text-sm text-[var(--foreground-muted)]">

                <a
                  href="/book-opd"
                  className="block hover:text-[var(--primary)]"
                >
                  Book OPD
                </a>

                <a
                  href="/login"
                  className="block hover:text-[var(--primary)]"
                >
                  Login
                </a>

                <a
                  href="/register"
                  className="block hover:text-[var(--primary)]"
                >
                  Create Account
                </a>

              </div>

            </div>


            {/* Navigation */}
            <div>

              <p className="text-sm font-bold">
                Explore
              </p>

              <div className="mt-4 space-y-3 text-sm text-[var(--foreground-muted)]">

                <a
                  href="#features"
                  className="block hover:text-[var(--primary)]"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="block hover:text-[var(--primary)]"
                >
                  How It Works
                </a>

                <a
                  href="#for-users"
                  className="block hover:text-[var(--primary)]"
                >
                  Patients & Doctors
                </a>

              </div>

            </div>

          </div>


          <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between">

            <p>
              MediFlow
            </p>

            <p>
              Prototype for Smart India Hackathon
            </p>

          </div>

        </div>

