import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import { InspectionFormData, MONTHS, MONTH_FULL_NAMES, INSPECTION_ITEMS, Month, AIR_BRAKE_ITEMS, HYDRAULIC_BRAKE_ITEMS, FLEET_VEHICLES } from '@/types/inspection';
import { formatDateForPDF, getMonthAbbreviation } from './dateUtils';

// Page dimensions (Letter size - Landscape)
const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;

// Colors
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.9, 0.9, 0.9); // Light gray for table headers
const RED = rgb(0.7, 0, 0);
const BLUE = rgb(0, 0, 0.7);
const LIGHT_BLUE = rgb(0.85, 0.9, 0.95); // Light blue/gray for checkbox background

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

  // Get the form for creating interactive checkboxes
  const form = pdfDoc.getForm();

  // Add Page 1 - Monthly Inspection Checklist (Landscape)
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  await drawPage1(page1, formData, helvetica, helveticaBold, form);

  // Collect all DEF items across all months
  const defItems = collectDefItems(formData);

  // Add Repair Report pages (only if there are DEF items)
  if (defItems.length > 0) {
    const rowsPerPage = 30;
    const totalRepairPages = Math.ceil(defItems.length / rowsPerPage);
    const totalPages = 1 + totalRepairPages; // Page 1 + repair pages

    // Create repair report pages (starting at page 4 to match CHP form numbering)
    for (let pageIndex = 0; pageIndex < totalRepairPages; pageIndex++) {
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      const startIdx = pageIndex * rowsPerPage;
      const endIdx = Math.min(startIdx + rowsPerPage, defItems.length);
      const pageDefItems = defItems.slice(startIdx, endIdx);
      const currentPageNum = 4 + pageIndex; // Start at page 4
      const totalPageNum = 3 + totalRepairPages; // Total is 3 + number of repair pages

      await drawRepairReportPage(
        page,
        formData,
        pageDefItems,
        helvetica,
        helveticaBold,
        form,
        currentPageNum,
        totalPageNum,
        startIdx
      );
    }
  }

  return pdfDoc.save();
}

// Helper to collect all DEF items across all months (no duplicates)
interface DefItem {
  itemIndex: number;
  itemDescription: string;
  month: Month;
  date: string;
  mileage: string;
}

function collectDefItems(formData: InspectionFormData): DefItem[] {
  const defItems: DefItem[] = [];
  const seenItems = new Set<number>();

  // Iterate through each month
  for (const month of MONTHS) {
    const monthData = formData.months[month];

    // Check if month is marked as DEF
    if (monthData.def) {
      // All items are DEF for this month - add all 40 items (if not already seen)
      for (let i = 0; i < 40; i++) {
        if (!seenItems.has(i)) {
          defItems.push({
            itemIndex: i,
            itemDescription: INSPECTION_ITEMS[i],
            month,
            date: monthData.date,
            mileage: monthData.mileage,
          });
          seenItems.add(i);
        }
      }
    }

    // Check if there are random DEF items for this month
    if (monthData.randomDefItems && monthData.randomDefItems.length > 0) {
      for (const itemIndex of monthData.randomDefItems) {
        if (!seenItems.has(itemIndex)) {
          defItems.push({
            itemIndex,
            itemDescription: INSPECTION_ITEMS[itemIndex],
            month,
            date: monthData.date,
            mileage: monthData.mileage,
          });
          seenItems.add(itemIndex);
        }
      }
    }
  }

  return defItems;
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
  boldFont: PDFFont,
  form: ReturnType<PDFDocument['getForm']>
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
  currentY -= 4;
  const headerRow1Height = 16;  // Reduced from 20 to save space
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
    y: currentY - 5,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.carrierName || '', {
    x: colX + 3,
    y: currentY - 13,
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
    y: currentY - 5,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.unitNumber || '', {
    x: colX + 3,
    y: currentY - 13,
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
      y: currentY - 5,
      size: TINY_SIZE,
      font: font,
      color: BLUE,
    });
    // Add mileage value
    const mileage = months[month].mileage;
    if (mileage) {
      drawCenteredText(page, mileage, colX, currentY - 13, monthColWidth, font, SMALL_SIZE, BLACK);
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
  currentY = tableStartY - headerRow1Height - headerRow2Height;  // Removed -2 gap to save space

  // Row heights for inspection items
  const dataRowHeight = 10.8;

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
      y: rowY - (dataRowHeight / 2) - (TINY_SIZE / 2),
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
    const textY = rowY - (dataRowHeight / 2) - (TINY_SIZE / 2);
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

      // Create interactive checkboxes for OK and DEF
      // Skip for inactive air brake items
      if (!isInactive) {
        const monthData = months[month];

        // Calculate checkbox size and position
        const checkboxSize = 8;
        const okCheckboxX = colX + (okDefWidth / 2) - (checkboxSize / 2);
        const defCheckboxX = colX + okDefWidth + (okDefWidth / 2) - (checkboxSize / 2);
        const checkboxY = rowY - (dataRowHeight / 2) - (checkboxSize / 2);

        // Check if this item is in the random DEF items for this month
        const isRandomDef = monthData.randomDefItems && monthData.randomDefItems.includes(row);

        // Create OK checkbox with light blue background and dark blue checkmark
        const okCheckbox = form.createCheckBox(`item${itemNum}.${month}.ok`);
        okCheckbox.addToPage(page, {
          x: okCheckboxX,
          y: checkboxY,
          width: checkboxSize,
          height: checkboxSize,
          borderWidth: 0.5,
          borderColor: BLUE,
          backgroundColor: LIGHT_BLUE,
          textColor: BLUE, // Checkmark color
        });
        // Pre-check OK if: manually marked OK, OR has percentage selected but this item is NOT in randomDefItems
        if (monthData.ok && !isRandomDef) {
          okCheckbox.check();
        }

        // Create DEF checkbox with light blue background and dark blue checkmark
        const defCheckbox = form.createCheckBox(`item${itemNum}.${month}.def`);
        defCheckbox.addToPage(page, {
          x: defCheckboxX,
          y: checkboxY,
          width: checkboxSize,
          height: checkboxSize,
          borderWidth: 0.5,
          borderColor: BLUE,
          backgroundColor: LIGHT_BLUE,
          textColor: BLUE, // Checkmark color
        });
        // Pre-check DEF if: manually marked DEF, OR this item is in randomDefItems
        if (monthData.def || isRandomDef) {
          defCheckbox.check();
        }
      }
    }
  }
  
  // === SIGNATURES OF INSPECTORS SECTION ===
  // Position signature section near the bottom, above the footer
  const footerY = 15;
  const sigSectionHeight = 62; // Reduced from 70 - tighter spacing for signature boxes
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
  const sigBoxHeight = 18;  // Reduced from 20 to save space
  const sigStartY = sigSectionY - 2;  // Reduced from -5 to bring boxes closer to title

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const monthIndex = row * 4 + col;
      if (monthIndex >= 12) continue;

      const month = MONTHS[monthIndex];
      const monthData = months[month];
      const boxX = tableStartX + (col * (sigBoxWidth + horizontalSpacing));
      const boxY = sigStartY - (row * (sigBoxHeight + 0.5));  // Reduced spacing from +1 to +0.5

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

