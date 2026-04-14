module.exports = async function mixedLoadTemplate(doc) {
  const width = 432;
  const height = 288;

  // Background
  doc.rect(0, 0, width, height).fill("#E5E5E5");
  doc.fillColor("black");

  // Outer Border
  doc.lineWidth(4);
  doc.rect(10, 10, width - 20, height - 20).stroke();

//   // Inner Box (like image)
//   doc.lineWidth(3);
//   doc.rect(40, 40, width - 80, height - 120).stroke();

  // Center Text
  doc.font("Helvetica-Bold")
     .fontSize(70)
     .text("MIXED", 0, 85, { align: "center" });

  doc.text("LOAD", 0, 165, { align: "center" });
};
