import { addDays, format, parseISO, isValid } from 'date-fns';
import { Month, MONTHS } from '@/types/inspection';

/**
 * Calculate inspection dates starting from January date, adding 45 days for each subsequent month.
 * Returns a map of month -> calculated date string.
 */
export function calculateInspectionDates(januaryDateStr: string): Record<Month, string> {
  const result: Record<Month, string> = {} as Record<Month, string>;
  
  // Initialize all months with empty string
  for (const month of MONTHS) {
    result[month] = '';
  }
  
  if (!januaryDateStr) {
    return result;
  }
  
  const januaryDate = parseISO(januaryDateStr);
  if (!isValid(januaryDate)) {
    return result;
  }
  
  // January gets the original date
  result.JAN = januaryDateStr;
  
  // Calculate subsequent months by adding 45 days for each
  let currentDate = januaryDate;
  
  for (let i = 1; i < MONTHS.length; i++) {
    currentDate = addDays(currentDate, 45);
    result[MONTHS[i]] = format(currentDate, 'yyyy-MM-dd');
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
