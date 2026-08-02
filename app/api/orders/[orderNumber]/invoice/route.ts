import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getOrderByNumber } from "@/lib/services/order.service";
import { generateInvoicePdf } from "@/lib/invoice";
import { handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const user = await requireUser();
    const { orderNumber } = await params;
    const order = await getOrderByNumber(orderNumber, user.id);

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
