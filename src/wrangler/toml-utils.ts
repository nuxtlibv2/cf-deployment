// This helper is here to safely place user text inside quoted TOML values.
// It escapes quotes and backslashes so the final file stays valid TOML.
// We need this to prevent malformed output when names or IDs include special characters.
export function escapeTomlString(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}
