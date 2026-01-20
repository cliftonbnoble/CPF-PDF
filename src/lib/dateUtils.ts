import { addDays, format, parseISO, isValid, getMonth } from 'date-fns';
import { Month, MONTHS } from '@/types/inspection';

/**
 * Get the month abbreviation from a date string
 */
export function getMonthAbbreviation(dateStr: string): Month {
  if (!dateStr) return 'JAN';

  const date = parseISO(dateStr);
  if (!isValid(date)) return 'JAN';

  const monthIndex = getMonth(date); // 0-11
  return MONTHS[monthIndex];
}

/**
 * Calculate inspection dates starting from first date, adding 45 days for each subsequent inspection.
 * Returns an array of 12 inspection records with calculated dates and corresponding month labels.
 */
export function calculateInspectionDates(firstDateStr: string): Record<Month, string> {
  const result: Record<Month, string> = {} as Record<Month, string>;

  // Initialize all months with empty string
  for (const month of MONTHS) {
    result[month] = '';
  }

  if (!firstDateStr) {
    return result;
  }

  const firstDate = parseISO(firstDateStr);
  if (!isValid(firstDate)) {
    return result;
  }

  // Calculate 12 inspections, each 45 days apart
  // Assign each date to the month key that matches the actual calendar month
  let currentDate = firstDate;
  const usedMonths = new Set<Month>();

  for (let i = 0; i < 12; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const monthAbbrev = getMonthAbbreviation(dateStr);

    // If this month is already used, find the next available month
    let targetMonth = monthAbbrev;
    let monthIndex = MONTHS.indexOf(monthAbbrev);

    while (usedMonths.has(targetMonth)) {
      monthIndex = (monthIndex + 1) % 12;
      targetMonth = MONTHS[monthIndex];
    }

    result[targetMonth] = dateStr;
    usedMonths.add(targetMonth);

    // Add 45 days for next inspection
    if (i < 11) {
      currentDate = addDays(currentDate, 45);
    }
  }

  return result;
}

/**
 * Format a date string for display (MM/DD/YY format)
 */
export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return '';
  
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  
  return format(date, 'MM/dd/yy');
}

/**
 * Format a date string for PDF (MM/DD/YYYY format)
 */
export function formatDateForPDF(dateStr: string): string {
  if (!dateStr) return '';
  
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  
  return format(date, 'MM/dd/yyyy');
}

/**
 * Get the next inspection date info (for display)
 */
export function getNextInspectionInfo(currentMonth: Month, dates: Record<Month, string>): {
  nextMonth: Month | null;
  nextDate: string;
  daysUntil: number;
} | null {
  const currentIndex = MONTHS.indexOf(currentMonth);
  if (currentIndex === -1 || currentIndex === MONTHS.length - 1) {
    return null;
  }
  
  const nextMonth = MONTHS[currentIndex + 1];
  const nextDate = dates[nextMonth];
  
  if (!nextDate) {
    return null;
  }
  
  const today = new Date();
  const next = parseISO(nextDate);
  const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    nextMonth,
    nextDate,
    daysUntil,
  };
}
