import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import { InspectionFormData, MONTHS, MONTH_FULL_NAMES, INSPECTION_ITEMS, Month, AIR_BRAKE_ITEMS, HYDRAULIC_BRAKE_ITEMS } from '@/types/inspection';
import { formatDateForPDF, getMonthAbbreviation } from './dateUtils';

// Page dimensions (Letter size - Landscape)
const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;

// Colors
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const RED = rgb(0.7, 0, 0);
const BLUE = rgb(0, 0, 0.7);

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
  const marginTop = 18;
  
  // === HEADER SECTION ===
  let currentY = PAGE_HEIGHT - marginTop;

  // Title - left side
  page.drawText('STATE OF CALIFORNIA', {
    x: marginLeft,
    y: currentY,
    size: TEXT_SIZE,
    font: font,
    color: BLACK,
  });

  currentY -= 8;
  page.drawText('DEPARTMENT OF CALIFORNIA HIGHWAY PATROL', {
    x: marginLeft,
    y: currentY,
    size: TEXT_SIZE,
    font: font,
    color: BLACK,
  });

  currentY -= 11;
  page.drawText('BUS MAINTENANCE & SAFETY INSPECTION', {
    x: marginLeft,
    y: currentY,
    size: TITLE_SIZE,
    font: boldFont,
    color: BLACK,
  });

  currentY -= 9;
  page.drawText('CHP 108A (Rev. 7-05) OPI 062', {
    x: marginLeft,
    y: currentY,
    size: TEXT_SIZE,  // Increased from SMALL_SIZE
    font: font,
    color: BLACK,
  });

  // CVC note on right side - aligned to top right
  page.drawText('* Inspection of these items meet the minimum requirements of 34505 CVC', {
    x: PAGE_WIDTH - marginRight - 285,
    y: PAGE_HEIGHT - marginTop,
    size: SMALL_SIZE,
    font: font,
    color: RED,
  });
  
  // === VEHICLE INFO AND TABLE HEADER SECTION ===
  currentY -= 10;
  const headerRow1Height = 20;
  const headerRow2Height = 20;

  // Column widths
  const itemNumWidth = 20;
  const itemDescWidth = 240;
  const monthColWidth = 42;
  const okDefWidth = monthColWidth / 2;

  const tableStartX = marginLeft;
  const tableStartY = currentY;

  // === ROW 1: CARRIER NAME | UNIT NUMBER | MILEAGE×12 ===
  let colX = tableStartX;

  // CARRIER NAME (wider)
  const carrierWidth = 180;
  drawRect(page, colX, currentY - headerRow1Height, carrierWidth, headerRow1Height);
  page.drawText('CARRIER NAME', {
    x: colX + 3,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.carrierName || '', {
    x: colX + 3,
    y: currentY - 16,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += carrierWidth;

  // UNIT NUMBER
  const unitWidth = 80;
  drawRect(page, colX, currentY - headerRow1Height, unitWidth, headerRow1Height);
  page.drawText('UNIT NUMBER', {
    x: colX + 3,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.unitNumber || '', {
    x: colX + 3,
    y: currentY - 16,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += unitWidth;

  // 12 MILEAGE headers
  for (let i = 0; i < 12; i++) {
    const month = MONTHS[i];
    drawRect(page, colX, currentY - headerRow1Height, monthColWidth, headerRow1Height);
    page.drawText('MILEAGE', {
      x: colX + 2,
      y: currentY - 6,
      size: TINY_SIZE,
      font: font,
      color: BLUE,
    });
    // Add mileage value
    const mileage = months[month].mileage;
    if (mileage) {
      drawCenteredText(page, mileage, colX, currentY - 16, monthColWidth, font, SMALL_SIZE, BLACK);
    }
    colX += monthColWidth;
  }

  // === ROW 2: Vehicle data + Month names with OK/DEF ===
  currentY -= headerRow1Height;
  colX = tableStartX;

  // Year (50), Make (130), License (80) = 260 total to match row 1
  const yearWidth = 50;
  const makeWidth = 130;
  const licenseWidth = 80;

  // YEAR
  drawRect(page, colX, currentY - headerRow2Height, yearWidth, headerRow2Height);
  page.drawText('YEAR', {
    x: colX + 3,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.year || '', {
    x: colX + 3,
    y: currentY - 16,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += yearWidth;

  // MAKE
  drawRect(page, colX, currentY - headerRow2Height, makeWidth, headerRow2Height);
  page.drawText('MAKE', {
    x: colX + 3,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.make || '', {
    x: colX + 3,
    y: currentY - 16,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += makeWidth;

  // LICENSE NUMBER
  drawRect(page, colX, currentY - headerRow2Height, licenseWidth, headerRow2Height);
  page.drawText('LICENSE NUMBER', {
    x: colX + 3,
    y: currentY - 6,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.licenseNumber || '', {
    x: colX + 3,
    y: currentY - 16,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += licenseWidth;

  // Month columns with OK/DEF
  for (let i = 0; i < 12; i++) {
    const month = MONTHS[i];
    const monthData = months[month];

    // Get display month
    const displayMonth = monthData.date
      ? getMonthAbbreviation(monthData.date)
      : month;

    // Draw full column box first
    drawRect(page, colX, currentY - headerRow2Height, monthColWidth, headerRow2Height);

    // Month name at top
    page.drawText(displayMonth, {
      x: colX + (monthColWidth / 2) - 6,
      y: currentY - 7,
      size: SMALL_SIZE,
      font: boldFont,
      color: BLUE,
    });

    // OK and DEF boxes (bottom half) - just internal dividers
    page.drawLine({
      start: { x: colX, y: currentY - (headerRow2Height / 2) },
      end: { x: colX + monthColWidth, y: currentY - (headerRow2Height / 2) },
      thickness: 0.5,
      color: BLACK,
    });
    page.drawLine({
      start: { x: colX + okDefWidth, y: currentY - (headerRow2Height / 2) },
      end: { x: colX + okDefWidth, y: currentY - headerRow2Height },
      thickness: 0.5,
      color: BLACK,
    });

    // OK and DEF labels
    drawCenteredText(page, 'OK', colX, currentY - 16, okDefWidth, font, TINY_SIZE, BLACK);
    drawCenteredText(page, 'DEF', colX + okDefWidth, currentY - 16, okDefWidth, font, TINY_SIZE, BLACK);

    colX += monthColWidth;
  }

  // Set currentY to after row 2 for the inspection items table
  currentY = tableStartY - headerRow1Height - headerRow2Height - 2;

  // Row heights for inspection items
  const dataRowHeight = 9.8;

  // === INSPECTION ITEMS (40 rows) ===
  const dataStartY = currentY;
  const hasAirBrakes = vehicle.hasAirBrakes;

  for (let row = 0; row < 40; row++) {
    const rowY = dataStartY - (row * dataRowHeight);
    const itemNum = row + 1;
    const isStarred = itemNum <= 21; // Items 1-21 have asterisks per 34505 CVC
    const isAirBrakeItem = (AIR_BRAKE_ITEMS as readonly number[]).includes(row);
    const isHydraulicBrakeItem = (HYDRAULIC_BRAKE_ITEMS as readonly number[]).includes(row);
    const isInactive = (isAirBrakeItem && !hasAirBrakes) || (isHydraulicBrakeItem && hasAirBrakes);

    // Item number cell
    drawRect(page, tableStartX, rowY - dataRowHeight, itemNumWidth, dataRowHeight);
    page.drawText(`${itemNum}.`, {
      x: tableStartX + 2,
      y: rowY - dataRowHeight + 2,
      size: TINY_SIZE,
      font: font,
      color: isInactive ? GRAY : BLACK,
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
    const textY = rowY - dataRowHeight + 2;
    const textX = tableStartX + itemNumWidth + 2;

    page.drawText(prefix + truncatedDesc, {
      x: textX,
      y: textY,
      size: TINY_SIZE,
      font: font,
      color: isInactive ? GRAY : BLACK,
    });

    // Add strike-through for inactive air brake items
    if (isInactive) {
      const textWidth = font.widthOfTextAtSize(prefix + truncatedDesc, TINY_SIZE);
      page.drawLine({
        start: { x: textX, y: textY + 2 },
        end: { x: textX + textWidth, y: textY + 2 },
        thickness: 0.5,
        color: GRAY,
      });
    }

    // Month columns with checkmarks
    for (let i = 0; i < 12; i++) {
      const month = MONTHS[i];
      const colX = tableStartX + itemNumWidth + itemDescWidth + (i * monthColWidth);

      // Draw cell border
      drawRect(page, colX, rowY - dataRowHeight, monthColWidth, dataRowHeight);

      // Draw vertical line between OK and DEF
      drawLine(page, colX + okDefWidth, rowY, colX + okDefWidth, rowY - dataRowHeight);

      // Draw checkmarks - using X character (WinAnsi compatible)
      // Skip checkmarks for inactive air brake items
      if (!isInactive) {
        const monthData = months[month];
        if (monthData.ok) {
          drawCenteredText(page, 'X', colX, rowY - dataRowHeight + 2.5, okDefWidth, font, TEXT_SIZE + 1);
        }
        if (monthData.def) {
          drawCenteredText(page, 'X', colX + okDefWidth, rowY - dataRowHeight + 2.5, okDefWidth, font, TEXT_SIZE + 1);
        }
      }
    }
  }
  
  // === SIGNATURES OF INSPECTORS SECTION ===
  // Position signature section near the bottom, above the footer
  const footerY = 15;
  const sigSectionHeight = 70; // Height needed for 3 rows of signatures + label
  let sigSectionY = footerY + sigSectionHeight;

  page.drawText('SIGNATURES OF INSPECTORS', {
    x: tableStartX,
    y: sigSectionY,
    size: SMALL_SIZE,
    font: boldFont,
    color: BLUE,
  });

  // Draw signature boxes in 3 rows of 4 months
  // Calculate width to utilize full page width: (pageWidth - margins - spacing) / 4
  const horizontalSpacing = 8;
  const availableWidth = PAGE_WIDTH - marginLeft - marginRight - (3 * horizontalSpacing);
  const sigBoxWidth = Math.floor(availableWidth / 4);
  const sigBoxHeight = 20;  // Shorter to reduce dead space
  const sigStartY = sigSectionY - 5;
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const monthIndex = row * 4 + col;
      if (monthIndex >= 12) continue;

      const month = MONTHS[monthIndex];
      const monthData = months[month];
      const boxX = tableStartX + (col * (sigBoxWidth + horizontalSpacing));
      const boxY = sigStartY - (row * (sigBoxHeight + 1));

      // Draw signature box
      drawRect(page, boxX, boxY - sigBoxHeight, sigBoxWidth, sigBoxHeight);

      // Get the actual calendar month from the date, or use the fixed month
      const displayMonth = monthData.date
        ? getMonthAbbreviation(monthData.date)
        : month;

      // Month label - centered at top in blue
      drawCenteredText(page, displayMonth, boxX, boxY - 8, sigBoxWidth, boldFont, TEXT_SIZE, BLUE);

      // Date on right side - only show if month has been signed
      // Center vertically: boxY - (sigBoxHeight / 2) - (fontSize / 2)
      if (monthData.signature) {
        const dateStr = formatDateForPDF(monthData.date);
        if (dateStr) {
          const dateFontSize = 10;
          const dateCenterY = boxY - (sigBoxHeight / 2) - (dateFontSize / 3);
          page.drawText(dateStr, {
            x: boxX + sigBoxWidth - 54,
            y: dateCenterY,
            size: dateFontSize,
            font: font,
            color: BLACK,
          });
        }
      }
      
      // Signature indicator
      if (monthData.signature) {
        console.log(`Processing signature for ${month}...`);
        try {
          // Extract base64 data from data URL (format: data:image/png;base64,...)
          const base64Match = monthData.signature.match(/^data:image\/(png|jpeg);base64,(.+)$/);
          console.log('Base64 match:', base64Match ? 'Found' : 'Not found');

          if (base64Match) {
            const base64Data = base64Match[2];
            console.log('Base64 data length:', base64Data.length);

            // Convert base64 to Uint8Array
            const binaryString = atob(base64Data);
            const sigBytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              sigBytes[i] = binaryString.charCodeAt(i);
            }
            console.log('Signature bytes length:', sigBytes.length);

            // Embed the PNG image
            const sigImage = await page.doc.embedPng(sigBytes);
            console.log('PNG embedded successfully');

            // Draw signature image in the signature box
            // Calculate aspect ratio to fit signature properly
            const sigDims = sigImage.scale(1);
            const maxWidth = sigBoxWidth - 60;  // Leave room for date on right
            const maxHeight = 13;  // Adjusted for 20px height box
            const scale = Math.min(maxWidth / sigDims.width, maxHeight / sigDims.height);

            console.log(`Drawing signature at x:${boxX + 4}, y:${boxY - sigBoxHeight + 4}, width:${sigDims.width * scale}, height:${sigDims.height * scale}`);
            page.drawImage(sigImage, {
              x: boxX + 4,
              y: boxY - sigBoxHeight + 4,
              width: sigDims.width * scale,
              height: sigDims.height * scale,
            });
            console.log('Signature drawn successfully');
          } else {
            console.error('Signature format did not match expected pattern');
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
      drawLine(page, boxX + 3, boxY - sigBoxHeight + 5, boxX + 110, boxY - sigBoxHeight + 5);
    }
  }
  
  // === FOOTER ===
  // Footer at bottom
  const footerTextY = 8;

  page.drawText('* Inspection of these items meet the minimum requirements of 34505 CVC', {
    x: marginLeft,
    y: footerTextY,
    size: TINY_SIZE,
    font: font,
    color: RED,
  });

  page.drawText('Page 1 of 4 - Generated by CHP 108A Inspector', {
    x: PAGE_WIDTH / 2 - 60,
    y: footerTextY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });

  page.drawText('Form may be reproduced privately—bulk supplies are not available from the CHP', {
    x: PAGE_WIDTH - marginRight - 220,
    y: footerTextY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
}
