import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="max-w-md">
      <h2 className="font-display text-2xl mb-6">Profile Details</h2>
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest2 text-ink/50 dark:text-ivory/50 mb-1">
            Name
          </p>
          <p className="text-sm">{session?.user?.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest2 text-ink/50 dark:text-ivory/50 mb-1">
            Email
          </p>
          <p className="text-sm">{session?.user?.email}</p>
        </div>
      </div>
    </div>
  );
}
