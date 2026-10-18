const SCHEMA_ORG = 'https://schema.org';

export function mapProductAvailability(quantity?: number | null, status?: string | null): string {
  const normalizedStatus = status?.toLowerCase()?.trim();

  if (normalizedStatus === 'discontinued') {
    return `${SCHEMA_ORG}/Discontinued`;
  }
  if (normalizedStatus === 'preorder' || normalizedStatus === 'pre-order') {
    return `${SCHEMA_ORG}/PreOrder`;
  }
  if (normalizedStatus === 'backorder' || normalizedStatus === 'back-order') {
    return `${SCHEMA_ORG}/BackOrder`;
  }

  return (quantity ?? 0) > 0 ? `${SCHEMA_ORG}/InStock` : `${SCHEMA_ORG}/OutOfStock`;
}
