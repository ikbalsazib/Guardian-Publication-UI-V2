export function serializeJsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export function parseJsonLd(serialized: string): unknown {
  return JSON.parse(serialized);
}
