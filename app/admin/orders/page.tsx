import prisma from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const { status } = params;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      orderItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders Management</h1>

      <div className="mb-6 flex gap-2">
        {[
          "ALL",
          "PENDING",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
        ].map((s) => (
          <a
            key={s}
            href={s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`px-4 py-2 rounded-lg ${
              (s === "ALL" && !status) || status === s
                ? "bg-blue-600 text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
