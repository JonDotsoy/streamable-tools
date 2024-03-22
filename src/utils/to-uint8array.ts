export const toArrayBuffer = (value: unknown) => {
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === "string") return new TextEncoder().encode(value);
  if (Array.isArray(value)) return new Uint8Array(value);
  throw new Error(`Invalid chunk type`);
};
