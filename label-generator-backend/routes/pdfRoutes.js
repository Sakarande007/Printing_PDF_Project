// const express = require("express");
// const PDFDocument = require("pdfkit");
// const bwipjs = require("bwip-js");

// const router = express.Router();

// router.post("/", async (req, res) => {
//   const { part_number, description } = req.body;

//   const qty = req.body.qty || "1";
//   const po = "ST-A518402";
//   const supplier = "21676AA";
//   const serial = "10001";

//   const doc = new PDFDocument({
//     size: [432, 288], // 6x4 inches
//     margin: 0,
//   });

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename=${part_number}.pdf`
//   );

//   doc.pipe(res);

//   const width = 432;
//   const height = 288;

//   // ===== Background =====
//   doc.rect(0, 0, width, height).fill("#E5E5E5");
//   doc.fillColor("black");

//   // ===== Border =====
//   doc.lineWidth(3);
//   doc.roundedRect(5, 5, width - 10, height - 10, 15).stroke();

//   // ===== Row Heights =====
//   const row1 = 75;
//   const row2 = 150;
//   const row3 = 225;

//   // Horizontal Lines
//   doc.moveTo(5, row1).lineTo(width - 5, row1).stroke();
//   doc.moveTo(5, row2).lineTo(width - 5, row2).stroke();
//   doc.moveTo(5, row3).lineTo(width - 5, row3).stroke();

//   // Vertical Divider
//   doc.moveTo(width / 2, 5)
//      .lineTo(width / 2, height - 5)
//      .stroke();

//   // =========================
//   // ROW 1 – PART / DESC
//   // =========================

//   doc.fontSize(12).text("PART NO (P)", 20, 15);
//   doc.font("Helvetica-Bold")
//      .fontSize(20)
//      .text(part_number, 20, 30);

//   const partBarcode = await bwipjs.toBuffer({
//     bcid: "code128",
//     text: part_number,
//     scale: 1.5,
//     height: 5,
//     includetext: false,
//   });

//   doc.image(partBarcode, 20, 55, { width: 160 });

//   doc.font("Helvetica")
//      .fontSize(12)
//      .text("DESCRIPTION", 240, 15);

//   doc.font("Helvetica-Bold")
//      .fontSize(15)
//      .text(description, 240, 35, { width: 170 });

//   // =========================
//   // ROW 2 – QTY / PO
//   // =========================

//   doc.font("Helvetica")
//      .fontSize(12)
//      .text("QTY (Q)", 20, row1 + 10);

//   doc.font("Helvetica-Bold")
//      .fontSize(25)
//      .text(qty, 20, row1 + 25);

// //   const qtyBarcode = await bwipjs.toBuffer({
// //     bcid: "code128",
// //     text: qty,
// //     scale: 2,
// //     height: 10,
// //   });

// //   doc.image(qtyBarcode, 20, row1 + 50, { width: 160 });

//   doc.font("Helvetica")
//      .fontSize(12)
//      .text("PO (K)", 240, row1 + 10);

//   doc.font("Helvetica-Bold")
//      .fontSize(20)
//      .text(po, 240, row1 + 25);

//   const poBarcode = await bwipjs.toBuffer({
//     bcid: "code128",
//     text: po,
//     scale: 1.5,
//     height: 5,
//     includetext: false,
//   });

//   doc.image(poBarcode, 240, row1 + 50, { width: 160 });

//   // =========================
//   // ROW 3 – SUPPLIER / SERIAL
//   // =========================

//   doc.font("Helvetica")
//      .fontSize(12)
//      .text("SUPPLIER (V)", 20, row2 + 10);

//   doc.font("Helvetica-Bold")
//      .fontSize(26)
//      .text(supplier, 20, row2 + 20);

//   const supplierBarcode = await bwipjs.toBuffer({
//     bcid: "code128",
//     text: supplier,
//     scale: 1.5,
//     height: 4,
//     includetext: false,
//   });

//   doc.image(supplierBarcode, 20, row2 + 50, { width: 160 });

//   doc.font("Helvetica")
//      .fontSize(12)
//      .text("SERIAL (S)", 240, row2 + 10);

//   doc.font("Helvetica-Bold")
//      .fontSize(26)
//      .text(serial, 240, row2 + 25);

//   const serialBarcode = await bwipjs.toBuffer({
//     bcid: "code128",
//     text: serial,
//     scale: 1.5,
//     height: 4,
//     includetext: false,
//   });

//   doc.image(serialBarcode, 240, row2 + 50, { width: 180 });

//   // =========================
//   // FOOTER ROW
//   // =========================

//   doc.font("Helvetica-Bold")
//      .fontSize(26)
//      .text("1 OF 2", 20, row3 + 15);

//   doc.font("Helvetica")
//      .fontSize(12)
//      .text("COUNTRY OF ORIGIN", 240, row3 + 10);

//   doc.font("Helvetica-Bold")
//      .fontSize(26)
//      .text("MADE IN USA", 240, row3 + 30);

//   doc.end();
// });

// module.exports = router;

//NEW CODE

const util = require("util");
const express = require("express");
const PDFDocument = require("pdfkit");
const db = require("../db");

const paccarTemplate = require("../templates/paccarTemplate");
const packingSlipTemplate = require("../templates/packingSlipTemplate");
const shipToTemplate = require("../templates/shipToTemplate");
const mixedLoadTemplate = require("../templates/mixedLoadTemplate");
const individualTemplate = require("../templates/individualTemplate");
const { authenticateToken } = require("../middleware/auth");

const query = util.promisify(db.query.bind(db));

async function resolvePaccarPartFromDb(body) {
  const partId = body.part_id != null ? parseInt(body.part_id, 10) : NaN;
  if (!Number.isFinite(partId) || partId < 1) {
    return body;
  }
  const rows = await query(
    `SELECT p.part_number, p.description, p.country_of_origin,
            v.vendor_code AS vendor_code
     FROM parts p
     LEFT JOIN vendors v ON v.id = p.vendor_id
     WHERE p.id = ?`,
    [partId],
  );
  if (!rows.length) {
    const err = new Error("Part not found");
    err.statusCode = 404;
    throw err;
  }
  const row = rows[0];
  return {
    ...body,
    part_number: row.part_number,
    description: row.description != null ? row.description : "",
    country_of_origin: row.country_of_origin,
    vendor_code: row.vendor_code || "",
  };
}

// Resolves individual-label data from DB (description_eng/fr/esp + part_number + vendor_code)
async function resolveIndividualPartFromDb(body) {
  const partId = body.part_id != null ? parseInt(body.part_id, 10) : NaN;
  if (!Number.isFinite(partId) || partId < 1) {
    const err = new Error('part_id is required for individual label');
    err.statusCode = 400;
    throw err;
  }
  const rows = await query(
    `SELECT p.part_number, p.description_eng, p.description_fr, p.description_esp,
            v.vendor_code AS vendor_code
     FROM parts p
     LEFT JOIN vendors v ON v.id = p.vendor_id
     WHERE p.id = ?`,
    [partId],
  );
  if (!rows.length) {
    const err = new Error('Part not found');
    err.statusCode = 404;
    throw err;
  }
  const row = rows[0];
  return {
    ...body,
    part_number:     row.part_number,
    description_eng: row.description_eng || 'COMPONENT (ENG)',
    description_fr:  row.description_fr  || 'COMPONENT (FR)',
    description_esp: row.description_esp || 'COMPONENT (ESP)',
    vendor:          row.vendor_code || '',
  };
}

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  const { template } = req.body;
  let paccarData = req.body;

  if (template === "paccar") {
    try {
      paccarData = await resolvePaccarPartFromDb(req.body);
    } catch (e) {
      const code = e.statusCode || 500;
      return res
        .status(code)
        .json({ error: e.message || "Could not load part" });
    }
  }

  const doc = new PDFDocument({
    size: [432, 288], // 6x4 landscape
    margin: 0,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=label.pdf");

  doc.pipe(res);

  if (template === "individual") {
    // ── INDIVIDUAL: resolve from DB, loop qty pages, format date ──────────
    let indData;
    try {
      indData = await resolveIndividualPartFromDb(req.body);
    } catch (e) {
      doc.end();
      return res.status(e.statusCode || 500).json({ error: e.message });
    }

    // Accept HTML date picker value YYYY-MM-DD → convert to SDDMMYYYY
    const rawDate = String(indData.date || "").trim();
    let formattedDate = rawDate;
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      const [yyyy, mm, dd] = rawDate.split("-");
      formattedDate = `S${dd}${mm}${yyyy}`;
    } else if (rawDate && !rawDate.startsWith("S")) {
      formattedDate = `S${rawDate}`;
    }

    const qty = Math.max(1, parseInt(indData.qty, 10) || 1);
    for (let i = 1; i <= qty; i++) {
      await individualTemplate(doc, { ...indData, date: formattedDate, qty });
      if (i !== qty) doc.addPage({ size: [432, 288], margin: 0 });
    }

  } else if (template === "ship-to") {
    // ── SHIP-TO (unchanged) ───────────────────────────────────────────────
    const totalPallets = parseInt(req.body.pallet) || 1;
    for (let i = 1; i <= totalPallets; i++) {
      const palletText = `Pallet ${i} of ${totalPallets}`;
      await shipToTemplate(doc, req.body, palletText);
      if (i !== totalPallets) doc.addPage({ size: [432, 288], margin: 0 });
    }

  } else if (template === "packing-slip") {
    // ── PACKING SLIP (unchanged) ──────────────────────────────────────────
    await packingSlipTemplate(doc);

  } else if (template === "mixed-load") {
    // ── MIXED LOAD (unchanged) ────────────────────────────────────────────
    await mixedLoadTemplate(doc);

  } else {
    // ── PACCAR (unchanged) ────────────────────────────────────────────────
    const totalItems = parseInt(paccarData.totalItems) || 0;
    const perBox = parseInt(paccarData.perBox) || 1;

    const fullBoxes = Math.floor(totalItems / perBox);
    const remainder = totalItems % perBox;
    const totalBoxes = remainder > 0 ? fullBoxes + 1 : fullBoxes;

    for (let i = 1; i <= totalBoxes; i++) {
      const currentQty = i <= fullBoxes ? perBox : remainder;
      const boxText = `${i} OF ${totalBoxes}`;

      await paccarTemplate(
        doc,
        { ...paccarData, qty: currentQty },
        boxText,
      );

      if (i !== totalBoxes) doc.addPage({ size: [432, 288], margin: 0 });
    }
  }

  doc.end();
});

module.exports = router;

