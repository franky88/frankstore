import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const { category, search } = params;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        category ? { categoryId: category } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Categories</h3>
            <div className="space-y-1">
              <a
                href="/products"
                className="block px-3 py-2 rounded hover:bg-gray-100"
              >
                All Products
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="block px-3 py-2 rounded hover:bg-gray-100"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No products found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
