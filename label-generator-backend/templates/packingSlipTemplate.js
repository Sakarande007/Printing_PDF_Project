module.exports = async function packingSlipTemplate(doc) {
  const width = 432;
  const height = 288;

  doc.rect(0, 0, width, height).fill("#E5E5E5");
  doc.fillColor("black");

  doc.lineWidth(3);
  doc.rect(20, 20, width - 40, height - 40).stroke();

  doc.font("Helvetica-Bold")
     .fontSize(40)
     .text("PACKING", 0, 80, { align: "center" });

  doc.text("SLIPS", 0, 130, { align: "center" });

  doc.text("ENCLOSED", 0, 180, { align: "center" });

};
