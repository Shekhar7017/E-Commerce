export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="skeleton h-3 w-64 rounded-full mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="skeleton aspect-[4/5] w-full rounded-lg" />
          <div className="mt-4 grid grid-cols-5 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-md" />
            ))}
          </div>
        </div>

        <div>
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-9 w-3/4 rounded-md mt-3" />
          <div className="skeleton h-4 w-32 rounded-full mt-4" />
          <div className="skeleton h-7 w-40 rounded-md mt-6" />
          <div className="skeleton h-24 w-full rounded-md mt-6" />
          <div className="skeleton h-12 w-full rounded-full mt-8" />
        </div>
      </div>
    </main>
  );
}
