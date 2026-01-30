import { format, formatDistanceToNow } from 'date-fns';

const INVALID = '—';

function toDate(dateString: string | Date | null | undefined): Date | null {
  if (dateString == null || dateString === '') return null;
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format date to readable string. Returns '—' for null, undefined, or invalid dates.
 */
export const formatDate = (dateString: string | Date | null | undefined, formatStr: string = 'MMM d, yyyy'): string => {
  const date = toDate(dateString);
  return date ? format(date, formatStr) : INVALID;
};

/**
 * Format date as relative time (e.g., "2 hours ago"). Returns '—' for null, undefined, or invalid dates.
 */
export const formatRelativeDate = (dateString: string | Date | null | undefined): string => {
  const date = toDate(dateString);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : INVALID;
};

/**
 * Format date with time. Returns '—' for null, undefined, or invalid dates.
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  return formatDate(dateString, 'MMM d, yyyy h:mm a');
};
