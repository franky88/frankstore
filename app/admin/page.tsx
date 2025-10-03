import prisma from "@/lib/prisma";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentOrders } from "@/components/admin/recent-orders";

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalRevenue, totalUsers] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] } },
      }),
      prisma.user.count(),
    ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
      orderItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <DashboardStats
        stats={{
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          totalUsers,
        }}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
