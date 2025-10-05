"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import Link from "next/link";
import { OrderItem } from "@prisma/client";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  user: { name: string | null; email: string };
  orderItems: OrderItem[];
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      toast.success("Order status updated");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update order");
    } finally {
      setUpdating(null);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-mono">
                {order.id.slice(0, 8)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-gray-600">{order.user.email}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                {order.orderItems.length} items
              </td>
              <td className="px-6 py-4 text-sm font-semibold">
                ${order.totalAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={updating === order.id}
                  className={`px-2 py-1 text-xs rounded-full border-0 ${
                    statusColors[order.status]
                  }`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
