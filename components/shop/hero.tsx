"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-ink">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(16,166,114,0.25), transparent 55%), radial-gradient(circle at 80% 70%, rgba(201,164,92,0.15), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-ivory">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-widest2 text-emerald-300 mb-8"
        >
          The Autumn Atelier Edit
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tightest"
        >
          Every stitch,
          <br />
          <span className="italic text-emerald-400">considered.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-8 text-ivory/70 max-w-lg mx-auto text-base leading-relaxed"
        >
          A single-vendor boutique of curated apparel, accessories, and
          objects — each piece selected, not manufactured to a quota.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link href="/shop" className="btn-primary">
            Explore the Collection
          </Link>
          <Link href="/shop?newArrival=true" className="btn-secondary !text-ivory !border-ivory/25 hover:!border-emerald-400 hover:!text-emerald-400">
            New Arrivals
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-ivory dark:from-ink to-transparent" />
    </section>
  );
}
