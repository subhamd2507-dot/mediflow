import { createClient } from "@/lib/supabase/server";

export default async function TestDatabasePage() {
  const supabase = await createClient();

  const { data: hospitals,error } = await supabase
    .from("hospitals")
    .select("*");

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold text-slate-900">
          MediFlow Database Test
        </h1>

        <p className="mt-2 text-slate-600">
          Testing the connection between Next.js and Supabase.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-bold text-red-700">
              Database Error
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error.message}
            </p>
          </div>
        )}

        {!error && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Hospitals Found
            </h2>

            {hospitals && hospitals.length > 0 ? (
              <div className="mt-5 space-y-4">

                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <h3 className="text-lg font-bold text-blue-700">
                      {hospital.name}
                    </h3>

                    <p className="mt-1 text-slate-600">
                      {hospital.address}
                    </p>

                    <p className="text-slate-600">
                      {hospital.city}, {hospital.state}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Phone: {hospital.phone}
                    </p>
                  </div>
                ))}

              </div>
            ) : (
              <p className="mt-4 text-slate-600">
                No hospitals found.
              </p>
            )}

          </div>
        )}

      </div>
    </main>
  );
}