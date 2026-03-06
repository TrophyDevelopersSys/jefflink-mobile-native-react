/**
 * useThemeTokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns the resolved semantic token object for the active colour scheme.
 *
 * PRIMARY USE CASE: icon `color` props (e.g. lucide-react-native, @expo/vector-icons)
 * that cannot accept Tailwind class strings.
 *
 *   const tokens = useThemeTokens();
 *   <MapPin color={tokens.textMuted} />
 *
 * For all view, text, and layout styling use Tailwind utility classes instead:
 *   bg-background  bg-surface  bg-card  bg-accent  bg-primary
 *   text-text  text-text-muted  text-accent  text-danger  text-warning
 *   border-border
 *
 * This hook reads from the NativeWind colour scheme — no React context overhead.
 * It does NOT subscribe to re-renders beyond the initial scheme change.
 */
import { useColorScheme } from "nativewind";
import { semanticLight, semanticDark, type SemanticTokens } from "./tokens";

export function useThemeTokens(): SemanticTokens {
  const { colorScheme } = useColorScheme();
  // colorScheme can be null on Android before AppearanceModule initialises.
  return (colorScheme ?? "light") === "dark" ? semanticDark : semanticLight;
}
