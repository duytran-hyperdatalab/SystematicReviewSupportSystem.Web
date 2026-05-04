/**
 * Increment patch version automatically (1.0.0 → 1.0.1)
 */
export function incrementPatchVersion(version: string): string {
  const parts = version.split('.');
  const major = parseInt(parts[0] || '1', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const patch = parseInt(parts[2] || '0', 10);
  
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * Get next version from current version
 * @param currentVersion - Current highest version (e.g., "1.0.0" or "0.0.0" if none)
 * @returns Next version to use
 */
export function getNextVersion(currentVersion?: string): string {
  if (!currentVersion || currentVersion === '0.0.0') {
    // No protocols yet, start from 1.0.0
    return '1.0.0';
  }
  
  // Increment patch version
  return incrementPatchVersion(currentVersion);
}