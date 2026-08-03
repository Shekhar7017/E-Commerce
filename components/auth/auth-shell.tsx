import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-20">
      <p className="label-eyebrow mb-3 text-center">{eyebrow}</p>
      <h1 className="font-display text-3xl text-center mb-2">{title}</h1>
      {subtitle && (
        <p className="text-center text-sm text-ink/60 dark:text-ivory/60 mb-10">
          {subtitle}
        </p>
      )}
      {!subtitle && <div className="mb-8" />}
      {children}
    </main>
  );
}
