export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="skeleton h-12 w-12 rounded-full" />
        <div className="skeleton h-3 w-40 rounded-full" />
      </div>
    </main>
  );
}
