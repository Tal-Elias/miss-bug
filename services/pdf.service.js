import fs from 'fs'
import PDFDocument from 'pdfkit'

export const pdfService = {
  buildPDF
}

function buildPDF(bugs, filename = 'SaveTheBugs.pdf') {
  return new Promise((resolve, reject) => {

    const doc = new PDFDocument()

    // Pipe its output to a file 
    const stream = doc.pipe(fs.createWriteStream(filename))

    // iterate bugs array, and create a pdf with all the bugs
    bugs.forEach(bug => {
      // doc.font('./fonts/roboto.ttf')
      doc.text(`Bug ID: ${bug._id}`)
      doc.text(`Title: ${bug.title}`)
      doc.text(`Description: ${bug.description}`)
      doc.text(`Severity: ${bug.severity}`)
      doc.moveDown(1)
      // doc.addPage()
    })

    // finalize PDF file
    doc.end()

    // Close the stream and resolve the Promise when done
    stream.on('finish', () => {
      resolve(filename)
    })

    stream.on('error', (err) => {
      reject(err);
    })
  })

}
