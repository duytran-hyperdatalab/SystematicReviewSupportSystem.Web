/**
 * Check if the access token is expired based on its expiration date
 * 
 * @param expiresAt The expiration date string (ISO format)
 * @returns boolean true if expired or null, false otherwise
 */
export const isTokenExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return true;
  
  const expiryDate = new Date(expiresAt);
  const currentDate = new Date();
  
  // Return true if current time is greater than expiry time
  return currentDate > expiryDate;
};
