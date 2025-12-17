import Invoice from "../models/Invoice.js";
import { logActivity } from "../utils/logger.js";
import PDFDocument from "pdfkit";

// @desc    Get all invoices with pagination and search
// @route   GET /api/v1/billing/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search
      ? {
          $or: [
            { "user.name": { $regex: req.query.search, $options: "i" } },
            { invoiceId: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const count = await Invoice.countDocuments(search);
    const invoices = await Invoice.find(search)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ date: -1 });

    res.json({
      invoices,
      page,
      pages: Math.ceil(count / limit),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Generate a new invoice (Internal)
// @route   POST /api/v1/billing/generate
// @access  Private
export const generateInvoice = async (req, res) => {
  try {
    const { user, services, discount, gst } = req.body;

    const invoiceId = `MES${new Date().getFullYear()}${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const processedServices = services.map(s => ({
        ...s,
        amount: s.unitPrice * s.qty
    }));
    
    const subtotal = processedServices.reduce((acc, s) => acc + s.amount, 0);
    const totalAmount = subtotal - (discount || 0) + (gst || 0);

    const invoice = new Invoice({
      invoiceId,
      user,
      services: processedServices,
      discount,
      gst,
      totalAmount,
      date: Date.now(),
      status: "PAID",
    });

    const createdInvoice = await invoice.save();

    // Log Activity
    await logActivity(req, "GENERATED", "BILLING", `Invoice #${createdInvoice.invoiceId}`, { amount: createdInvoice.totalAmount });

    res.status(201).json(createdInvoice);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/v1/billing/download/:id
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceId}.pdf`);

    doc.pipe(res);

    // --- Header ---
    // Brand (Top Left)
    doc.fillColor("#ef4444").fontSize(35).font('Helvetica-Bold').text("me", 40, 40); // Mocking logo text 'me' or 'EventHub'
    // Actually user said "use Event HUb logio insted of mepass ME".
    // So let's write "Event Hub" nicely.
    doc.rect(40, 40, 150, 50).fill("#ef4444");
    doc.fillColor("#ffffff").fontSize(20).text("Event Hub", 60, 55);

    // Company Details (Top Right)
    doc.fillColor("#000000").fontSize(10).font('Helvetica-Bold').text("Event Hub Management Private Limited", 300, 40, { align: "right" });
    doc.font('Helvetica').fontSize(9).text("Rajipa Green Land Residency Shop No D-25,", 300, 55, { align: "right" });
    doc.text("Near Abjibapa Residency Nikol Ahmedabad 380024, Gujarat India", 300, 68, { align: "right" });
    doc.font('Helvetica-Bold').text("GST: 24AAECM7209G1ZF", 300, 83, { align: "right" });

    // --- Bill To & Invoice Details ---
    const infoTop = 110;
    
    // Left: Billing To
    doc.fillColor("#000000").fontSize(8).font('Helvetica-Bold').text("BILLING TO", 40, infoTop);
    doc.fontSize(10).text(invoice.user.name.toUpperCase(), 40, infoTop + 15);
    // Generic Address for User
    doc.font('Helvetica').fontSize(9).text("BL 13 14 15 16 HARINAGAR GF SOM BUILDING", 40, infoTop + 30);
    doc.text("Surat Gujarat", 40, infoTop + 42);
    doc.text("India", 40, infoTop + 54);

    // Right: Invoice Info
    doc.font('Helvetica-Bold').fontSize(10).text("INVOICE", 400, infoTop, { align: "right" });
    doc.font('Helvetica-Bold').text(`Invoice No: ${invoice.invoiceId}`, 400, infoTop + 15, { align: "right" });
    doc.font('Helvetica').text(`Invoice Date: ${new Date(invoice.date).toLocaleDateString()}`, 400, infoTop + 30, { align: "right" });
    doc.text("Payment Type: | Transaction ID:", 400, infoTop + 45, { align: "right" });

    // --- Table ---
    const tableTop = 200;
    
    // Background for header
    doc.rect(30, tableTop, 535, 25).fill("#e2e8f0");
    
    // Columns X positions
    const colSNo = 35;
    const colDesc = 65;
    const colAmount = 240;
    const colDiscount = 290;
    const colSubTotal = 340;
    const colGSTP = 390;
    const colGST = 430;
    const colTotal = 490;

    // Header Text
    doc.fillColor("#000000").fontSize(8).font('Helvetica-Bold');
    doc.text("S.no", colSNo, tableTop + 8);
    doc.text("Description", colDesc, tableTop + 8);
    doc.text("Amount", colAmount, tableTop + 8, { width: 40, align: "right" });
    doc.text("Discount", colDiscount, tableTop + 8, { width: 40, align: "right" });
    doc.text("Sub total", colSubTotal, tableTop + 8, { width: 40, align: "right" });
    doc.text("GST %", colGSTP, tableTop + 8, { width: 30, align: "right" });
    doc.text("GST", colGST, tableTop + 8, { width: 40, align: "right" });
    doc.text("Total", colTotal, tableTop + 8, { width: 60, align: "right" });

    doc.moveTo(30, tableTop + 25).lineTo(565, tableTop + 25).stroke();

    // Rows
    let y = tableTop + 35;
    doc.font('Helvetica').fontSize(8);

    invoice.services.forEach((item, i) => {
        const itemAmount = item.amount;
        const discountVal = -itemAmount; // Example logic based on user image showing full discount? Or just per item.
        // The user image shows "1000" Amount, "-1000" Discount, "0" Total.
        // Let's approximate internal logic based on the stored data.
        
        // Use stored values
        const displayAmount = item.amount; 
        const displayDiscount = 0; // We usually store global discount. Let's assume 0 per item for now unless logic changes.
        // In user example: "1000, -1000, 0".
        // Let's rely on standard logic:
        const subTotal = displayAmount;
        const gstPercent = 18;
        const gstVal = (subTotal * (gstPercent/100)); // Just 18% assumption
        const lineTotal = subTotal + gstVal;
        
        // If we want to strictly match user image logic of big discount:
        // We'll stick to real calculated values based on DB.

        doc.text(i + 1, colSNo, y);
        
        // Description Block
        doc.font('Helvetica-Bold').text(item.serviceName, colDesc, y);
        doc.font('Helvetica').fontSize(7).text("HSN/SAC: 9984", colDesc, y + 10);
        doc.text(`Qty ${item.qty} X ${item.unitPrice} price = Rs.${itemAmount}`, colDesc, y + 20);

        doc.fontSize(8);
        doc.text(displayAmount.toFixed(2), colAmount, y, { width: 40, align: "right" });
        doc.text(displayDiscount.toFixed(2), colDiscount, y, { width: 40, align: "right" });
        doc.text(subTotal.toFixed(2), colSubTotal, y, { width: 40, align: "right" });
        doc.text(`${gstPercent}%`, colGSTP, y, { width: 30, align: "right" });
        doc.text(gstVal.toFixed(2), colGST, y, { width: 40, align: "right" });
        doc.text(lineTotal.toFixed(2), colTotal, y, { width: 60, align: "right" });
        
        y += 40; // Row height
    });
    
    // Bottom separator
    doc.moveTo(30, y).lineTo(565, y).stroke();
    y += 10;

    // --- Totals Section (Right Aligned) ---
    const totalsX = 400;
    const valuesX = 490;
    
    doc.text("Gross Amount (Rs.)", totalsX, y, { align: "right", width: 80 });
    doc.text(invoice.totalAmount.toFixed(2), valuesX, y, { align: "right", width: 60 });
    y += 12;

    doc.text("Discount (Rs.)", totalsX, y, { align: "right", width: 80 });
    doc.text(`- ${invoice.discount.toFixed(2)}`, valuesX, y, { align: "right", width: 60 });
    y += 12;

    doc.text("Subtotal (Rs.)", totalsX, y, { align: "right", width: 80 });
    doc.text((invoice.totalAmount - invoice.discount).toFixed(2), valuesX, y, { align: "right", width: 60 }); // Approx
    y += 12;

    doc.font('Helvetica-Bold').text("Grand Total (Incl.GST) (Rs.)", totalsX, y, { align: "right", width: 80 });
    doc.text(invoice.totalAmount.toFixed(2), valuesX, y, { align: "right", width: 60 });
    y += 20;

    // --- Terms and Conditions ---
    const termsY = y + 20;
    doc.fillColor("#000000").font('Helvetica-Bold').fontSize(10).text("TERMS AND CONDITIONS", 40, termsY);
    
    const terms = [
        "1. Payment Terms: Payment in full must be made at the time of purchase.",
        "2. Onboarding Fees, Yearly Rentals, and Subscription Fees are non-refundable.",
        "3. Refunds can be initiated for Pass and Promotional Message purchases.",
        "4. Onboarding Fees, Yearly Rentals, and Subscription Fees are non-refundable.",
        "5. Payment Methods: We accept Onboarding & Rental payments through Bank Transfer, Cheque,",
        "   IMPS, NEFT, and purchasing payments through our portal, which includes Card and UPI options.",
        "6. Prices for goods and services are as specified in the invoice.",
        "7. All prices are in Indian Rupees (INR) and do not include taxes unless explicitly stated.",
        "8. The buyer is responsible for any applicable taxes, duties, or other governmental charges associated with the purchase.",
        "9. Returns and refunds will be processed in accordance with our return policy.",
        "10. In case of late payment, the seller reserves the right to charge a late fee or discontinue services.",
        "11. Dispute Resolution: Any disputes or disagreements should be resolved through negotiation and good faith discussions.",
        "12. Ownership and Title: Ownership and title of goods will be transferred to the buyer upon full payment.",
        "13. Confidentiality: Both parties agree to maintain the confidentiality of any sensitive information disclosed.",
        "14. Governing Law: This invoice is governed by and construed in accordance with the laws of India and its jurisdiction.",
        "15. Changes to Terms and Conditions: These terms and conditions may be subject to change without prior notice.",
        "16. Entire Agreement: This invoice constitutes the entire agreement between the parties.",
        "17. By accepting this invoice, the buyer acknowledges and agrees to abide by these terms and conditions."
    ];

    doc.font('Helvetica').fontSize(7);
    let termY = termsY + 15;
    terms.forEach(term => {
        doc.text(term, 40, termY);
        termY += 10;
    });

    // --- Footer ---
    doc.rect(30, 780, 535, 40).fill("#f1f5f9"); // Light footer bg
    doc.fillColor("#000000").fontSize(8);
    doc.text("support@eventhub.in", 50, 795);
    doc.text("GST - 24AAECM7209G1ZF", 250, 795, { align: "center" });
    doc.text("Mobile - +91 9876543210", 450, 795, { align: "right" });

    doc.end();

  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

