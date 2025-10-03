import { ProductForm } from "@/components/admin/product-form";
import prisma from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
