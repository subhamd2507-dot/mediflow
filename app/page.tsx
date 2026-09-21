export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =========================
          NAVIGATION BAR
      ========================== */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              MediFlow
            </h1>

            <p className="text-xs text-slate-500">
              Smart Healthcare Platform
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">

            <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Login
            </button>

            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Get Started
            </button>

          </div>

        </div>
      </nav>


      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="max-w-4xl">

          {/* Small badge */}
          <div className="mb-6 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Smart OPD • Medical Records • Care Navigation
          </div>

          {/* Main heading */}
          <h2 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Healthcare without
            <span className="text-blue-600">
              {" "}unnecessary waiting.
            </span>
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Book your OPD appointment, track your queue,
            keep your medical history organized and navigate
            your healthcare journey from one platform.
          </p>

          {/* Main buttons */}
          <div className="mt-8 flex flex-wrap gap-4">

            <button className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700">
              Book OPD
            </button>

            <button className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-100">
              Explore Specialists
            </button>

          </div>

        </div>

      </section>


      {/* =========================
          MAIN FEATURES
      ========================== */}
      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">

          {/* Feature 1 */}
          <div className="rounded-2xl border border-slate-200 p-7 transition hover:shadow-md">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🕐
            </div>

            <h3 className="text-xl font-bold">
              Less Waiting
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Book your OPD before reaching the hospital and
              track your token and estimated waiting time.
            </p>

          </div>


          {/* Feature 2 */}
          <div className="rounded-2xl border border-slate-200 p-7 transition hover:shadow-md">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              📋
            </div>

            <h3 className="text-xl font-bold">
              Better Records
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Keep prescriptions, consultations, reports and
              medical history organized in one place.
            </p>

          </div>


          {/* Feature 3 */}
          <div className="rounded-2xl border border-slate-200 p-7 transition hover:shadow-md">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
              🧭
            </div>

            <h3 className="text-xl font-bold">
              Better Care
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Discover relevant specialists and get helpful
              healthcare-navigation information.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================== */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mx-auto max-w-2xl text-center">

          <p className="font-semibold text-blue-600">
            HOW MEDIFLOW WORKS
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Your complete OPD journey
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            From booking your appointment to storing your
            medical history, everything stays connected.
          </p>

        </div>


        <div className="mt-14 grid gap-8 md:grid-cols-4">

          {/* Step 1 */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              1
            </div>

            <h3 className="mt-5 text-lg font-bold">
              Book
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select your hospital, department, doctor and
              available OPD time.
            </p>

          </div>


          {/* Step 2 */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              2
            </div>

            <h3 className="mt-5 text-lg font-bold">
              Track
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              See your token position and estimated waiting
              time before reaching the hospital.
            </p>

          </div>


          {/* Step 3 */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              3
            </div>

            <h3 className="mt-5 text-lg font-bold">
              Consult
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your doctor can review authorized previous
              records and add today's consultation.
            </p>

          </div>


          {/* Step 4 */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              4
            </div>

            <h3 className="mt-5 text-lg font-bold">
              Remember
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your prescription and medical history remain
              organized for future visits.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          CALL TO ACTION
      ========================== */}
      <section className="bg-blue-600">

        <div className="mx-auto max-w-7xl px-6 py-16 text-center">

          <h2 className="text-3xl font-bold text-white">
            Your healthcare journey, organized.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Spend less time waiting and more time focusing
            on your health.
          </p>

          <button className="mt-7 rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-700 transition hover:bg-blue-50">
            Get Started
          </button>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center">

          <h3 className="font-bold text-blue-700">
            MediFlow
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Less waiting. Better records. Better care.
          </p>

          <p className="mt-4 text-xs text-slate-400">
            Prototype for Smart India Hackathon
          </p>

        </div>

      </footer>

    </main>
  );
}