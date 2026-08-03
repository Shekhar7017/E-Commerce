"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } finally {
      setIsSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthShell eyebrow="Check Your Inbox" title="Reset link sent">
        <div className="text-center">
          <MailCheck className="mx-auto text-emerald-500 mb-4" size={40} />
          <p className="text-sm text-ink/60 dark:text-ivory/60">
            If an account exists for that email, we&apos;ve sent a link to
            reset your password.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Forgot Password"
      title="Reset Your Password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="Email address"
            className="w-full rounded-full border border-ink/15 dark:border-ivory/20 bg-transparent px-5 py-3 text-sm focus:border-emerald-500"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
        </button>
      </form>
    </AuthShell>
  );
}