async function drawRepairReportPage(
  page: PDFPage,
  formData: InspectionFormData,
  defItems: DefItem[],
  font: PDFFont,
  boldFont: PDFFont,
  form: ReturnType<PDFDocument['getForm']>,
  currentPageNum: number,
  totalPageNum: number,
  startRowIndex: number
) {
  const { vehicle } = formData;

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

  currentY -= 12;
  page.drawText('REPAIR REPORT', {
    x: marginLeft,
    y: currentY,
    size: TITLE_SIZE,
    font: boldFont,
    color: BLACK,
  });

  currentY -= 8;
  page.drawText('CHP 108A (Rev. 7-05) OPI 062', {
    x: marginLeft,
    y: currentY,
    size: TEXT_SIZE,
    font: font,
    color: BLACK,
  });

  currentY -= 16;

  // === HEADER ROW WITH VEHICLE INFO ===
  const tableStartX = marginLeft;
  const tableWidth = PAGE_WIDTH - marginLeft - marginRight;
  const headerHeight = 16;

  // Draw header row border
  drawRect(page, tableStartX, currentY - headerHeight, tableWidth, headerHeight);

  // Divide the header into sections (combined Make/Model)
  const carrierWidth = 180;
  const unitWidth = 80;
  const yearWidth = 50;
  const makeModelWidth = 150;
  const licenseWidth = tableWidth - carrierWidth - unitWidth - yearWidth - makeModelWidth;

  let colX = tableStartX;

  // CARRIER NAME
  drawRect(page, colX, currentY - headerHeight, carrierWidth, headerHeight);
  page.drawText('CARRIER NAME', {
    x: colX + 3,
    y: currentY - 5,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.carrierName || '', {
    x: colX + 3,
    y: currentY - 13,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += carrierWidth;

  // UNIT NUMBER
  drawRect(page, colX, currentY - headerHeight, unitWidth, headerHeight);
  page.drawText('UNIT NUMBER', {
    x: colX + 3,
    y: currentY - 5,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.unitNumber || '', {
    x: colX + 3,
    y: currentY - 13,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += unitWidth;

  // YEAR
  drawRect(page, colX, currentY - headerHeight, yearWidth, headerHeight);
  page.drawText('YEAR', {
    x: colX + 3,
    y: currentY - 5,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.year || '', {
    x: colX + 3,
    y: currentY - 13,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += yearWidth;

  // MAKE/MODEL (combined)
  const fleetVehicle = FLEET_VEHICLES.find(v => v.unitNumber === vehicle.unitNumber);
  const model = fleetVehicle?.model || '';
  const makeModel = `${vehicle.make || ''} ${model}`.trim();

  drawRect(page, colX, currentY - headerHeight, makeModelWidth, headerHeight);
  page.drawText('MAKE/MODEL', {
    x: colX + 3,
    y: currentY - 5,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(makeModel, {
    x: colX + 3,
    y: currentY - 13,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });
  colX += makeModelWidth;

  // LICENSE NUMBER
  drawRect(page, colX, currentY - headerHeight, licenseWidth, headerHeight);
  page.drawText('LICENSE NUMBER', {
    x: colX + 3,
    y: currentY - 5,
    size: TINY_SIZE,
    font: font,
    color: BLUE,
  });
  page.drawText(vehicle.licenseNumber || '', {
    x: colX + 3,
    y: currentY - 13,
    size: SMALL_SIZE,
    font: font,
    color: BLACK,
  });

  currentY -= headerHeight;

  // === REPAIR TABLE ===
  // No gap - table starts immediately after header

  // Table columns
  const mileageWidth = 90;
  const dateWidth = 90;
  const repairWidth = tableWidth - mileageWidth - dateWidth;

  // Table header row with light gray background
  const tableHeaderHeight = 18;
  colX = tableStartX;

  // Draw gray background rectangles
  page.drawRectangle({
    x: tableStartX,
    y: currentY - tableHeaderHeight,
    width: tableWidth,
    height: tableHeaderHeight,
    color: LIGHT_GRAY,
  });

  // Draw borders and text
  drawRect(page, colX, currentY - tableHeaderHeight, mileageWidth, tableHeaderHeight);
  drawCenteredText(page, 'MILEAGE', colX, currentY - 12, mileageWidth, boldFont, HEADER_SIZE, BLACK);
  colX += mileageWidth;

  drawRect(page, colX, currentY - tableHeaderHeight, dateWidth, tableHeaderHeight);
  drawCenteredText(page, 'DATE', colX, currentY - 12, dateWidth, boldFont, HEADER_SIZE, BLACK);
  colX += dateWidth;

  drawRect(page, colX, currentY - tableHeaderHeight, repairWidth, tableHeaderHeight);
  drawCenteredText(page, 'REPAIR', colX, currentY - 12, repairWidth, boldFont, HEADER_SIZE, BLACK);

  currentY -= tableHeaderHeight;

  // Data rows - create 30 rows per page
  const rowHeight = 16;
  const maxRows = 30;
  const cellFontSize = 7;

  for (let i = 0; i < maxRows; i++) {
    colX = tableStartX;

    // Determine if this row has data from defItems
    const defItem = i < defItems.length ? defItems[i] : null;

    // Mileage column - editable text field
    drawRect(page, colX, currentY - rowHeight, mileageWidth, rowHeight);
    const mileageField = form.createTextField(`mileage_${startRowIndex + i}`);
    mileageField.setText(defItem?.mileage || '');
    mileageField.addToPage(page, {
      x: colX + 1,
      y: currentY - rowHeight + 3,
      width: mileageWidth - 2,
      height: rowHeight - 6,
      borderWidth: 0,
      textColor: BLACK,
    });
    mileageField.setFontSize(cellFontSize);
    colX += mileageWidth;

    // Date column - editable text field
    drawRect(page, colX, currentY - rowHeight, dateWidth, rowHeight);
    const dateField = form.createTextField(`date_${startRowIndex + i}`);
    dateField.setText(defItem?.date || '');
    dateField.addToPage(page, {
      x: colX + 1,
      y: currentY - rowHeight + 3,
      width: dateWidth - 2,
      height: rowHeight - 6,
      borderWidth: 0,
      textColor: BLACK,
    });
    dateField.setFontSize(cellFontSize);
    colX += dateWidth;

    // Repair column - editable text field
    drawRect(page, colX, currentY - rowHeight, repairWidth, rowHeight);
    const repairField = form.createTextField(`repair_${startRowIndex + i}`);
    repairField.setText(defItem?.itemDescription || '');
    repairField.addToPage(page, {
      x: colX + 1,
      y: currentY - rowHeight + 3,
      width: repairWidth - 2,
      height: rowHeight - 6,
      borderWidth: 0,
      textColor: BLACK,
    });
    repairField.setFontSize(cellFontSize);

    currentY -= rowHeight;
  }

  // === FOOTER ===
  const footerY = 12;
  page.drawText(`Page ${currentPageNum} of ${totalPageNum}`, {
    x: marginLeft,
    y: footerY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });

  page.drawText('Form may be reproduced privately—bulk supplies are not available from the CHP', {
    x: PAGE_WIDTH / 2 - 110,
    y: footerY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });

  page.drawText('Chp108A_0419.pdf', {
    x: PAGE_WIDTH - marginRight - 70,
    y: footerY,
    size: TINY_SIZE,
    font: font,
    color: GRAY,
  });
}
