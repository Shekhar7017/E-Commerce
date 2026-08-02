import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { IOrder } from "@/models";

export async function generateInvoicePdf(order: IOrder): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const emerald = rgb(0.043, 0.431, 0.31);
  const ink = rgb(0.043, 0.059, 0.051);
  const gray = rgb(0.4, 0.4, 0.4);

  let y = height - 60;

  page.drawText("L'ATELIER HAUTE BOUTIQUE", {
    x: 50,
    y,
    size: 18,
    font: boldFont,
    color: emerald,
  });

  y -= 20;
  page.drawText("TAX INVOICE", { x: 50, y, size: 10, font, color: gray });

  y -= 40;
  page.drawText(`Invoice / Order #: ${order.orderNumber}`, {
    x: 50,
    y,
    size: 11,
    font: boldFont,
    color: ink,
  });

  y -= 16;
  page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: gray,
  });

  y -= 16;
  page.drawText(`Payment Method: ${order.paymentMethod.toUpperCase()}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: gray,
  });

  y -= 30;
  page.drawText("Ship To:", { x: 50, y, size: 10, font: boldFont, color: ink });
  y -= 14;
  const addr = order.shippingAddress;
  const addressLines = [
    addr.fullName,
    addr.line1,
    addr.line2 ?? "",
    `${addr.city}, ${addr.state} ${addr.postalCode}`,
    addr.country,
    `Phone: ${addr.phone}`,
  ].filter(Boolean);

  for (const line of addressLines) {
    page.drawText(line, { x: 50, y, size: 9, font, color: gray });
    y -= 13;
  }

  y -= 20;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: emerald,
  });

  y -= 20;
  page.drawText("Item", { x: 50, y, size: 9, font: boldFont, color: ink });
  page.drawText("Qty", { x: 340, y, size: 9, font: boldFont, color: ink });
  page.drawText("Price", { x: 400, y, size: 9, font: boldFont, color: ink });
  page.drawText("Subtotal", { x: 470, y, size: 9, font: boldFont, color: ink });

  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: gray,
  });

  y -= 18;
  for (const item of order.items) {
    const name = item.name.length > 45 ? `${item.name.slice(0, 45)}...` : item.name;
    page.drawText(name, { x: 50, y, size: 9, font, color: ink });
    page.drawText(String(item.quantity), { x: 340, y, size: 9, font, color: ink });
    page.drawText(`Rs. ${item.price.toLocaleString("en-IN")}`, {
      x: 400,
      y,
      size: 9,
      font,
      color: ink,
    });
    page.drawText(`Rs. ${item.subtotal.toLocaleString("en-IN")}`, {
      x: 470,
      y,
      size: 9,
      font,
      color: ink,
    });
    y -= 18;
  }

  y -= 12;
  page.drawLine({
    start: { x: 340, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: gray,
  });

  y -= 20;
  const summaryRows: [string, number][] = [
    ["Subtotal", order.subtotal],
    ["Discount", -order.discount],
    ["Shipping", order.shippingFee],
    ["Tax", order.tax],
  ];

  for (const [label, value] of summaryRows) {
    page.drawText(label, { x: 400, y, size: 9, font, color: gray });
    page.drawText(
      `${value < 0 ? "-" : ""}Rs. ${Math.abs(value).toLocaleString("en-IN")}`,
      { x: 470, y, size: 9, font, color: gray }
    );
    y -= 15;
  }

  y -= 5;
  page.drawText("Total", { x: 400, y, size: 11, font: boldFont, color: emerald });
  page.drawText(`Rs. ${order.total.toLocaleString("en-IN")}`, {
    x: 470,
    y,
    size: 11,
    font: boldFont,
    color: emerald,
  });

  page.drawText("Thank you for shopping with L'Atelier Haute Boutique.", {
    x: 50,
    y: 60,
    size: 9,
    font,
    color: gray,
  });

  return pdfDoc.save();
}
