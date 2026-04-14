const bwipjs = require("bwip-js");

const width = 432;
const height = 288;
const midX = width / 2;
const padX = 10;
const padY = 4;

/** Left / right column inner boxes (inside vertical divider, inside horizontal lines) */
function cols(rowTop, rowBottom) {
  const top = rowTop + padY;
  const bottom = rowBottom - padY;
  return {
    left: { x: padX, y: top, w: midX - padX * 2, bottom },
    right: { x: midX + padX, y: top, w: width - midX - padX * 2, bottom },
  };
}

function drawBarcodeInCell(doc, buffer, box) {
  const { x, y, bottom } = box;
  const maxW = box.w;
  const maxH = bottom - y;
  if (maxH < 8 || maxW < 20) return;
  doc.image(buffer, x, y, {
    fit: [maxW, maxH],
    align: "left",
    valign: "top",
  });
}

/** Single-line bold value: shrink font until it fits width */
function drawBoldLine(doc, text, x, y, maxW, maxSize, minSize) {
  const t = text != null ? String(text) : "";
  let size = maxSize;
  doc.font("Helvetica-Bold");
  while (size >= minSize) {
    doc.fontSize(size);
    if (doc.widthOfString(t) <= maxW) {
      doc.text(t, x, y, { lineBreak: false });
      return y + doc.currentLineHeight();
    }
    size -= 1;
  }
  doc.fontSize(minSize);
  doc.text(t, x, y, { width: maxW, ellipsis: true });
  return y + doc.currentLineHeight();
}

/** Label row (small caps line) */
function drawLabel(doc, text, x, y) {
  doc.font("Helvetica").fontSize(12).text(text, x, y);
  return y + 13;
}

/** Wrapped body text within max height */
function drawWrappedInCell(doc, text, x, y, maxW, maxY, fontSize) {
  doc.font("Helvetica-Bold").fontSize(fontSize);
  const maxH = maxY - y;
  doc.text(text != null ? String(text) : "", x, y, {
    width: maxW,
    height: maxH,
    ellipsis: true,
  });
}

/** Country block: small label + bold lines that shrink / wrap to stay in cell */
function drawCountryOrigin(doc, originLine, box) {
  const { x, y, w, bottom } = box;
  let cy = drawLabel(doc, "COUNTRY OF ORIGIN", x, y);
  const maxW = w;
  const maxBottom = bottom;
  let fs = 22;
  doc.font("Helvetica-Bold");
  while (fs >= 9) {
    doc.fontSize(fs);
    const h = doc.heightOfString(originLine, { width: maxW });
    if (cy + h <= maxBottom) {
      doc.text(originLine, x, cy, { width: maxW });
      return;
    }
    fs -= 1;
  }
  doc.fontSize(9);
  doc.text(originLine, x, cy, {
    width: maxW,
    height: maxBottom - cy,
    ellipsis: true,
  });
}

async function makeBarcode(text, scale, height) {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: String(text != null ? text : ""),
    scale,
    height,
    includetext: false,
  });
}

