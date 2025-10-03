import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$connect();
    const count = await prisma.product.count();
    return NextResponse.json({
      success: true,
      message: "Prisma connected!",
      productCount: count,
    });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
