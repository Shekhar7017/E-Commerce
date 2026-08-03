"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { z } from "zod";
import { passwordSchema } from "@/lib/validators";

const formSchema = z.object({ password: passwordSchema });
type FormInput = z.infer<typeof formSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(formSchema) });

  async function onSubmit(data: FormInput) {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success("Password reset. Please sign in.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell eyebrow="Invalid Link" title="Reset link missing">
        <p className="text-center text-sm text-ink/60 dark:text-ivory/60">
          Please request a new{" "}
          <Link href="/forgot-password" className="text-emerald-600 dark:text-emerald-400">
            password reset link
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="New Password" title="Set a New Password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="New password"
            className="w-full rounded-full border border-ink/15 dark:border-ivory/20 bg-transparent px-5 py-3 text-sm focus:border-emerald-500"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
