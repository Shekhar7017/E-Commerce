import Link from "next/link";
import Image from "next/image";
import type { ICategory } from "@/models";

export function CategoryShowcase({ categories }: { categories: ICategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-eyebrow mb-3">Curated Edits</p>
          <h2 className="font-display text-3xl md:text-4xl">Shop by Category</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(0, 8).map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-ink/5 dark:bg-ivory/5"
          >
            {category.image?.url ? (
              <Image
                src={category.image.url}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl text-ink/20 dark:text-ivory/20">
                  {category.name}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 font-display text-lg text-ivory">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
