// Date formatting utilities for display

/**
 * Format a date string or null value to a short display format
 * @param dateString - ISO date string or null
 * @returns Formatted date string or "—" for null values
 * @example "Feb 25, 2026"
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format a date to a relative time string
 * @param dateString - ISO date string
 * @returns Relative time string
 * @example "2 days ago", "Today", "Yesterday"
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  return formatDate(dateString);
};
