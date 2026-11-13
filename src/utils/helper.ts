import { parse, format } from 'date-fns';

export function formatDateForAPI  (dateString: string) {
  if (!dateString) return new Date().toISOString();
  
  try {
    // Parse MM/DD/YYYY format
    const date = parse(dateString, 'MM/dd/yyyy', new Date());
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date().toISOString();
  }
};

export function formatIOSDateToDMY(isoDate: string): string {
  if (!isoDate) return '';

  const date = new Date(isoDate);

  if (isNaN(date.getTime())) return ''; // invalid date fallback

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}