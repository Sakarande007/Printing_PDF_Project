module.exports = async function shipToTemplate(doc, data, palletText) {
  const width = 432;
  const height = 288;

  const {
    company,
    address1,
    address2,
    country,
  } = data;

  // Background
  doc.rect(0, 0, width, height).fill("#E5E5E5");
  doc.fillColor("black");

  // Outer Border Only
  doc.lineWidth(4);
  doc.rect(10, 10, width - 20, height - 20).stroke();

  // SHIP TO Header
  doc.font("Helvetica-Bold")
     .fontSize(32)
     .text("SHIP TO:", 60, 50);

  // Address
  doc.font("Helvetica")
     .fontSize(26)
     .text(company || "", 60, 95)
     .text(address1 || "", 60, 130)
     .text(address2 || "", 60, 165)
     .text(country|| "", 60, 200);

  // Pallet Info
  doc.font("Helvetica")
     .fontSize(26)
     .text(palletText, 60, 235);
};
