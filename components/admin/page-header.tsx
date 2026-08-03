import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-ink/60 dark:text-ivory/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
