const { createCanvas } = require('@napi-rs/canvas');
const { createWorker } = require('tesseract.js');

async function renderPdfPages(buffer, maxPages) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), disableWorker: true, verbosity: 0 });
  const pdf = await loadingTask.promise;
  const pages = [];
  const pageCount = Math.min(pdf.numPages, maxPages);
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    pages.push(canvas.toBuffer('image/png'));
  }
  return pages;
}

async function extractPdfTextWithOcr(buffer, existingText = '') {
  if (!buffer || !Buffer.isBuffer(buffer)) return { text: existingText || '', provider: 'none', pages: 0 };
  const minimumText = Number(process.env.OCR_MIN_TEXT || 120);
  if (existingText.trim().length >= minimumText || process.env.OCR_ENABLED === 'false') {
    return { text: existingText.trim(), provider: existingText.trim() ? 'pdf-text' : 'none', pages: 0 };
  }

  const maxPages = Math.max(1, Number(process.env.OCR_MAX_PAGES || 20));
  let images;
  try {
    images = await renderPdfPages(buffer, maxPages);
  } catch (error) {
    console.warn(`PDF rendering failed; continuing without OCR: ${error.message}`);
    return { text: existingText.trim(), provider: existingText.trim() ? 'pdf-text' : 'unavailable', pages: 0 };
  }

  const worker = await createWorker('eng');
  try {
    const pages = [];
    for (const image of images) {
      const result = await worker.recognize(image);
      pages.push(result.data.text);
    }
    const text = pages.join(' ').replace(/\s+/g, ' ').trim();
    return { text, provider: text ? 'tesseract-ocr' : 'unavailable', pages: images.length };
  } finally {
    await worker.terminate();
  }
}

module.exports = { extractPdfTextWithOcr };
