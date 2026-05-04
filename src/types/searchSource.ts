export interface SearchSourceDto {
  /** 
   * Unique ID of the search source. 
   * - Leave null/undefined for new sources.
   * - Provide existing ID to update.
   */
  sourceId?: string; 
  
  /** 
   * ID of the template/master source if applicable (e.g., from a predefined list).
   * If provided and 'name' is empty, the system will use the master source's name.
   */
  masterSourceId?: string;

  /** ID of the project this source belongs to. (Required) */
  projectId: string;

  /** Display name of the source (e.g., "PubMed"). (Required, Max 500 chars) */
  name: string;
}
