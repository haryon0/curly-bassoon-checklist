const { PDFDocument, rgb, StandardFonts, PageSizes, LineCapStyle } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PT_PER_MM = 2.8346;
const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 50;
const CONTENT_W = A4_W - MARGIN * 2;

// Word-wrap helper
function wrapText(text, maxCharsPerLine) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxCharsPerLine) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Format date in Indonesian locale
function formatDateID(date) {
  const d = new Date(date);
  return d.toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Makassar',
  }) + ' WITA';
}

async function convertImageToJpeg(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    return fs.readFileSync(imagePath);
  }
  // Convert PNG/WebP to JPEG using sharp
  return await sharp(imagePath).jpeg({ quality: 85 }).toBuffer();
}

// Apply annotations from frontend onto a template page
function applyAnnotationsToPage(page, pageAnnotations, helvetica) {
  if (!pageAnnotations || pageAnnotations.length === 0) return;
  const { width: pw, height: ph } = page.getSize();
  const s = pw * 0.028; // annotation size (~2.8% of page width ≈ 16.7pt on A4)

  for (const a of pageAnnotations) {
    // Convert from normalized canvas coords (origin top-left, Y down)
    // to PDF coords (origin bottom-left, Y up)
    const px = a.normX * pw;
    const py = (1 - a.normY) * ph;

    try {
      switch (a.type) {
        case 'checkmark':
          // Two strokes: short down-right, then long up-right
          page.drawLine({ start: { x: px - s * 0.4, y: py - s * 0.1 }, end:   { x: px - s * 0.05, y: py - s * 0.45 }, thickness: 2.5, color: rgb(0.086, 0.639, 0.259), lineCap: LineCapStyle.Round });
          page.drawLine({ start: { x: px - s * 0.05, y: py - s * 0.45 }, end: { x: px + s * 0.55, y: py + s * 0.35 }, thickness: 2.5, color: rgb(0.086, 0.639, 0.259), lineCap: LineCapStyle.Round });
          break;
        case 'crossmark':
          page.drawLine({ start: { x: px - s * 0.4, y: py + s * 0.4 }, end: { x: px + s * 0.4, y: py - s * 0.4 }, thickness: 2.5, color: rgb(0.863, 0.149, 0.149), lineCap: LineCapStyle.Round });
          page.drawLine({ start: { x: px + s * 0.4, y: py + s * 0.4 }, end: { x: px - s * 0.4, y: py - s * 0.4 }, thickness: 2.5, color: rgb(0.863, 0.149, 0.149), lineCap: LineCapStyle.Round });
          break;
        case 'dot':
          page.drawCircle({ x: px, y: py, size: s * 0.22, color: rgb(0.067, 0.090, 0.149) });
          break;
        case 'circle':
          page.drawEllipse({ x: px, y: py, xScale: s * 0.9, yScale: s * 0.55, borderColor: rgb(0.851, 0.604, 0.024), borderWidth: 2.0 });
          break;
        case 'crossout':
          page.drawLine({ start: { x: px - s * 1.3, y: py }, end: { x: px + s * 1.3, y: py }, thickness: 2.0, color: rgb(0.486, 0.227, 0.863), lineCap: LineCapStyle.Round });
          break;
        case 'text':
          if (a.text) {
            page.drawText(a.text, { x: px, y: py - s * 0.3, size: Math.max(8, s * 0.72), font: helvetica, color: rgb(0.114, 0.306, 0.871) });
          }
          break;
      }
    } catch (e) {
      console.warn(`Annotation draw error (type=${a.type}):`, e.message);
    }
  }
}

