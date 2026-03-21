export const brand = {
  name: 'JeffLink',
  assets: {
    logo: {
      /** Default / primary logo (works on any background) */
      primary: 'https://cdn.jefflinkcars.com/cloudflareStorage/brandAssets/jeffLinkLogo.svg',
      /** White logo for dark backgrounds */
      white: 'https://cdn.jefflinkcars.com/cloudflareStorage/brandAssets/jeffLinkLogoWhite.svg',
      /** Dark logo for light backgrounds */
      dark: 'https://cdn.jefflinkcars.com/cloudflareStorage/brandAssets/jeffLinkLogo.svg',
    },
  },
} as const;

export type BrandAssetKey = keyof typeof brand.assets.logo;

/**
 * Returns the correct logo URL for the given theme mode.
 * Dark theme → white logo, Light theme → dark/primary logo.
 */
export function getThemedLogo(isDark: boolean): string {
  return isDark ? brand.assets.logo.white : brand.assets.logo.dark;
}