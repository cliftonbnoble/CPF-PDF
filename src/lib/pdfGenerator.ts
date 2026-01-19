import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import { InspectionFormData, MONTHS, MONTH_FULL_NAMES, INSPECTION_ITEMS, Month } from '@/types/inspection';
import { formatDateForPDF } from './dateUtils';

// Page dimensions (Letter size - Landscape)
const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;

// Colors
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const RED = rgb(0.7, 0, 0);

// Font sizes
const TITLE_SIZE = 12;
const HEADER_SIZE = 8;
const TEXT_SIZE = 7;
const SMALL_SIZE = 6;
const TINY_SIZE = 5.5;

/**
 * Generate a filled CHP 108A PDF from form data - matching official CHP layout
 */
export async function generatePDF(formData: InspectionFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add Page 1 - Monthly Inspection Checklist (Landscape)
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  await drawPage1(page1, formData, helvetica, helveticaBold);

  return pdfDoc.save();
}

// Helper to draw a rectangle (border only)
function drawRect(page: PDFPage, x: number, y: number, width: number, height: number, lineWidth = 0.5) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: BLACK,
    borderWidth: lineWidth,
  });
}

// Helper to draw a line
function drawLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number, lineWidth = 0.5) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness: lineWidth,
    color: BLACK,
  });
}

// Helper to center text in a box
function drawCenteredText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  size: number,
  color = BLACK
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const centeredX = x + (width - textWidth) / 2;
  page.drawText(text, { x: centeredX, y, size, font, color });
}

