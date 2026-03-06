/**
 * Backward-compatible re-exports from the token registry.
 * New code should import directly from "./tokens".
 */
export { semanticLight as lightTheme, semanticDark as darkTheme } from "./tokens";
export type { SemanticTokens as AppTheme } from "./tokens";
