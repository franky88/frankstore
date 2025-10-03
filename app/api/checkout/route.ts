import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { items, shippingAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate products and calculate total
    const productIds = items.map((item: any) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const lineItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Product ${item.id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.images.slice(0, 1),
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Create order in database
    const totalAmount = items.reduce((sum: number, item: any) => {
      const product = products.find((p) => p.id === item.id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        shippingAddress,
        status: "PENDING",
        orderItems: {
          create: items.map((item: any) => {
            const product = products.find((p) => p.id === item.id);
            return {
              productId: item.id,
              quantity: item.quantity,
              price: product?.price || 0,
            };
          }),
        },
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=true`,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
      customer_email: user.email,
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
