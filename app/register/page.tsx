"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { registerSchema, type RegisterInput } from "@/lib/validators";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.success("Account created. Please sign in.");
        router.push("/login");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="Join the Atelier" title="Create Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("name")}
            placeholder="Full name"
            aria-label="Full name"
            className="w-full rounded-full border border-ink/15 dark:border-ivory/20 bg-transparent px-5 py-3 text-sm focus:border-emerald-500"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="Email address"
            aria-label="Email address"
            className="w-full rounded-full border border-ink/15 dark:border-ivory/20 bg-transparent px-5 py-3 text-sm focus:border-emerald-500"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-full border border-ink/15 dark:border-ivory/20 bg-transparent px-5 py-3 text-sm focus:border-emerald-500"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-ink/40 dark:text-ivory/40">
            At least 8 characters with uppercase, lowercase, and a number.
          </p>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-ink/10 dark:bg-ivory/10" />
        <span className="text-xs text-ink/40 dark:text-ivory/40">OR</span>
        <div className="h-px flex-1 bg-ink/10 dark:bg-ivory/10" />
      </div>

      <button onClick={() => signIn("google", { callbackUrl: "/account" })} className="btn-secondary w-full">
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-ink/60 dark:text-ivory/60">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-600 dark:text-emerald-400">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
