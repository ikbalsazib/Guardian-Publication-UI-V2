const SCHEMA_ORG = 'https://schema.org';

export function mapBookFormat(bindType?: string | null): string | undefined {
  if (!bindType?.trim()) {
    return undefined;
  }

  const normalized = bindType.trim().toLowerCase();

  if (normalized.includes('hardcover') || normalized.includes('hard cover') || normalized.includes('হার্ডকভার')) {
    return `${SCHEMA_ORG}/Hardcover`;
  }

  if (normalized.includes('paperback') || normalized.includes('paper back') || normalized.includes('পেপারব্যাক')) {
    return `${SCHEMA_ORG}/Paperback`;
  }

  return undefined;
}
