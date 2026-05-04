/**
 * Convert YYYY-MM-DD string to ISO 8601 DateTime for .NET DateTimeOffset
 */
export function toISODateTime(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  
  try {
    // Input: "2024-03-15" -> Output: "2024-03-15T00:00:00.000Z"
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return null;
  }
}

/**
 * Convert ISO 8601 DateTime from .NET to YYYY-MM-DD for input[type="date"]
 */
export function toDateInputValue(isoString: string | null | undefined): string {
  if (!isoString) return "";
  
  try {
    // Input: "2024-03-15T00:00:00.000Z" -> Output: "2024-03-15"
    return new Date(isoString).toISOString().split('T')[0];
  } catch (error) {
    console.error('Invalid ISO date:', isoString);
    return "";
  }
}

/**
 * Format date for display (optional - for showing to user)
 */
export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return "Not set";
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return "Invalid date";
  }
}