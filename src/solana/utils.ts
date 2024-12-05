/**
 * Rounds a value to SOL's decimal precision and ensures it's a valid number.
 * @param value - The value to round.
 * @returns The rounded value.
 */
export function toSolDecimals(value: number): number {
  const decimals: number = 9;
  if (isNaN(value)) {
    throw new Error("Invalid number: value is not a number");
  }
  if (!Number.isFinite(value)) {
    throw new Error("Invalid number: value is not finite");
  }

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
