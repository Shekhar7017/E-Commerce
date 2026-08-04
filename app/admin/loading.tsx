export default function AdminLoading() {
  return (
    <div>
      <div className="skeleton h-9 w-48 rounded-md mb-10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-lg" />
        ))}
      </div>
      <div className="skeleton h-72 w-full rounded-lg" />
    </div>
  );
}
