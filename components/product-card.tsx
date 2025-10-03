"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.png",
      quantity: 1,
      stock: product.stock,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square relative bg-gray-100">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold">${product.price.toFixed(2)}</p>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? "Out of Stock" : "Add"}
          </button>
        </div>

        {product.stock > 0 && product.stock < 10 && (
          <p className="text-sm text-orange-600 mt-2">
            Only {product.stock} left!
          </p>
        )}
      </div>
    </div>
  );
}
