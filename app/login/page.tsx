"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { loginSchema, type LoginInput } from "@/lib/validators";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    setIsSubmitting(false);

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell eyebrow="Welcome Back" title="Sign In">
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

        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full rounded-full border border-ink/15 dark:border-ivory/20 bg-transparent px-5 py-3 text-sm focus:border-emerald-500"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-ink/10 dark:bg-ivory/10" />
        <span className="text-xs text-ink/40 dark:text-ivory/40">OR</span>
        <div className="h-px flex-1 bg-ink/10 dark:bg-ivory/10" />
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="btn-secondary w-full"
      >
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-ink/60 dark:text-ivory/60">
        New here?{" "}
        <Link href="/register" className="text-emerald-600 dark:text-emerald-400">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