module.exports = async function paccarTemplate(doc, data, boxText) {
  const { part_number, description, qty, po, country_of_origin, vendor_code } = data;
  const rawOrigin =
    country_of_origin != null ? String(country_of_origin).trim() : "";
  let originLine = "MADE IN USA";
  if (rawOrigin) {
    if (/^made in\b/i.test(rawOrigin)) {
      originLine = rawOrigin;
    } else {
      originLine = `MADE IN ${rawOrigin}`;
    }
  }

  const supplier = vendor_code || "21676AA";
  const serial = "10001";

  doc.rect(0, 0, width, height).fill("#E5E5E5");
  doc.fillColor("black");

  doc.lineWidth(3);
  doc.roundedRect(5, 5, width - 10, height - 10, 15).stroke();

  const row1 = 75;
  const row2 = 150;
  const row3 = 225;

  doc.moveTo(5, row1).lineTo(width - 5, row1).stroke();
  doc.moveTo(5, row2).lineTo(width - 5, row2).stroke();
  doc.moveTo(5, row3).lineTo(width - 5, row3).stroke();
  doc.moveTo(midX, 5).lineTo(midX, height - 5).stroke();

  // —— Row 0: Part | Description ——
  const c0 = cols(5, row1);
  const L0 = c0.left;
  const R0 = c0.right;

  let y = L0.y;
  y = drawLabel(doc, "PART NO (P)", L0.x, y);
  y = drawBoldLine(doc, part_number, L0.x, y + 2, L0.w, 20, 10);
  const barcodeTop = y + 2;
  const partBarcodeBox = {
    x: L0.x,
    y: barcodeTop,
    w: L0.w,
    bottom: L0.bottom,
  };
  const partBarcode = await makeBarcode(part_number, 1.2, 4);
  drawBarcodeInCell(doc, partBarcode, partBarcodeBox);

  y = R0.y;
  y = drawLabel(doc, "DESCRIPTION", R0.x, y);
  drawWrappedInCell(
    doc,
    description,
    R0.x,
    y + 2,
    R0.w,
    R0.bottom,
    14,
  );

  // —— Row 1: Qty | PO ——
  const c1 = cols(row1, row2);
  const L1 = c1.left;
  const R1 = c1.right;

  y = L1.y;
  y = drawLabel(doc, "QTY (Q)", L1.x, y);
  y = drawBoldLine(doc, qty, L1.x, y + 2, L1.w, 24, 12);
  const qtyBarcodeBox = {
    x: L1.x,
    y: y + 2,
    w: L1.w,
    bottom: L1.bottom,
  };
  const qtyBarcode = await makeBarcode(qty, 1.2, 4);
  drawBarcodeInCell(doc, qtyBarcode, qtyBarcodeBox);

  y = R1.y;
  y = drawLabel(doc, "PO (K)", R1.x, y);
  y = drawBoldLine(doc, po, R1.x, y + 2, R1.w, 18, 10);
  const poBarcodeBox = {
    x: R1.x,
    y: y + 2,
    w: R1.w,
    bottom: R1.bottom,
  };
  const poBarcode = await makeBarcode(po, 1.2, 4);
  drawBarcodeInCell(doc, poBarcode, poBarcodeBox);

  // —— Row 2: Supplier | Serial ——
  const c2 = cols(row2, row3);
  const L2 = c2.left;
  const R2 = c2.right;

  y = L2.y;
  y = drawLabel(doc, "SUPPLIER (V)", L2.x, y);
  y = drawBoldLine(doc, supplier, L2.x, y + 2, L2.w, 22, 11);
  const supBarcodeBox = {
    x: L2.x,
    y: y + 2,
    w: L2.w,
    bottom: L2.bottom,
  };
  const supplierBarcode = await makeBarcode(supplier, 1.2, 3);
  drawBarcodeInCell(doc, supplierBarcode, supBarcodeBox);

  y = R2.y;
  y = drawLabel(doc, "SERIAL (S)", R2.x, y);
  y = drawBoldLine(doc, serial, R2.x, y + 2, R2.w, 22, 11);
  const serialBarcodeBox = {
    x: R2.x,
    y: y + 2,
    w: R2.w,
    bottom: R2.bottom,
  };
  const serialBarcode = await makeBarcode(serial, 1.2, 3);
  drawBarcodeInCell(doc, serialBarcode, serialBarcodeBox);

  // —— Row 3: Box count | Country ——
  const c3 = cols(row3, height - 5);
  const L3 = c3.left;
  const R3 = c3.right;

  drawBoldLine(
    doc,
    boxText || "1 OF 1",
    L3.x,
    L3.y + 8,
    L3.w,
    24,
    12,
  );

  drawCountryOrigin(doc, originLine, {
    x: R3.x,
    y: R3.y,
    w: R3.w,
    bottom: R3.bottom,
  });
};
