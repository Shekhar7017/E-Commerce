import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { ApiError } from "@/lib/api-response";
import type { RegisterInput } from "@/lib/validators";
import { sendEmail, passwordResetEmailTemplate } from "@/lib/email";

export async function registerUser(input: RegisterInput) {
  await connectDB();

  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new ApiError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    provider: "credentials",
    role: "customer",
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

export async function requestPasswordReset(email: string) {
  await connectDB();
  const user = await User.findOne({ email });

  // Always behave the same way whether or not the user exists, to avoid
  // leaking which emails are registered.
  if (!user || user.provider !== "credentials") return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password — L'Atelier Haute Boutique",
    html: passwordResetEmailTemplate(resetUrl, user.name),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  await connectDB();
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new ApiError("This reset link is invalid or has expired", 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
}
