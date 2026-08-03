import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await checkRateLimit(`contact:${ip}`);
    if (!success) {
      return apiError("Too many requests, please try again later.", 429);
    }

    const body = await request.json();
    const input = schema.parse(body);

    await sendEmail({
      to: process.env.SMTP_USER ?? "hello@latelier.com",
      subject: `New contact form message from ${input.name}`,
      html: `
        <p><strong>From:</strong> ${input.name} (${input.email})</p>
        <p>${input.message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return apiSuccess({ message: "Message sent" }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
