export const fonts = {
  family: {
    sans: 'Fabriga',
    regular: 'Fabriga',
    light: 'Fabriga Light',
    bold: 'Fabriga Bold',
  },
  stack: {
    sans: 'Fabriga, ui-sans-serif, system-ui, sans-serif',
  },
  source: {
    regular: {
      woff2: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabriga.woff2',
      woff: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabriga.woff',
      ttf: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabriga.ttf',
    },
    light: {
      woff2: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabrigaLight.woff2',
      woff: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabrigaLight.woff',
      ttf: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabrigaLight.ttf',
    },
    bold: {
      woff2: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabrigaBold.woff2',
      woff: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/fabrigaBold.woff',
      ttf: 'https://cdn.jefflinkcars.com/cloudflareStorage/fonts/Fabriga%20Bold.ttf',
    },
  },
} as const;

export type FontKey = keyof typeof fonts.family;