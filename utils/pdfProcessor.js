import { PDFDocument } from 'pdf-lib';

export async function downloadMergedRaport(fileUrls, namaSiswa) {
  const mergedPdf = await PDFDocument.create();

  for (const url of fileUrls) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type');

    if (contentType.includes('pdf')) {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } else if (contentType.includes('image')) {
      const image = contentType.includes('png') 
        ? await mergedPdf.embedPng(arrayBuffer) 
        : await mergedPdf.embedJpg(arrayBuffer);
      
      const page = mergedPdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `Raport_Utuh_${namaSiswa}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
