import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { generateInvoicePdf } from "@/lib/invoice";
import { handleApiError, ApiError } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await connectDB();
    const order = await Order.findById(id);
    if (!order) throw new ApiError("Order not found", 404);

    const pdfBytes = await generateInvoicePdf(order);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