async function generateChecklistPdf({ templatePath, photos, submissionData, annotations, outputPath }) {
  // Load or create base PDF
  let pdfDoc;
  if (templatePath && fs.existsSync(templatePath)) {
    const templateBytes = fs.readFileSync(templatePath);
    pdfDoc = await PDFDocument.load(templateBytes);
  } else {
    pdfDoc = await PDFDocument.create();
    // If no template, create a placeholder first page
    const page = pdfDoc.addPage([A4_W, A4_H]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText('CHECKLIST TEMPLATE', {
      x: MARGIN,
      y: A4_H / 2,
      size: 24,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText('(Template PDF belum diupload)', {
      x: MARGIN,
      y: A4_H / 2 - 30,
      size: 14,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ── Apply annotations onto template pages ──────────────────
  if (annotations && typeof annotations === 'object') {
    const templatePageCount = templatePath && fs.existsSync(templatePath)
      ? (await PDFDocument.load(fs.readFileSync(templatePath))).getPageCount()
      : 1;
    for (let i = 0; i < templatePageCount; i++) {
      const pageNum = String(i + 1); // frontend uses 1-based page numbers as keys
      const pageAnnots = annotations[pageNum] || annotations[i + 1] || [];
      if (pageAnnots.length > 0) {
        applyAnnotationsToPage(pdfDoc.getPage(i), pageAnnots, helvetica);
      }
    }
  }

  // Brand colors
  const brandBlue = rgb(0.063, 0.416, 0.620);   // #1069a0
  const darkGray = rgb(0.2, 0.2, 0.2);
  const medGray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.85, 0.85, 0.85);
  const white = rgb(1, 1, 1);

  // ─── Photo Pages ───────────────────────────────────────────────
  const MAX_IMG_W = CONTENT_W;
  const MAX_IMG_H = A4_H - 180; // leave room for header + caption

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const page = pdfDoc.addPage([A4_W, A4_H]);

    // Header bar
    page.drawRectangle({ x: 0, y: A4_H - 60, width: A4_W, height: 60, color: brandBlue });
    page.drawText('PHOTO DOCUMENTATION', {
      x: MARGIN,
      y: A4_H - 38,
      size: 16,
      font: helveticaBold,
      color: white,
    });
    page.drawText(`Photo ${i + 1} of ${photos.length}`, {
      x: A4_W - MARGIN - 90,
      y: A4_H - 38,
      size: 12,
      font: helvetica,
      color: white,
    });

    // Checklist title subtitle
    page.drawText(submissionData.title || '', {
      x: MARGIN,
      y: A4_H - 75,
      size: 9,
      font: helvetica,
      color: medGray,
    });

    // Embed image
    let imgBytes;
    try {
      imgBytes = await convertImageToJpeg(photo.path);
    } catch (e) {
      console.error(`Failed to process image ${photo.path}:`, e.message);
      page.drawText(`[Image could not be loaded: ${photo.caption || path.basename(photo.path)}]`, {
        x: MARGIN,
        y: A4_H / 2,
        size: 12,
        font: helvetica,
        color: rgb(0.7, 0.2, 0.2),
      });
      continue;
    }

    let embeddedImg;
    try {
      embeddedImg = await pdfDoc.embedJpg(imgBytes);
    } catch {
      // Fallback: try PNG
      try {
        const pngBytes = fs.readFileSync(photo.path);
        embeddedImg = await pdfDoc.embedPng(pngBytes);
      } catch (e) {
        console.error(`Failed to embed image:`, e.message);
        continue;
      }
    }

    const { width: imgW, height: imgH } = embeddedImg;
    const scaleW = MAX_IMG_W / imgW;
    const scaleH = MAX_IMG_H / imgH;
    const scale = Math.min(scaleW, scaleH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    // Caption area height estimate
    const captionLines = wrapText(photo.caption || '', 90);
    const captionHeight = captionLines.length * 14 + 20;

    const imgX = MARGIN + (CONTENT_W - drawW) / 2;
    const captionY = 40;
    const imgY = captionY + captionHeight + 10;

    page.drawImage(embeddedImg, { x: imgX, y: imgY, width: drawW, height: drawH });

    // Photo border
    page.drawRectangle({
      x: imgX - 1,
      y: imgY - 1,
      width: drawW + 2,
      height: drawH + 2,
      borderColor: lightGray,
      borderWidth: 1,
    });

    // Caption
    if (captionLines.length > 0) {
      page.drawRectangle({ x: MARGIN, y: captionY - 5, width: CONTENT_W, height: captionHeight, color: rgb(0.97, 0.97, 0.97) });
      page.drawText('Caption:', { x: MARGIN + 8, y: captionY + captionHeight - 16, size: 8, font: helveticaBold, color: medGray });
      captionLines.forEach((line, li) => {
        page.drawText(line, {
          x: MARGIN + 8,
          y: captionY + captionHeight - 28 - li * 13,
          size: 10,
          font: helvetica,
          color: darkGray,
        });
      });
    }
  }

  // ─── Submission Details Page ────────────────────────────────────
  const detailPage = pdfDoc.addPage([A4_W, A4_H]);

  // Header bar
  detailPage.drawRectangle({ x: 0, y: A4_H - 60, width: A4_W, height: 60, color: brandBlue });
  detailPage.drawText('SUBMISSION DETAILS', {
    x: MARGIN,
    y: A4_H - 38,
    size: 16,
    font: helveticaBold,
    color: white,
  });

  // Company name
  detailPage.drawText('PT. LOMBOK TOROK DEVELOPMENTS', {
    x: A4_W - MARGIN - 210,
    y: A4_H - 38,
    size: 9,
    font: helveticaBold,
    color: rgb(0.8, 0.9, 1),
  });

  let y = A4_H - 100;

  // Title block
  detailPage.drawRectangle({ x: MARGIN, y: y - 8, width: CONTENT_W, height: 36, color: rgb(0.94, 0.97, 1) });
  detailPage.drawText('CHECKLIST TITLE', { x: MARGIN + 10, y: y + 16, size: 8, font: helveticaBold, color: brandBlue });
  detailPage.drawText(submissionData.title || '-', { x: MARGIN + 10, y: y, size: 13, font: helveticaBold, color: darkGray });
  y -= 50;

  // Detail rows
  const rows = [
    ['Template', submissionData.templateName || '-'],
    ['Template Code', submissionData.templateCode || '-'],
    ['Location', submissionData.location || '-'],
    ['Submitted By', submissionData.fullName || '-'],
    ['Username', submissionData.username || '-'],
    ['Submission Date', formatDateID(submissionData.submittedAt)],
    ['Total Photos', `${photos.length} photo(s)`],
  ];

  rows.forEach(([label, value], idx) => {
    const rowBg = idx % 2 === 0 ? rgb(0.97, 0.97, 0.97) : white;
    detailPage.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_W, height: 24, color: rowBg });
    detailPage.drawText(label, { x: MARGIN + 10, y: y + 6, size: 9, font: helveticaBold, color: medGray });
    detailPage.drawText(':', { x: MARGIN + 140, y: y + 6, size: 9, font: helvetica, color: medGray });
    detailPage.drawText(String(value), { x: MARGIN + 155, y: y + 6, size: 10, font: helvetica, color: darkGray });
    y -= 26;
  });

  y -= 15;

  // Notes block
  if (submissionData.notes) {
    detailPage.drawText('NOTES / REMARKS', { x: MARGIN, y: y, size: 9, font: helveticaBold, color: brandBlue });
    y -= 14;
    const noteLines = wrapText(submissionData.notes, 90);
    const notesH = noteLines.length * 14 + 16;
    detailPage.drawRectangle({ x: MARGIN, y: y - notesH + 10, width: CONTENT_W, height: notesH, color: rgb(0.97, 0.97, 0.97), borderColor: lightGray, borderWidth: 1 });
    noteLines.forEach((line, li) => {
      detailPage.drawText(line, { x: MARGIN + 10, y: y - 4 - li * 14, size: 10, font: helvetica, color: darkGray });
    });
    y -= notesH + 20;
  }

  // Footer
  detailPage.drawLine({ start: { x: MARGIN, y: 60 }, end: { x: A4_W - MARGIN, y: 60 }, thickness: 1, color: lightGray });
  detailPage.drawText('Generated by Checklist Management System — PT. Lombok Torok Developments', {
    x: MARGIN,
    y: 45,
    size: 8,
    font: helvetica,
    color: medGray,
  });
  detailPage.drawText(formatDateID(new Date()), {
    x: A4_W - MARGIN - 200,
    y: 45,
    size: 8,
    font: helvetica,
    color: medGray,
  });

  // Page numbers on all new pages (after template pages)
  const totalPages = pdfDoc.getPageCount();
  const templatePageCount = templatePath && fs.existsSync(templatePath)
    ? (await PDFDocument.load(fs.readFileSync(templatePath))).getPageCount()
    : 1;

  for (let i = templatePageCount; i < totalPages; i++) {
    const pg = pdfDoc.getPage(i);
    pg.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: A4_W / 2 - 30,
      y: 25,
      size: 8,
      font: helvetica,
      color: medGray,
    });
  }

  // Save
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return { size: pdfBytes.length };
}

module.exports = { generateChecklistPdf };
