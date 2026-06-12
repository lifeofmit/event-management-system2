const Event = require('../models/Event');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const exportEvents = async (req, res) => {
  try {
    const { format } = req.query; // 'excel', 'csv', or 'pdf'

    // Fetch all events with populated references
    const events = await Event.find()
      .populate('eventType', 'name')
      .populate('coordinatorId', 'name')
      .populate('deanId', 'name')
      .sort({ createdAt: -1 });

    if (format === 'excel' || format === 'csv') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Events');

      // Define Columns
      worksheet.columns = [
        { header: 'Event Name', key: 'eventName', width: 25 },
        { header: 'Date', key: 'eventDate', width: 15 },
        { header: 'Type', key: 'eventType', width: 20 },
        { header: 'Coordinator', key: 'coordinator', width: 20 },
        { header: 'Dean', key: 'dean', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Add Rows
      events.forEach(event => {
        worksheet.addRow({
          eventName: event.eventName,
          eventDate: new Date(event.eventDate).toLocaleDateString(),
          eventType: event.eventType?.name || 'N/A',
          coordinator: event.coordinatorId?.name || 'N/A',
          dean: event.deanId?.name || 'N/A',
          status: event.eventReport ? 'Report Uploaded' : 'Pending'
        });
      });

      if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=events.xlsx');
        return await workbook.xlsx.write(res);
      } 
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
        return await workbook.csv.write(res);
      }
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=events.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('University Event Report', { align: 'center' });
      doc.moveDown();

      events.forEach((event, index) => {
        doc.fontSize(12).text(`${index + 1}. ${event.eventName}`);
        doc.fontSize(10).text(`Date: ${new Date(event.eventDate).toLocaleDateString()} | Type: ${event.eventType?.name || 'N/A'}`);
        doc.fontSize(10).text(`Coordinator: ${event.coordinatorId?.name || 'N/A'}`);
        doc.moveDown();
      });

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Invalid format requested' });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

module.exports = { exportEvents };