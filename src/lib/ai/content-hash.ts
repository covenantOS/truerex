/**
 * Generates a simple hash of content for deduplication.
 * Normalizes text before hashing to catch near-duplicates.
 */
export function generateContentHash(text: string): string {
  // Normalize: lowercase, remove extra whitespace, strip punctuation
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Simple djb2 hash - fast, good enough for dedup
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 33) ^ normalized.charCodeAt(i);
  }

  return (hash >>> 0).toString(36);
}

/**
 * Check if similar content already exists for this business + platform.
 * Returns true if a duplicate is found.
 */
export async function checkDuplicate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  businessId: string,
  contentHash: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("content_posts")
    .select("id")
    .eq("business_id", businessId)
    .eq("content_hash", contentHash);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.limit(1);
  return (data?.length || 0) > 0;
}
