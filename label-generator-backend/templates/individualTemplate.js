const bwipjs = require("bwip-js");

module.exports = async function individualTemplate(doc, data) {
  const width = 432;
  const height = 288;

  const {
    part_number,
    description_eng,
    description_fr,
    description_esp,
    qty,
    vendor = "11111AA",   // vendor CODE from DB (vendor_name used as code)
    date = "S251001",
    country = "USA",
  } = data;

  // Background
  doc.rect(0, 0, width, height).fill("#E5E5E5");
  doc.fillColor("black");

  // Border
  doc.lineWidth(3);
  doc.rect(10, 10, width - 20, height - 20).stroke();

  // =========================
  // DESCRIPTION (3 LANGUAGES)
  // =========================
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(description_eng || "COMPONENT (ENG)", 0, 30, { align: "center" });

  doc.text(description_fr  || "COMPONENT (FR)",  0, 55, { align: "center" });
  doc.text(description_esp || "COMPONENT (ESP)", 0, 80, { align: "center" });

  // =========================
  // BARCODE – centred
  // =========================
  const barcode = await bwipjs.toBuffer({
    bcid: "code128",
    text: part_number,
    scale: 2,
    height: 10,
    includetext: false,
  });

  // Render into full page width so PDFKit centres the image
  doc.image(barcode, 0, 108, { fit: [width, 52], align: "center" });

  // =========================
  // PART NUMBER (HUMAN READABLE)
  // =========================
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`(P) ${part_number}`, 0, 165, { align: "center" });

  // =========================
  // QTY  |  VENDOR CODE  |  DATE   (larger font)
  // =========================
  doc.font("Helvetica-Bold").fontSize(16);

  doc.text(`QTY: ${qty}`, 30, 198);
  doc.text(String(vendor), 175, 198);
  doc.text(String(date),   315, 198);

  // =========================
  // COUNTRY (3 LANGUAGES)  – larger font
  // =========================
  doc
    .font("Helvetica")
    .fontSize(14)
    .text(
      `Made in ${country}   Fabriqué aux ${country}   Hecho en ${country}`,
      0,
      238,
      { align: "center" },
    );
};
