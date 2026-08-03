"use client";

import { useState } from "react";
import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast.success("Message sent. We'll be in touch soon.");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <p className="label-eyebrow mb-3">Get in Touch</p>
      <h1 className="font-display text-4xl md:text-5xl mb-12">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-emerald-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-ink/60 dark:text-ivory/60">
                hello@latelier.com
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={18} className="text-emerald-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-ink/60 dark:text-ivory/60">
                +91 98765 43210
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-emerald-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Atelier</p>
              <p className="text-sm text-ink/60 dark:text-ivory/60">
                Mumbai, Maharashtra, India
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" required placeholder="Your name" className="input-field" />
          <input
            name="email"
            type="email"
            required
            placeholder="Your email"
            className="input-field"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
            className="input-field resize-none"
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
