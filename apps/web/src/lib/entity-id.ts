const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function createEntityRouteId(value: string): string {
  let hash = FNV_OFFSET_BASIS;

  for (const character of value.normalize("NFKC")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, FNV_PRIME);
  }

  return `entity-${(hash >>> 0).toString(36)}`;
}
