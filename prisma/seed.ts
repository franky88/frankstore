import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional)
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log("🗑️  Cleared existing data");

  // Create categories
  const electronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics" },
  });

  const clothing = await prisma.category.create({
    data: { name: "Clothing", slug: "clothing" },
  });

  const home = await prisma.category.create({
    data: { name: "Home & Garden", slug: "home-garden" },
  });

  console.log("✅ Categories created");

  // Create sample products
  await prisma.product.create({
    data: {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 199.99,
      stock: 50,
      categoryId: electronics.id,
      images: ["https://placehold.co/600x600/png"],
    },
  });

  await prisma.product.create({
    data: {
      name: "Smart Watch",
      slug: "smart-watch",
      description: "Feature-rich smartwatch with fitness tracking",
      price: 299.99,
      stock: 30,
      categoryId: electronics.id,
      images: ["https://placehold.co/600x600/png"],
    },
  });

  await prisma.product.create({
    data: {
      name: "Cotton T-Shirt",
      slug: "cotton-t-shirt",
      description: "Comfortable 100% cotton t-shirt",
      price: 29.99,
      stock: 100,
      categoryId: clothing.id,
      images: ["https://placehold.co/600x600/png"],
    },
  });

  await prisma.product.create({
    data: {
      name: "Denim Jeans",
      slug: "denim-jeans",
      description: "Classic blue denim jeans",
      price: 79.99,
      stock: 75,
      categoryId: clothing.id,
      images: ["https://placehold.co/600x600/png"],
    },
  });

  await prisma.product.create({
    data: {
      name: "Garden Tools Set",
      slug: "garden-tools-set",
      description: "Complete set of garden tools",
      price: 149.99,
      stock: 25,
      categoryId: home.id,
      images: ["https://placehold.co/600x600/png"],
    },
  });

  console.log("✅ Products created");
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
