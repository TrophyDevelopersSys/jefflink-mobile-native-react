export const brand = {
  name: 'JeffLink',
  assets: {
    logo: {
      primary: 'https://cdn.jefflinkcars.com/cloudflareStorage/brandAssets/jeffLinkLogo.svg',
    },
  },
} as const;

export type BrandAssetKey = keyof typeof brand.assets.logo;