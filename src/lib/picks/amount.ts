export function parsePicksAmount(value: string | number | bigint): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error("PICKS amount must be an integer.");
    }
    return BigInt(value);
  }
  if (!/^\d+$/.test(value)) {
    throw new Error("PICKS amount must be a positive integer string.");
  }
  return BigInt(value);
}
