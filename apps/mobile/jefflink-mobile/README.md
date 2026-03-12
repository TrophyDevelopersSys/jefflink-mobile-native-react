# jefflink-mobile

This project is a React Native application that utilizes TypeScript and includes support for importing SVG files. Below are the instructions and details for setting up and running the project.

## Project Structure

```
jefflink-mobile
├── src
│   ├── components
│   │   └── hero
│   │       └── HeroCarousel.tsx
│   ├── assets
│   │   ├── icons
│   │   │   └── hyundai.svg
│   │   └── images
│   ├── types
│   │   └── svg.d.ts
├── metro.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

1. **Type Declaration for SVG Files**: Create the `src/types/svg.d.ts` file to declare a module for SVG files. This allows TypeScript to recognize SVG imports as React components.

2. **Metro Bundler Configuration**: Create or update the `metro.config.js` file to configure Metro Bundler to handle SVG imports using `react-native-svg-transformer`. This involves modifying the transformer and resolver settings.

3. **SVG File**: Ensure that the SVG file (`hyundai.svg`) is located at `src/assets/icons/hyundai.svg`. This file will be imported in the components.

4. **Restart Expo**: After making the above changes, restart the Expo server with cache clearing using the command:
   ```
   npx expo start -c
   ```

5. **Troubleshooting**: If you encounter issues, try removing the `node_modules` directory, reinstalling dependencies, and restarting Expo with cache clearing.

## Dependencies

Make sure to include the necessary dependencies in your `package.json` for React Native and any additional libraries you may need for your project.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.