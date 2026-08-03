import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWishlist } from "@/lib/services/user.service";
import { ProductGrid } from "@/components/shop/product-grid";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/wishlist");

  const wishlist = await getWishlist(session.user.id);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <p className="label-eyebrow mb-3">Saved For Later</p>
        <h1 className="font-display text-4xl">Your Wishlist</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink/60 dark:text-ivory/60 mb-6">
            Nothing saved yet. Tap the heart on any piece to keep it here.
          </p>
          <Link href="/shop" className="btn-primary">
            Explore the Collection
          </Link>
        </div>
      ) : (
        <ProductGrid products={JSON.parse(JSON.stringify(wishlist))} />
      )}
    </main>
  );
}