async function drawPage1(
  page: PDFPage,
  formData: InspectionFormData,
  font: PDFFont,
  boldFont: PDFFont
) {
  const { vehicle, months } = formData;
  
  // Margins
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 25;
  
  // === HEADER SECTION ===
  let currentY = PAGE_HEIGHT - marginTop;
  
  // Title - left side
  page.drawText('STATE OF CALIFORNIA', {
    x: marginLeft,
    y: currentY,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  
  currentY -= 8;
  page.drawText('DEPARTMENT OF CALIFORNIA HIGHWAY PATROL', {
    x: marginLeft,
    y: currentY,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  
  currentY -= 12;
  page.drawText('BUS MAINTENANCE & SAFETY INSPECTION', {
    x: marginLeft,
    y: currentY,
    size: TITLE_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  currentY -= 10;
  page.drawText('CHP 108A (Rev. 7-05) OPI 062', {
    x: marginLeft,
    y: currentY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
  
  // CVC note on right side
  page.drawText('* Inspection of these items meet the minimum requirements of 34505 CVC', {
    x: PAGE_WIDTH - marginRight - 240,
    y: currentY,
    size: TINY_SIZE,
    font: font,
    color: RED,
  });
  
  // === VEHICLE INFO SECTION ===
  currentY -= 18;
  const vehicleRowHeight = 22;
  
  // Row 1: Carrier Name and Unit Number
  const carrierWidth = 250;
  const unitNumX = marginLeft + carrierWidth + 30;
  
  // Carrier Name
  drawRect(page, marginLeft, currentY - vehicleRowHeight, carrierWidth, vehicleRowHeight);
  page.drawText('CARRIER NAME', {
    x: marginLeft + 2,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
  page.drawText(vehicle.carrierName || '', {
    x: marginLeft + 60,
    y: currentY - 6,
    size: TEXT_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  // Unit Number
  drawRect(page, unitNumX, currentY - vehicleRowHeight, 100, vehicleRowHeight);
  page.drawText('UNIT NUMBER', {
    x: unitNumX + 2,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
  page.drawText(vehicle.unitNumber || '', {
    x: unitNumX + 60,
    y: currentY - 6,
    size: TEXT_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  // Row 2: Year, Make, License Number
  currentY -= vehicleRowHeight + 2;
  
  // Year
  drawRect(page, marginLeft, currentY - vehicleRowHeight, 60, vehicleRowHeight);
  page.drawText('YEAR', {
    x: marginLeft + 2,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
  page.drawText(vehicle.year || '', {
    x: marginLeft + 30,
    y: currentY - 6,
    size: TEXT_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  // Make
  drawRect(page, marginLeft + 60, currentY - vehicleRowHeight, 120, vehicleRowHeight);
  page.drawText('MAKE', {
    x: marginLeft + 62,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
  page.drawText(vehicle.make || '', {
    x: marginLeft + 90,
    y: currentY - 6,
    size: TEXT_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  // License Number
  drawRect(page, marginLeft + 180, currentY - vehicleRowHeight, 100, vehicleRowHeight);
  page.drawText('LICENSE NUMBER', {
    x: marginLeft + 182,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
  page.drawText(vehicle.licenseNumber || '', {
    x: marginLeft + 250,
    y: currentY - 6,
    size: TEXT_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  // === MAIN INSPECTION TABLE ===
  currentY -= vehicleRowHeight + 8;
  const tableStartY = currentY;
  const tableStartX = marginLeft;
  
  // Column widths
  const itemNumWidth = 20;
  const itemDescWidth = 240;
  const monthColWidth = 42;
  const okDefWidth = monthColWidth / 2;

  // Row heights
  const headerRowHeight = 20;
  const dataRowHeight = 9.8;
  
  // Calculate table dimensions
  const totalMonthsWidth = monthColWidth * 12;
  const tableWidth = itemNumWidth + itemDescWidth + totalMonthsWidth;
  
  // === HEADER ROW (Month names with OK/DEF) ===
  const headerY = tableStartY;
  
  // Item number/description header area (spans two rows visually)
  drawRect(page, tableStartX, headerY - headerRowHeight, itemNumWidth + itemDescWidth, headerRowHeight);
  
  // Month column headers with Mileage row above
  for (let i = 0; i < 12; i++) {
    const month = MONTHS[i];
    const colX = tableStartX + itemNumWidth + itemDescWidth + (i * monthColWidth);
    
    // Mileage cell (top)
    drawRect(page, colX, headerY - 10, monthColWidth, 10);
    page.drawText('MILEAGE', {
      x: colX + 3,
      y: headerY - 8,
      size: 4,
      font: font,
      color: GRAY,
    });
    
    // Mileage value
    const mileage = months[month].mileage;
    if (mileage) {
      page.drawText(mileage, {
        x: colX + 20,
        y: headerY - 8,
        size: 4,
        font: font,
        color: BLACK,
      });
    }
    
    // Month header box (below mileage)
    drawRect(page, colX, headerY - headerRowHeight, monthColWidth, 10);
    
    // Month name centered
    drawCenteredText(page, month, colX, headerY - 17, monthColWidth, boldFont, SMALL_SIZE);
    
    // OK/DEF sub-header
    drawCenteredText(page, 'OK', colX, headerY - headerRowHeight + 2, okDefWidth, font, 4);
    drawCenteredText(page, 'DEF', colX + okDefWidth, headerY - headerRowHeight + 2, okDefWidth, font, 4);
    
    // Vertical line between OK and DEF in header
    drawLine(page, colX + okDefWidth, headerY - 10, colX + okDefWidth, headerY - headerRowHeight);
  }
  
  // === INSPECTION ITEMS (40 rows) ===
  const dataStartY = headerY - headerRowHeight;
  
  for (let row = 0; row < 40; row++) {
    const rowY = dataStartY - (row * dataRowHeight);
    const itemNum = row + 1;
    const isStarred = itemNum <= 21; // Items 1-21 have asterisks per 34505 CVC
    
    // Item number cell
    drawRect(page, tableStartX, rowY - dataRowHeight, itemNumWidth, dataRowHeight);
    page.drawText(`${itemNum}.`, {
      x: tableStartX + 2,
      y: rowY - dataRowHeight + 2,
      size: TINY_SIZE,
      font: font,
      color: BLACK,
    });
    
    // Item description cell
    drawRect(page, tableStartX + itemNumWidth, rowY - dataRowHeight, itemDescWidth, dataRowHeight);
    
    // Truncate long descriptions to fit
    const desc: string = INSPECTION_ITEMS[row];
    const maxDescWidth = itemDescWidth - 8;
    let truncatedDesc: string = desc;
    while (font.widthOfTextAtSize(truncatedDesc, TINY_SIZE) > maxDescWidth && truncatedDesc.length > 0) {
      truncatedDesc = truncatedDesc.slice(0, -1);
    }
    if (truncatedDesc.length < desc.length) {
      truncatedDesc = truncatedDesc.slice(0, -3) + '...';
    }
    
    // Add asterisk for CVC items
    const prefix = isStarred ? '* ' : '  ';
    page.drawText(prefix + truncatedDesc, {
      x: tableStartX + itemNumWidth + 2,
      y: rowY - dataRowHeight + 2,
      size: TINY_SIZE,
      font: font,
      color: BLACK,
    });
    
    // Month columns with checkmarks
    for (let i = 0; i < 12; i++) {
      const month = MONTHS[i];
      const colX = tableStartX + itemNumWidth + itemDescWidth + (i * monthColWidth);
      
      // Draw cell border
      drawRect(page, colX, rowY - dataRowHeight, monthColWidth, dataRowHeight);
      
      // Draw vertical line between OK and DEF
      drawLine(page, colX + okDefWidth, rowY, colX + okDefWidth, rowY - dataRowHeight);
      
      // Draw checkmarks - using X character (WinAnsi compatible)
      const monthData = months[month];
      if (monthData.ok) {
        drawCenteredText(page, 'X', colX, rowY - dataRowHeight + 2.5, okDefWidth, font, TEXT_SIZE + 1);
      }
      if (monthData.def) {
        drawCenteredText(page, 'X', colX + okDefWidth, rowY - dataRowHeight + 2.5, okDefWidth, font, TEXT_SIZE + 1);
      }
    }
  }
  
  // === INSPECTION DATES SECTION ===
  const tableEndY = dataStartY - (40 * dataRowHeight);
  let sigSectionY = tableEndY - 12;
  
  page.drawText('INSPECTION DATES:', {
    x: tableStartX,
    y: sigSectionY,
    size: SMALL_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  // Draw inspection dates in 3 rows of 4 months
  const dateBoxWidth = 170;
  const dateBoxHeight = 12;
  sigSectionY -= 5;
  
  for (let row = 0; row < 3; row++) {
    const rowY = sigSectionY - (row * (dateBoxHeight + 2));
    
    for (let col = 0; col < 4; col++) {
      const monthIndex = row * 4 + col;
      if (monthIndex >= 12) continue;
      
      const month = MONTHS[monthIndex];
      const monthData = months[month];
      const boxX = tableStartX + (col * (dateBoxWidth + 10));
      
      // Month name label
      page.drawText(`${MONTH_FULL_NAMES[month].toUpperCase()}:`, {
        x: boxX,
        y: rowY - 8,
        size: TINY_SIZE,
        font: boldFont,
        color: BLACK,
      });
      
      // Date value
      const dateStr = formatDateForPDF(monthData.date);
      if (dateStr) {
        page.drawText(dateStr, {
          x: boxX + 55,
          y: rowY - 8,
          size: TINY_SIZE,
          font: font,
          color: BLACK,
        });
      }
    }
  }
  
  // === SIGNATURES OF INSPECTORS SECTION ===
  sigSectionY -= (3 * (dateBoxHeight + 2)) + 10;
  
  page.drawText('SIGNATURES OF INSPECTORS', {
    x: tableStartX,
    y: sigSectionY,
    size: SMALL_SIZE,
    font: boldFont,
    color: BLACK,
  });
  
  // Draw signature boxes in 3 rows of 4 months
  const sigBoxWidth = 170;
  const sigBoxHeight = 25;
  const sigStartY = sigSectionY - 5;
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const monthIndex = row * 4 + col;
      if (monthIndex >= 12) continue;
      
      const month = MONTHS[monthIndex];
      const monthData = months[month];
      const boxX = tableStartX + (col * (sigBoxWidth + 10));
      const boxY = sigStartY - (row * (sigBoxHeight + 3));
      
      // Draw signature box
      drawRect(page, boxX, boxY - sigBoxHeight, sigBoxWidth, sigBoxHeight);
      
      // Month label
      page.drawText(`${month} INSPECTION`, {
        x: boxX + 2,
        y: boxY - 8,
        size: TINY_SIZE,
        font: boldFont,
        color: BLACK,
      });
      
      // Date label and value on right
      page.drawText('DATE', {
        x: boxX + sigBoxWidth - 45,
        y: boxY - 8,
        size: TINY_SIZE,
        font: font,
        color: BLACK,
      });
      
      const dateStr = formatDateForPDF(monthData.date);
      if (dateStr) {
        page.drawText(dateStr, {
          x: boxX + sigBoxWidth - 45,
          y: boxY - 18,
          size: TINY_SIZE,
          font: font,
          color: BLACK,
        });
      }
      
      // Signature indicator
      if (monthData.signature) {
        try {
          // Extract base64 data from data URL (format: data:image/png;base64,...)
          const base64Match = monthData.signature.match(/^data:image\/(png|jpeg);base64,(.+)$/);
          if (base64Match) {
            const base64Data = base64Match[2];

            // Convert base64 to Uint8Array
            const binaryString = atob(base64Data);
            const sigBytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              sigBytes[i] = binaryString.charCodeAt(i);
            }

            // Embed the PNG image
            const sigImage = await page.doc.embedPng(sigBytes);

            // Draw signature image in the signature box
            // Calculate aspect ratio to fit signature properly
            const sigDims = sigImage.scale(1);
            const maxWidth = 60;
            const maxHeight = 15;
            const scale = Math.min(maxWidth / sigDims.width, maxHeight / sigDims.height);

            page.drawImage(sigImage, {
              x: boxX + 4,
              y: boxY - sigBoxHeight + 4,
              width: sigDims.width * scale,
              height: sigDims.height * scale,
            });
          }
        } catch (error) {
          console.error('Failed to embed signature:', error);
          // Fallback - draw signature line with [Signed] text
          page.drawText('[Signed]', {
            x: boxX + 5,
            y: boxY - 20,
            size: TINY_SIZE,
            font: font,
            color: BLACK,
          });
        }
      }
      
      // Draw signature line
      drawLine(page, boxX + 3, boxY - sigBoxHeight + 5, boxX + 65, boxY - sigBoxHeight + 5);
    }
  }
  
  // === FOOTER ===
  const footerY = 15;
  
  page.drawText('* Inspection of these items meet the minimum requirements of 34505 CVC', {
    x: marginLeft,
    y: footerY,
    size: TINY_SIZE,
    font: font,
    color: RED,
  });
  
  page.drawText('Page 1 of 4 - Generated by CHP 108A Inspector', {
    x: PAGE_WIDTH / 2 - 60,
    y: footerY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
  
  page.drawText('Form may be reproduced privately—bulk supplies are not available from the CHP', {
    x: PAGE_WIDTH - marginRight - 220,
    y: footerY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
}
